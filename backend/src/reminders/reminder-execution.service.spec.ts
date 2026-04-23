import 'reflect-metadata';

import { ConflictException } from '@nestjs/common';
import {
  ReminderDecisionReason,
  ReminderStatus,
} from '../domain/enums/domain.enums';
import { ReminderExecutionService } from './reminder-execution.service';

// ─── Fixture ─────────────────────────────────────────────────────────────────

const USER_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const HABIT_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const REMINDER_ID = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';

function makeHabitWithReminders({
  reminderEnabled = true,
  scheduleDays = [] as Array<{ weekday: string }>,
  cues = [
    {
      id: 'cue1',
      isActive: true,
      startTime: null,
      endTime: null,
      coarseLocation: null,
      precedingRoutine: null,
      habitId: HABIT_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
} = {}) {
  return {
    id: HABIT_ID,
    userId: USER_ID,
    title: 'Morning run',
    reminderEnabled,
    scheduleDays,
    cues,
    motivationProfile: null,
  };
}

// ─── Mocks ───────────────────────────────────────────────────────────────────

const reminderRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  update: jest.fn(),
  findActiveByCooldownKey: jest.fn(),
};

const policyRepo = {
  upsert: jest.fn(),
  findByHabitId: jest.fn().mockResolvedValue(null),
};

const notificationGateway = {
  send: jest.fn().mockResolvedValue({
    delivered: true,
    deliveredAt: new Date(),
    providerResponse: 'stub:ok',
  }),
};

const habitsService = {
  getOwnedHabitOrThrow: jest.fn(),
};

const analyticsService = { recordActivity: jest.fn() };
const reminderMessageBuilder = {
  build: jest.fn().mockReturnValue({
    title: 'Дадлын сануулга',
    body: 'Morning run дадлаа хийгээрэй.',
    contentParts: {
      cue: null,
      habit: 'Morning run',
      reason: null,
      benefits: [],
    },
  }),
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ReminderExecutionService', () => {
  let service: ReminderExecutionService;

  beforeEach(() => {
    jest.clearAllMocks();
    policyRepo.findByHabitId.mockResolvedValue(null);
    service = new ReminderExecutionService(
      reminderRepo as never,
      notificationGateway as never,
      policyRepo as never,
      habitsService as never,
      analyticsService as never,
      reminderMessageBuilder as never,
    );
  });

  it('returns persisted=false and REMINDER_DISABLED when reminderEnabled=false', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue(
      makeHabitWithReminders({ reminderEnabled: false }),
    );

    const result = await service.evaluateAndCreate(USER_ID, HABIT_ID, {});

    expect(result.persisted).toBe(false);
    expect(result.decisionReason).toBe(
      ReminderDecisionReason.REMINDER_DISABLED,
    );
    expect(result.reminder).toBeNull();
    expect(reminderRepo.create).not.toHaveBeenCalled();
  });

  it('returns persisted=false and NO_ACTIVE_CUES when habit has no active cues', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue(
      makeHabitWithReminders({ cues: [] }),
    );

    const result = await service.evaluateAndCreate(USER_ID, HABIT_ID, {});

    expect(result.persisted).toBe(false);
    expect(result.decisionReason).toBe(ReminderDecisionReason.NO_ACTIVE_CUES);
    expect(reminderRepo.create).not.toHaveBeenCalled();
  });

  it('persists a reminder, calls gateway, returns SHOULD_REMIND + persisted=true', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue(
      makeHabitWithReminders(),
    );
    reminderRepo.findActiveByCooldownKey.mockResolvedValue(null);

    const createdReminder = {
      id: REMINDER_ID,
      status: ReminderStatus.PENDING,
    };
    reminderRepo.create.mockResolvedValue(createdReminder);
    reminderRepo.update.mockResolvedValue({
      ...createdReminder,
      status: ReminderStatus.SENT,
    });

    const result = await service.evaluateAndCreate(USER_ID, HABIT_ID, {});

    expect(result.persisted).toBe(true);
    expect(result.decisionReason).toBe(ReminderDecisionReason.SHOULD_REMIND);
    expect(reminderRepo.create).toHaveBeenCalledTimes(1);
    expect(notificationGateway.send).toHaveBeenCalledTimes(1);
    expect(reminderRepo.update).toHaveBeenCalledWith(
      REMINDER_ID,
      expect.objectContaining({ status: ReminderStatus.SENT }),
    );
  });

  it('throws ConflictException when an active reminder already exists in the hourly window', async () => {
    habitsService.getOwnedHabitOrThrow.mockResolvedValue(
      makeHabitWithReminders(),
    );
    reminderRepo.findActiveByCooldownKey.mockResolvedValue({
      id: 'existing-reminder',
      status: ReminderStatus.PENDING,
    });

    await expect(
      service.evaluateAndCreate(USER_ID, HABIT_ID, {}),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(reminderRepo.create).not.toHaveBeenCalled();
  });
});
