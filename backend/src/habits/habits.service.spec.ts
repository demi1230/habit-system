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
});
