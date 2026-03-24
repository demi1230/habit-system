import 'reflect-metadata';
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { HabitTrackingType } from '../common/enums/domain.enums';
import { HabitsService } from './habits.service';

describe('HabitsService', () => {
  const userId = '8e42d9f7-36f5-4d1c-8f3d-90ddf1fb878f';

  const prisma = {
    habit: {
      create: jest.fn(),
    },
  };

  const authService = {
    ensureUserExists: jest.fn().mockResolvedValue({ id: userId }),
  };

  const analyticsService = {
    recordActivity: jest.fn(),
  };

  let habitsService: HabitsService;

  beforeEach(() => {
    jest.clearAllMocks();
    habitsService = new HabitsService(
      prisma as never,
      authService as never,
      analyticsService as never,
    );
  });

  it('rejects quantitative habits without measurement fields', async () => {
    await expect(
      habitsService.createHabit(userId, {
        title: 'Drink water',
        trackingType: HabitTrackingType.QUANTITATIVE,
        startDate: '2026-03-23',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.habit.create).not.toHaveBeenCalled();
  });

  it('rejects quantitative habits when minimumSuccessValue is above targetValue', async () => {
    await expect(
      habitsService.createHabit(userId, {
        title: 'Walk',
        trackingType: HabitTrackingType.QUANTITATIVE,
        measurementUnit: 'steps',
        targetValue: 10000,
        minimumSuccessValue: 12000,
        startDate: '2026-03-23',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.habit.create).not.toHaveBeenCalled();
  });
});
