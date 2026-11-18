import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { HabitLogEntity } from '../domain/entities/habit-log.entity';
import {
  CompletionTriggerSource,
  HabitLogStatus,
} from '../domain/enums/domain.enums';
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import {
  HABIT_LOG_REPOSITORY,
  HabitLogDayConflictError,
} from '../domain/repositories/habit-log.repository';
import { HabitStrengthRules } from '../domain/rules/habit-strength.rules';
import { HabitsService } from '../habits/habits.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { UpdateHabitLogDto } from './dto/update-habit-log.dto';
import { ProgressSummary } from './interfaces/progress-summary.interface';
import { HabitStrengthSignals } from './foundation/habit-strength/habit-strength.interface';
import {
  awardCompletionRewardsSafely,
  ENGAGEMENT_SERVICE,
  type IEngagementService,
} from '../engagement/engagement.constants';
import { appDateOf, parseClientTimestamp } from '../shared/time';
import type { IReminderRepository } from '../domain/repositories/reminder.repository';
import { REMINDER_REPOSITORY } from '../domain/repositories/reminder.repository';
import { TriggerSourceRules } from '../domain/rules/trigger-source.rules';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    @Inject(HABIT_LOG_REPOSITORY)
    private readonly habitLogRepo: IHabitLogRepository,
    private readonly habitsService: HabitsService,
    private readonly analyticsService: AnalyticsService,
    @Inject(ENGAGEMENT_SERVICE)
    private readonly engagementService: IEngagementService,
    @Inject(REMINDER_REPOSITORY)
    private readonly reminderRepo: IReminderRepository,
  ) {}

  /**
   * Records the habit's value for the application-timezone day of
   * `completedAt`. Each habit has at most one log per day: when that day
   * already has a log, the larger value is kept. A retried request or a
   * second device therefore never duplicates or lowers the day's value; use
   * PATCH to change it deliberately.
   */
  async createHabitLog(
    userId: string,
    habitId: string,
    createHabitLogDto: CreateHabitLogDto,
  ) {
    const habit = await this.habitsService.getOwnedHabitOrThrow(
      userId,
      habitId,
    );
    const logData = this.buildLogPayload(habit, createHabitLogDto);

    let habitLog: HabitLogEntity;
    let previousStatus: string | null = null;

    const existing = await this.findLogOnDay(habitId, logData.completedAt);
    if (existing) {
      previousStatus = existing.status;
      habitLog = await this.raiseDayValue(habit, existing, logData.actualValue);
    } else {
      try {
        habitLog = await this.habitLogRepo.create({
          habitId,
          ...logData,
          ...(await this.classifyTriggerSource(habitId, logData.completedAt)),
          ...(await this.habitsService.captureContext(
            userId,
            habit,
            logData.completedAt,
          )),
        });
      } catch (error) {
        // A concurrent request created the day's log first.
        if (!(error instanceof HabitLogDayConflictError)) throw error;
        const raced = await this.findLogOnDay(habitId, logData.completedAt);
        if (!raced) throw error;
        previousStatus = raced.status;
        habitLog = await this.raiseDayValue(habit, raced, logData.actualValue);
      }
    }

    if (habitLog.status === 'DONE' && previousStatus !== 'DONE') {
      await this.awardRewardsSafely(userId, habitId, habitLog);
    }

    await this.analyticsService.recordActivity(userId, 'habit_logged');
    return habitLog;
  }

  async updateHabitLog(
    userId: string,
    habitId: string,
    logId: string,
    dto: UpdateHabitLogDto,
  ) {
    const habit = await this.habitsService.getOwnedHabitOrThrow(
      userId,
      habitId,
    );
    const log = await this.habitLogRepo.findById(logId);
    if (!log || log.habitId !== habitId) {
      throw new NotFoundException('Log not found');
    }
    const updatedLog = await this.habitLogRepo.update(logId, {
      status: this.statusFor(habit, dto.actualValue),
      actualValue: dto.actualValue,
    });

    if (log.status !== 'DONE' && updatedLog.status === 'DONE') {
      await this.awardRewardsSafely(userId, habitId, updatedLog);
    }

    return updatedLog;
  }

  /**
   * What prompted the completion, decided on the server from delivered
   * reminders (TriggerSourceRules); the client's own claim is not used.
   */
  private async classifyTriggerSource(habitId: string, completedAt: Date) {
    const lastDeliveredReminder =
      await this.reminderRepo.findLatestDeliveredForHabitBetween(
        habitId,
        TriggerSourceRules.attributionWindowStart(completedAt),
        completedAt,
      );
    return TriggerSourceRules.classify({
      completedAt,
      now: new Date(),
      lastDeliveredReminder:
        lastDeliveredReminder?.sentAt != null
          ? {
              id: lastDeliveredReminder.id,
              sentAt: new Date(lastDeliveredReminder.sentAt),
            }
          : null,
    });
  }

  /** DONE once the value reaches the habit's minimum target. */
  private statusFor(habit: { minimumTarget: number }, actualValue: number) {
    return actualValue >= habit.minimumTarget
      ? HabitLogStatus.DONE
      : HabitLogStatus.NOT_DONE;
  }

  private async findLogOnDay(habitId: string, completedAt: Date) {
    const [log] = await this.habitLogRepo.findLatestByHabitIdsForDate(
      [habitId],
      completedAt,
    );
    return log ?? null;
  }

  /** Keeps the larger of the stored and the newly sent value for the day. */
  private async raiseDayValue(
    habit: { minimumTarget: number },
    existing: { id: string; actualValue: number | null },
    actualValue: number,
  ): Promise<HabitLogEntity> {
    const value = Math.max(existing.actualValue ?? 0, actualValue);
    return this.habitLogRepo.update(existing.id, {
      status: this.statusFor(habit, value),
      actualValue: value,
    });
  }

  private awardRewardsSafely(
    userId: string,
    habitId: string,
    log: HabitLogEntity,
  ) {
    return awardCompletionRewardsSafely(this.engagementService, this.logger, {
      userId,
      habitId,
      completedAt: log.completedAt,
      logId: log.id,
    });
  }

  async deleteHabitLog(userId: string, habitId: string, logId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    const log = await this.habitLogRepo.findById(logId);
    if (!log || log.habitId !== habitId) {
      throw new NotFoundException('Log not found');
    }
    await this.habitLogRepo.delete(logId);
  }

  async listHabitLogs(userId: string, habitId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    return this.habitLogRepo.findAllByHabitId(habitId);
  }

  async getProgressSummary(
    userId: string,
    habitId: string,
  ): Promise<ProgressSummary> {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    const logs = await this.habitLogRepo.findSummaryByHabitId(habitId);

    const summary: ProgressSummary = {
      totalLogs: logs.length,
      doneCount: 0,
      notDoneCount: 0,
      lastLoggedAt: logs[0]?.loggedAt.toISOString() ?? null,
      lastCompletedAt: logs[0]?.completedAt.toISOString() ?? null,
      completionByTriggerSource: {
        [CompletionTriggerSource.SELF_INITIATED]: 0,
        [CompletionTriggerSource.REMINDER_TRIGGERED]: 0,
        [CompletionTriggerSource.UNKNOWN]: 0,
      },
      selfInitiatedCount: 0,
      reminderTriggeredCount: 0,
      unknownSourceCount: 0,
      selfInitiatedRate: 0,
      reminderDependenceRate: 0,
      completionWithoutReminderRate: 0,
    };

    for (const log of logs) {
      if (log.status === 'DONE') summary.doneCount += 1;
      else summary.notDoneCount += 1;
      summary.completionByTriggerSource[log.triggerSource] += 1;
    }

    // Phase 4A: compute source breakdown from DONE logs only
    const doneLogs = logs.filter((l) => l.status === 'DONE');
    const doneTotal = doneLogs.length;

    summary.selfInitiatedCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.SELF_INITIATED,
    ).length;
    summary.reminderTriggeredCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.REMINDER_TRIGGERED,
    ).length;
    summary.unknownSourceCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.UNKNOWN,
    ).length;

    if (doneTotal > 0) {
      summary.selfInitiatedRate =
        Math.round((summary.selfInitiatedCount / doneTotal) * 1000) / 1000;
      summary.reminderDependenceRate =
        Math.round((summary.reminderTriggeredCount / doneTotal) * 1000) / 1000;
      summary.completionWithoutReminderRate =
        Math.round(
          ((summary.selfInitiatedCount + summary.unknownSourceCount) /
            doneTotal) *
            1000,
        ) / 1000;
    }

    return summary;
  }

  async getHabitStrengthSignals(
    userId: string,
    habitId: string,
  ): Promise<HabitStrengthSignals> {
    const habit = await this.habitsService.getOwnedHabitOrThrow(
      userId,
      habitId,
    );
    const logs = await this.habitLogRepo.findSummaryByHabitId(habitId);

    return HabitStrengthRules.compute({
      habitId,
      logs,
      scheduledWeekdayCount: habit.scheduleDays.length,
      hasCueConfiguration: habit.cues.length > 0,
      hasMotivationProfile: habit.motivationProfile !== null,
    });
  }

  private buildLogPayload(
    habit: {
      minimumTarget: number;
      targetValue: number;
    },
    createHabitLogDto: CreateHabitLogDto,
  ) {
    const completedAt = parseClientTimestamp(createHabitLogDto.completedAt);
    if (Number.isNaN(completedAt.getTime())) {
      throw new BadRequestException('completedAt is not a valid timestamp');
    }

    // Reject logs for a later calendar day than today. Both days are taken in
    // the application timezone, so this does not depend on the host timezone.
    const now = new Date();
    if (appDateOf(completedAt) > appDateOf(now)) {
      throw new BadRequestException('Cannot log habits for future dates');
    }

    const loggedAt = createHabitLogDto.loggedAt
      ? parseClientTimestamp(createHabitLogDto.loggedAt)
      : now;
    if (Number.isNaN(loggedAt.getTime())) {
      throw new BadRequestException('loggedAt is not a valid timestamp');
    }

    return {
      status: this.statusFor(habit, createHabitLogDto.actualValue),
      actualValue: createHabitLogDto.actualValue,
      completedAt,
      loggedAt,
    };
  }
}
