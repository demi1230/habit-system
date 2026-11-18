import 'reflect-metadata';

import { BadRequestException } from '@nestjs/common';
import { HabitsService } from './habits.service';

describe('HabitsService', () => {
  const userId = '8e42d9f7-36f5-4d1c-8f3d-90ddf1fb878f';

  const habitRepo = {
    create: jest.fn(),
    findAllByUserId: jest.fn(),
    findActiveByUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    update: jest.fn(),
  };

  const authService = {
    ensureUserExists: jest.fn().mockResolvedValue({ id: userId }),
  };

  const analyticsService = {
    recordActivity: jest.fn(),
  };

  const habitLogRepo = {
    findSummaryByHabitId: jest.fn().mockResolvedValue([]),
    findContextSnapshotsByHabitId: jest.fn().mockResolvedValue([]),
  };

  const srbaiRepo = {
    findLatestByHabitId: jest.fn().mockResolvedValue(null),
  };

  let habitsService: HabitsService;

  beforeEach(() => {
    jest.clearAllMocks();
    habitsService = new HabitsService(
      habitRepo as never,
      habitLogRepo as never,
      srbaiRepo as never,
      authService as never,
      analyticsService as never,
    );
  });

  it('rejects habits when minimumTarget exceeds targetValue', async () => {
    await expect(
      habitsService.createHabit(userId, {
        title: 'Walk',
        measurementUnit: 'steps',
        targetValue: 10000,
        minimumTarget: 12000,
        startDate: '2026-03-23',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(habitRepo.create).not.toHaveBeenCalled();
  });

  it('creates a habit when minimumTarget <= targetValue', async () => {
    const mockHabit = {
      id: 'habit-1',
      userId,
      title: 'Drink water',
      measurementUnit: 'glasses',
      targetValue: 8,
      minimumTarget: 4,
    };
    habitRepo.create.mockResolvedValue(mockHabit);

    const result = await habitsService.createHabit(userId, {
      title: 'Drink water',
      measurementUnit: 'glasses',
      targetValue: 8,
      minimumTarget: 4,
      startDate: '2026-03-23',
    });

    expect(result).toEqual(mockHabit);
    expect(habitRepo.create).toHaveBeenCalledTimes(1);
  });

  it('rejects habits with duplicate weekdays in scheduleDays', async () => {
    await expect(
      habitsService.createHabit(userId, {
        title: 'Yoga',
        measurementUnit: 'minutes',
        targetValue: 30,
        minimumTarget: 15,
        startDate: '2026-03-23',
        scheduleDays: [{ weekday: 'MONDAY' }, { weekday: 'MONDAY' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  describe('updateHabit: omitted fields stay, empty fields clear', () => {
    const habitId = 'habit-1';

    beforeEach(() => {
      habitRepo.findByIdAndUserId.mockResolvedValue({
        id: habitId,
        userId,
        minimumTarget: 1,
        targetValue: 10,
        scheduleDays: [],
        steps: [],
        archivedAt: null,
      });
      habitRepo.update.mockImplementation((_id: string, data: object) =>
        Promise.resolve({ id: habitId, ...data }),
      );
    });

    const lastUpdate = () => {
      const calls = habitRepo.update.mock.calls as Array<[string, object]>;
      return calls[calls.length - 1][1] as Record<string, unknown>;
    };

    it('keeps cues when only the reminder switch changes', async () => {
      await habitsService.updateHabit(userId, habitId, {
        reminder: { enabled: false },
      });

      expect(lastUpdate().cues).toBeUndefined();
      expect(lastUpdate().reminderEnabled).toBe(false);
    });

    it('clears all cues when empty reminder lists are sent', async () => {
      await habitsService.updateHabit(userId, habitId, {
        reminder: { enabled: true, timeWindows: [], locations: [] },
      });

      expect(lastUpdate().cues).toEqual([]);
    });

    it('stores location cues with their coordinates', async () => {
      await habitsService.updateHabit(userId, habitId, {
        reminder: {
          timeWindows: [{ startTime: '07:00', endTime: '08:00' }],
          locations: [{ label: 'Гэр', lat: 47.9184, lng: 106.9177 }],
        },
      });

      expect(lastUpdate().cues).toEqual([
        expect.objectContaining({ startTime: '07:00', endTime: '08:00' }),
        expect.objectContaining({
          coarseLocation: 'Гэр',
          locationLat: 47.9184,
          locationLng: 106.9177,
        }),
      ]);
    });

    it('clears the reason and routine cue when empty strings are sent', async () => {
      await habitsService.updateHabit(userId, habitId, {
        reason: '',
        precedingRoutine: '',
      });

      expect(lastUpdate().motivationProfile).toEqual({
        goalTag: null,
        reason: null,
      });
      expect(lastUpdate().precedingRoutine).toBeNull();
    });

    it('leaves the reason and routine cue unchanged when omitted', async () => {
      await habitsService.updateHabit(userId, habitId, { title: 'Шинэ нэр' });

      expect(lastUpdate().motivationProfile).toBeUndefined();
      expect(lastUpdate().precedingRoutine).toBeUndefined();
    });
  });

  describe('getTodayHabits day boundaries (application timezone)', () => {
    const makeHabit = (id: string, weekdays: string[], startDate: string) => {
      const scheduleDays = weekdays.map((weekday) => ({ weekday }));
      return {
        id,
        userId,
        title: id,
        startDate: new Date(`${startDate}T00:00:00.000Z`),
        scheduleDays,
        cues: [],
        motivationProfile: null,
        isScheduledOn: (weekday: string) =>
          scheduleDays.length === 0 ||
          scheduleDays.some((d) => d.weekday === weekday),
      };
    };

    const findLatestByHabitIdsForDate = jest.fn().mockResolvedValue([]);

    beforeEach(() => {
      Object.assign(habitLogRepo, { findLatestByHabitIdsForDate });
      habitLogRepo.findSummaryByHabitId.mockResolvedValue([]);
      habitRepo.findActiveByUserId.mockResolvedValue([
        makeHabit('monday-habit', ['MONDAY'], '2026-03-01'),
        makeHabit('sunday-habit', ['SUNDAY'], '2026-03-01'),
        makeHabit('starts-tomorrow', [], '2026-03-24'),
      ]);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('uses the Ulaanbaatar weekday early in the morning', async () => {
      // Monday 2026-03-23 01:00 in Ulaanbaatar is still Sunday in UTC.
      jest.useFakeTimers({ now: new Date('2026-03-22T17:00:00.000Z') });

      const result = await habitsService.getTodayHabits(userId);

      expect(result.map((h) => h.id)).toEqual(['monday-habit']);
      // The day's logs are looked up for the Ulaanbaatar day 2026-03-23.
      const [, dayInstant] = findLatestByHabitIdsForDate.mock.calls[0] as [
        string[],
        Date,
      ];
      expect(dayInstant.toISOString()).toBe('2026-03-22T16:00:00.000Z');
    });

    it('treats an explicit date as an application-timezone calendar day', async () => {
      const result = await habitsService.getTodayHabits(userId, '2026-03-22');

      expect(result.map((h) => h.id)).toEqual(['sunday-habit']);
    });

    it('counts the streak over Ulaanbaatar days, not host-local days', async () => {
      // Monday 2026-03-30 09:00 Ulaanbaatar.
      jest.useFakeTimers({ now: new Date('2026-03-30T01:00:00.000Z') });
      habitLogRepo.findSummaryByHabitId.mockResolvedValue([
        // Logged at 23:30 Ulaanbaatar on Monday 2026-03-23 (15:30 UTC).
        {
          status: 'DONE',
          completedAt: new Date('2026-03-23T15:30:00.000Z'),
          triggerSource: 'SELF_INITIATED',
        },
        // Logged at 06:00 Ulaanbaatar on Monday 2026-03-16 (Sunday in UTC).
        {
          status: 'DONE',
          completedAt: new Date('2026-03-15T22:00:00.000Z'),
          triggerSource: 'SELF_INITIATED',
        },
      ]);

      const [mondayHabit] = await habitsService.getTodayHabits(userId);

      // Today (no log yet) does not break the streak; the two previous
      // Mondays both count.
      expect(mondayHabit.currentStreak).toBe(2);
    });

    it('rejects a date that is not YYYY-MM-DD', async () => {
      await expect(
        habitsService.getTodayHabits(userId, '2026-02-30'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
