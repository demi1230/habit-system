import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  CompletionTriggerSource,
  HabitLogStatus,
  HabitTrackingType,
} from '../domain/enums/domain.enums';
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import { HabitStrengthRules } from '../domain/rules/habit-strength.rules';
import { HabitsService } from '../habits/habits.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import {
  ProgressSummary,
  progressStatusCountKeyMap,
} from './interfaces/progress-summary.interface';
import { HabitStrengthSignals } from './foundation/habit-strength/habit-strength.interface';

@Injectable()
export class ProgressService {
  constructor(
    @Inject(HABIT_LOG_REPOSITORY)
    private readonly habitLogRepo: IHabitLogRepository,
    private readonly habitsService: HabitsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

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

    const habitLog = await this.habitLogRepo.create({ habitId, ...logData });

    await this.analyticsService.recordActivity(userId, 'habit.logged');
    return habitLog;
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
      partialCount: 0,
      notDoneCount: 0,
      lastLoggedAt: logs[0]?.loggedAt.toISOString() ?? null,
      lastCompletedAt: logs[0]?.completedAt.toISOString() ?? null,
      completionByTriggerSource: {
        [CompletionTriggerSource.SELF_INITIATED]: 0,
        [CompletionTriggerSource.REMINDER_TRIGGERED]: 0,
        [CompletionTriggerSource.MANUAL_ENTRY]: 0,
      },
      selfInitiatedCount: 0,
      reminderTriggeredCount: 0,
      unknownSourceCount: 0,
      selfInitiatedRate: 0,
      reminderDependenceRate: 0,
      completionWithoutReminderRate: 0,
    };

    for (const log of logs) {
      summary[progressStatusCountKeyMap[log.status]] += 1;
      if (log.triggerSource) {
        summary.completionByTriggerSource[log.triggerSource] += 1;
      }
    }

    // Phase 4A: compute source breakdown from DONE logs only
    const doneLogs = logs.filter((l) => l.status === HabitLogStatus.DONE);
    const doneTotal = doneLogs.length;

    summary.selfInitiatedCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.SELF_INITIATED,
    ).length;
    summary.reminderTriggeredCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.REMINDER_TRIGGERED,
    ).length;
    summary.unknownSourceCount = doneLogs.filter(
      (l) =>
        !l.triggerSource ||
        l.triggerSource === CompletionTriggerSource.MANUAL_ENTRY,
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
      trackingType: HabitTrackingType;
      allowPartialCompletion: boolean;
      minimumSuccessValue: number | null;
      targetValue: number | null;
    },
    createHabitLogDto: CreateHabitLogDto,
  ) {
    const completedAt = new Date(createHabitLogDto.completedAt);
    const loggedAt = createHabitLogDto.loggedAt
      ? new Date(createHabitLogDto.loggedAt)
      : new Date();

    if (habit.trackingType === HabitTrackingType.SIMPLE_CHECKIN) {
      if (!createHabitLogDto.status) {
        throw new BadRequestException(
          'SIMPLE_CHECKIN habit logs require a direct status value.',
        );
      }

      if (createHabitLogDto.actualValue !== undefined) {
        throw new BadRequestException(
          'SIMPLE_CHECKIN habit logs must not include actualValue.',
        );
      }

      if (
        !habit.allowPartialCompletion &&
        createHabitLogDto.status === HabitLogStatus.PARTIAL
      ) {
        throw new BadRequestException(
          'PARTIAL is not allowed when allowPartialCompletion is false.',
        );
      }

      return {
        status: createHabitLogDto.status,
        actualValue: null,
        completedAt,
        loggedAt,
        triggerSource: createHabitLogDto.triggerSource ?? null,
      };
    }

    if (createHabitLogDto.status) {
      throw new BadRequestException(
        'QUANTITATIVE habit logs must not submit status directly.',
      );
    }

    if (createHabitLogDto.actualValue === undefined) {
      throw new BadRequestException(
        'QUANTITATIVE habit logs require actualValue.',
      );
    }

    if (habit.minimumSuccessValue === null || habit.targetValue === null) {
      throw new BadRequestException(
        'QUANTITATIVE habits must define minimumSuccessValue and targetValue before logging.',
      );
    }

    return {
      status: this.deriveQuantitativeStatus(
        createHabitLogDto.actualValue,
        habit.minimumSuccessValue,
        habit.targetValue,
      ),
      actualValue: createHabitLogDto.actualValue,
      completedAt,
      loggedAt,
      triggerSource: createHabitLogDto.triggerSource ?? null,
    };
  }

  private deriveQuantitativeStatus(
    actualValue: number,
    minimumSuccessValue: number,
    targetValue: number,
  ) {
    if (actualValue >= targetValue) return HabitLogStatus.DONE;
    if (actualValue >= minimumSuccessValue) return HabitLogStatus.PARTIAL;
    return HabitLogStatus.NOT_DONE;
  }
}
