import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import {
  CompletionTriggerSource,
  HabitLogStatus,
  HabitTrackingType,
} from '../domain/enums/domain.enums';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  const userId = '8e42d9f7-36f5-4d1c-8f3d-90ddf1fb878f';
  const habitId = '4d2b5e07-3209-4d94-8d7b-1db0b8a64152';

  const habitLogRepo = {
    create: jest.fn(),
    findAllByHabitId: jest.fn(),
    findSummaryByHabitId: jest.fn(),
  };

  const habitsService = {
    getOwnedHabitOrThrow: jest.fn(),
  };

  const analyticsService = {
    recordActivity: jest.fn(),
  };

  let progressService: ProgressService;

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    habitLogRepo.create.mockImplementation(({ habitId: hid, ...rest }) => ({
      id: 'log-1',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      habitId: hid,
      ...rest,
    }));

    progressService = new ProgressService(
      habitLogRepo as never,
      habitsService as never,
      analyticsService as never,
    );
  });

  it('rejects PARTIAL for simple check-in habits when partial completion is disabled', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue({
      id: habitId,
      trackingType: HabitTrackingType.SIMPLE_CHECKIN,
      allowPartialCompletion: false,
    });

    await expect(
      progressService.createHabitLog(userId, habitId, {
        status: HabitLogStatus.PARTIAL,
        completedAt: '2026-03-23T09:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts PARTIAL for simple check-in habits when partial completion is enabled', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue({
      id: habitId,
      trackingType: HabitTrackingType.SIMPLE_CHECKIN,
      allowPartialCompletion: true,
    });

    const result = await progressService.createHabitLog(userId, habitId, {
      status: HabitLogStatus.PARTIAL,
      completedAt: '2026-03-23T09:00:00.000Z',
      triggerSource: CompletionTriggerSource.SELF_INITIATED,
    });

    expect(result.status).toBe(HabitLogStatus.PARTIAL);
    expect(result.actualValue).toBeNull();
    expect(analyticsService.recordActivity).toHaveBeenCalledWith(
      userId,
      'habit.logged',
    );
  });

  it.each([
    { actualValue: 10, expected: HabitLogStatus.DONE },
    { actualValue: 6, expected: HabitLogStatus.PARTIAL },
    { actualValue: 3, expected: HabitLogStatus.NOT_DONE },
  ])(
    'derives $expected for quantitative logs',
    async ({ actualValue, expected }) => {
      habitsService.getOwnedHabitOrThrow.mockResolvedValue({
        id: habitId,
        trackingType: HabitTrackingType.QUANTITATIVE,
        allowPartialCompletion: true,
        minimumSuccessValue: 5,
        targetValue: 10,
      });

      const result = await progressService.createHabitLog(userId, habitId, {
        actualValue,
        completedAt: '2026-03-23T09:00:00.000Z',
      });

      expect(result.status).toBe(expected);
      expect(result.actualValue).toBe(actualValue);
    },
  );

  it('builds a progress summary from stored logs', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue({
      id: habitId,
      trackingType: HabitTrackingType.SIMPLE_CHECKIN,
      allowPartialCompletion: true,
      scheduleDays: [{ weekday: 'MONDAY' }],
      cues: [{ id: 'cue-1' }],
    });
    habitLogRepo.findSummaryByHabitId.mockResolvedValue([
      {
        status: HabitLogStatus.DONE,
        triggerSource: CompletionTriggerSource.SELF_INITIATED,
        completedAt: new Date('2026-03-23T09:00:00.000Z'),
        loggedAt: new Date('2026-03-23T09:05:00.000Z'),
      },
      {
        status: HabitLogStatus.PARTIAL,
        triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
        completedAt: new Date('2026-03-22T09:00:00.000Z'),
        loggedAt: new Date('2026-03-22T09:05:00.000Z'),
      },
      {
        status: HabitLogStatus.NOT_DONE,
        triggerSource: null,
        completedAt: new Date('2026-03-21T09:00:00.000Z'),
        loggedAt: new Date('2026-03-21T09:05:00.000Z'),
      },
    ]);

    const summary = await progressService.getProgressSummary(userId, habitId);

    expect(summary).toEqual({
      totalLogs: 3,
      doneCount: 1,
      partialCount: 1,
      notDoneCount: 1,
      lastLoggedAt: '2026-03-23T09:05:00.000Z',
      lastCompletedAt: '2026-03-23T09:00:00.000Z',
      completionByTriggerSource: {
        [CompletionTriggerSource.SELF_INITIATED]: 1,
        [CompletionTriggerSource.REMINDER_TRIGGERED]: 1,
        [CompletionTriggerSource.MANUAL_ENTRY]: 0,
      },
      selfInitiatedCount: 1,
      reminderTriggeredCount: 0,
      unknownSourceCount: 0,
      selfInitiatedRate: 1,
      reminderDependenceRate: 0,
      completionWithoutReminderRate: 1,
    });
  });
});
