import { BadRequestException, Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  CompletionTriggerSource,
  HabitLogStatus,
  HabitTrackingType,
} from '../common/enums/domain.enums';
import { HabitsService } from '../habits/habits.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import {
  ProgressSummary,
  progressStatusCountKeyMap,
} from './interfaces/progress-summary.interface';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly habitsService: HabitsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async createHabitLog(
    userId: string,
    habitId: string,
    createHabitLogDto: CreateHabitLogDto,
  ) {
    const habit = await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    const logData = this.buildLogPayload(habit, createHabitLogDto);

    const habitLog = await this.prisma.habitLog.create({
      data: {
        habitId,
        ...logData,
      },
    });

    await this.analyticsService.recordActivity(userId, 'habit.logged');

    return habitLog;
  }

  async listHabitLogs(userId: string, habitId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);

    return this.prisma.habitLog.findMany({
      where: { habitId },
      orderBy: [{ completedAt: 'desc' }, { loggedAt: 'desc' }],
    });
  }

  async getProgressSummary(userId: string, habitId: string): Promise<ProgressSummary> {
    const habit = await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    const logs = await this.prisma.habitLog.findMany({
      where: { habitId },
      orderBy: [{ completedAt: 'desc' }, { loggedAt: 'desc' }],
    });

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
    };

    for (const log of logs) {
      summary[progressStatusCountKeyMap[log.status]] += 1;

      if (log.triggerSource) {
        summary.completionByTriggerSource[log.triggerSource] += 1;
      }
    }

    return summary;
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

    if (
      habit.minimumSuccessValue === null ||
      habit.targetValue === null
    ) {
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
    if (actualValue >= targetValue) {
      return HabitLogStatus.DONE;
    }

    if (actualValue >= minimumSuccessValue) {
      return HabitLogStatus.PARTIAL;
    }

    return HabitLogStatus.NOT_DONE;
  }
}
