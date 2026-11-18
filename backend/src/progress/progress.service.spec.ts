import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import {
  CompletionTriggerSource,
  HabitLogStatus,
} from '../domain/enums/domain.enums';
import { HabitLogDayConflictError } from '../domain/repositories/habit-log.repository';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  const userId = '8e42d9f7-36f5-4d1c-8f3d-90ddf1fb878f';
  const habitId = '4d2b5e07-3209-4d94-8d7b-1db0b8a64152';

  const habitLogRepo = {
    create: jest.fn(),
    update: jest.fn(),
    findAllByHabitId: jest.fn(),
    findSummaryByHabitId: jest.fn(),
    findLatestByHabitIdsForDate: jest.fn(),
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

  const reminderRepo = {
    findLatestDeliveredForHabitBetween: jest.fn(),
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
    habitLogRepo.findLatestByHabitIdsForDate.mockResolvedValue([]);
    reminderRepo.findLatestDeliveredForHabitBetween.mockResolvedValue(null);
    habitLogRepo.update.mockImplementation((id: string, data: object) =>
      Promise.resolve({ id, habitId, completedAt: new Date(), ...data }),
    );

    progressService = new ProgressService(
      habitLogRepo as never,
      habitsService as never,
      analyticsService as never,
      engagementService as never,
      reminderRepo as never,
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

  describe('one log per habit per day', () => {
    const existingLog = (status: string, actualValue: number) => ({
      id: 'log-existing',
      habitId,
      status,
      actualValue,
      completedAt: new Date('2026-03-23T01:00:00.000Z'),
      loggedAt: new Date('2026-03-23T01:00:00.000Z'),
    });

    beforeEach(() => {
      habitsService.getOwnedHabitOrThrow.mockResolvedValue({
        id: habitId,
        measurementUnit: 'минут',
        minimumTarget: 10,
        targetValue: 30,
      });
    });

    it('raises the existing log of that day instead of creating a duplicate', async () => {
      habitLogRepo.findLatestByHabitIdsForDate.mockResolvedValue([
        existingLog(HabitLogStatus.NOT_DONE, 5),
      ]);

      const result = await progressService.createHabitLog(userId, habitId, {
        actualValue: 12,
        completedAt: '2026-03-23T02:00:00.000Z',
      });

      expect(habitLogRepo.create).not.toHaveBeenCalled();
      expect(habitLogRepo.update).toHaveBeenCalledWith('log-existing', {
        status: HabitLogStatus.DONE,
        actualValue: 12,
      });
      expect(result.status).toBe(HabitLogStatus.DONE);
      expect(engagementService.awardCompletionRewards).toHaveBeenCalledTimes(1);
    });

    it('never lowers the day value and does not reward twice (retried request)', async () => {
      habitLogRepo.findLatestByHabitIdsForDate.mockResolvedValue([
        existingLog(HabitLogStatus.DONE, 20),
      ]);

      await progressService.createHabitLog(userId, habitId, {
        actualValue: 15,
        completedAt: '2026-03-23T02:00:00.000Z',
      });

      expect(habitLogRepo.update).toHaveBeenCalledWith('log-existing', {
        status: HabitLogStatus.DONE,
        actualValue: 20,
      });
      expect(engagementService.awardCompletionRewards).not.toHaveBeenCalled();
    });

    it('falls back to the existing log when a concurrent request wins the race', async () => {
      habitLogRepo.findLatestByHabitIdsForDate
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([existingLog(HabitLogStatus.DONE, 10)]);
      habitLogRepo.create.mockRejectedValueOnce(
        new HabitLogDayConflictError(habitId, '2026-03-23'),
      );

      const result = await progressService.createHabitLog(userId, habitId, {
        actualValue: 10,
        completedAt: '2026-03-23T02:00:00.000Z',
      });

      expect(result.id).toBe('log-existing');
      expect(engagementService.awardCompletionRewards).not.toHaveBeenCalled();
    });

    it('classifies the trigger source on the server, ignoring the client claim', async () => {
      jest.useFakeTimers({ now: new Date('2026-03-23T02:05:00.000Z') });
      reminderRepo.findLatestDeliveredForHabitBetween.mockResolvedValue({
        id: 'reminder-1',
        sentAt: new Date('2026-03-23T01:45:00.000Z'), // 15 min before
      });

      await progressService.createHabitLog(userId, habitId, {
        actualValue: 10,
        completedAt: '2026-03-23T02:00:00.000Z',
        triggerSource: CompletionTriggerSource.SELF_INITIATED,
      });

      expect(habitLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
          linkedReminderId: 'reminder-1',
        }),
      );
      jest.useRealTimers();
    });

    it('still reports success when rewards fail after the log is saved', async () => {
      engagementService.awardCompletionRewards.mockRejectedValueOnce(
        new Error('reward store unavailable'),
      );

      await expect(
        progressService.createHabitLog(userId, habitId, {
          actualValue: 10,
          completedAt: '2026-03-23T02:00:00.000Z',
        }),
      ).resolves.toMatchObject({ status: HabitLogStatus.DONE });
    });
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
