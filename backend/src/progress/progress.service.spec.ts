import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import {
  CompletionTriggerSource,
  HabitLogStatus,
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

  const engagementService = {
    awardCompletionRewards: jest.fn(),
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
      engagementService as never,
    );
  });

  it.each([
    { actualValue: 10, minimumTarget: 5, expected: HabitLogStatus.DONE },
    { actualValue: 5, minimumTarget: 5, expected: HabitLogStatus.DONE },
    { actualValue: 3, minimumTarget: 5, expected: HabitLogStatus.NOT_DONE },
  ])(
    'derives $expected when actualValue=$actualValue and minimumTarget=$minimumTarget',
    async ({ actualValue, minimumTarget, expected }) => {
      habitsService.getOwnedHabitOrThrow.mockResolvedValue({
        id: habitId,
        measurementUnit: 'km',
        minimumTarget,
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

  it('creates habit log and records analytics event', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue({
      id: habitId,
      measurementUnit: 'glasses',
      minimumTarget: 4,
      targetValue: 8,
    });

    await progressService.createHabitLog(userId, habitId, {
      actualValue: 6,
      completedAt: '2026-03-23T09:00:00.000Z',
      triggerSource: CompletionTriggerSource.SELF_INITIATED,
    });

    expect(analyticsService.recordActivity).toHaveBeenCalledWith(
      userId,
      'habit_logged',
    );
  });

  describe('completedAt and the application-timezone day', () => {
    beforeEach(() => {
      habitsService.getOwnedHabitOrThrow.mockResolvedValue({
        id: habitId,
        measurementUnit: 'times',
        minimumTarget: 1,
        targetValue: 1,
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('accepts an early-morning Ulaanbaatar completion sent without an offset', async () => {
      // 07:45 on 2026-03-24 in Ulaanbaatar; still 2026-03-23 in UTC.
      jest.useFakeTimers({ now: new Date('2026-03-23T23:45:00.000Z') });

      const result = await progressService.createHabitLog(userId, habitId, {
        actualValue: 1,
        completedAt: '2026-03-24T07:30:00',
      });

      // Interpreted as Ulaanbaatar wall-clock time, stored as the real instant.
      expect(result.completedAt).toEqual(new Date('2026-03-23T23:30:00.000Z'));
    });

    it('accepts a completion later today in Ulaanbaatar', async () => {
      jest.useFakeTimers({ now: new Date('2026-03-23T23:45:00.000Z') });

      await expect(
        progressService.createHabitLog(userId, habitId, {
          actualValue: 1,
          completedAt: '2026-03-24T15:00:00.000Z', // 23:00 Ulaanbaatar
        }),
      ).resolves.toBeDefined();
    });

    it('rejects a completion on the next Ulaanbaatar day', async () => {
      jest.useFakeTimers({ now: new Date('2026-03-23T23:45:00.000Z') });

      await expect(
        progressService.createHabitLog(userId, habitId, {
          actualValue: 1,
          completedAt: '2026-03-24T16:00:00.000Z', // 00:00 next day in UB
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(habitLogRepo.create).not.toHaveBeenCalled();
    });
  });

  it('builds a progress summary from stored logs', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue({
      id: habitId,
      measurementUnit: 'km',
      minimumTarget: 3,
      targetValue: 5,
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
        status: HabitLogStatus.NOT_DONE,
        triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
        completedAt: new Date('2026-03-22T09:00:00.000Z'),
        loggedAt: new Date('2026-03-22T09:05:00.000Z'),
      },
      {
        status: HabitLogStatus.NOT_DONE,
        triggerSource: CompletionTriggerSource.UNKNOWN,
        completedAt: new Date('2026-03-21T09:00:00.000Z'),
        loggedAt: new Date('2026-03-21T09:05:00.000Z'),
      },
    ]);

    const summary = await progressService.getProgressSummary(userId, habitId);

    expect(summary).toEqual({
      totalLogs: 3,
      doneCount: 1,
      notDoneCount: 2,
      lastLoggedAt: '2026-03-23T09:05:00.000Z',
      lastCompletedAt: '2026-03-23T09:00:00.000Z',
      completionByTriggerSource: {
        [CompletionTriggerSource.SELF_INITIATED]: 1,
        [CompletionTriggerSource.REMINDER_TRIGGERED]: 1,
        [CompletionTriggerSource.UNKNOWN]: 1,
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
