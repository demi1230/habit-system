import 'reflect-metadata';

import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  CompletionTriggerSource,
  HabitLogStatus,
  ReminderActionType,
  ReminderDecisionReason,
  ReminderStatus,
} from '../domain/enums/domain.enums';
import {
  RemindersService,
  DoneActionResult,
  SnoozeActionResult,
} from './reminders.service';

// ─── Shared fixture IDs ──────────────────────────────────────────────────────

const USER_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const HABIT_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const REMINDER_ID = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';

function makePendingReminder(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: REMINDER_ID,
    userId: USER_ID,
    habitId: HABIT_ID,
    linkedCueId: null,
    decisionReason: ReminderDecisionReason.SHOULD_REMIND,
    status: ReminderStatus.PENDING,
    scheduledFor: new Date(),
    evaluatedAt: new Date(),
    sentAt: null,
    deliveredAt: null,
    expiresAt: null,
    cooldownKey: null,
    explanation: null,
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Mocks ───────────────────────────────────────────────────────────────────

const reminderRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  update: jest.fn(),
  findActiveForHabitInWindow: jest.fn(),
};

const reminderActionRepo = {
  create: jest.fn(),
  findAllByReminderId: jest.fn(),
  hasDoneAction: jest.fn(),
};

const habitLogRepo = {
  create: jest.fn(),
  findAllByHabitId: jest.fn(),
  findSummaryByHabitId: jest.fn(),
  findByLinkedReminderId: jest.fn(),
};

const analyticsService = { recordActivity: jest.fn() };

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('RemindersService', () => {
  let service: RemindersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RemindersService(
      reminderRepo as never,
      reminderActionRepo as never,
      habitLogRepo as never,
      analyticsService as never,
    );
  });

  // ── getReminder ────────────────────────────────────────────────────────────

  describe('getReminder', () => {
    it('returns the reminder when it belongs to the user', async () => {
      const r = makePendingReminder();
      reminderRepo.findByIdAndUserId.mockResolvedValue(r);
      await expect(service.getReminder(USER_ID, REMINDER_ID)).resolves.toEqual(
        r,
      );
    });

    it('throws NotFoundException when not found', async () => {
      reminderRepo.findByIdAndUserId.mockResolvedValue(null);
      await expect(
        service.getReminder(USER_ID, REMINDER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ── submitAction — guard rails ─────────────────────────────────────────────

  describe('submitAction — guard rails', () => {
    it('throws ConflictException when reminder is ACTED', async () => {
      reminderRepo.findByIdAndUserId.mockResolvedValue(
        makePendingReminder({ status: ReminderStatus.ACTED }),
      );
      await expect(
        service.submitAction(USER_ID, REMINDER_ID, {
          actionType: ReminderActionType.DONE,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws ConflictException when reminder is EXPIRED', async () => {
      reminderRepo.findByIdAndUserId.mockResolvedValue(
        makePendingReminder({ status: ReminderStatus.EXPIRED }),
      );
      await expect(
        service.submitAction(USER_ID, REMINDER_ID, {
          actionType: ReminderActionType.DONE,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws ConflictException when reminder is CANCELLED', async () => {
      reminderRepo.findByIdAndUserId.mockResolvedValue(
        makePendingReminder({ status: ReminderStatus.CANCELLED }),
      );
      await expect(
        service.submitAction(USER_ID, REMINDER_ID, {
          actionType: ReminderActionType.DONE,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ── DONE action ────────────────────────────────────────────────────────────

  describe('DONE action', () => {
    it('creates a HabitLog with REMINDER_TRIGGERED when none exists', async () => {
      const reminder = makePendingReminder();
      reminderRepo.findByIdAndUserId.mockResolvedValue(reminder);
      reminderActionRepo.hasDoneAction.mockResolvedValue(false);
      habitLogRepo.findByLinkedReminderId.mockResolvedValue(null);

      const createdLog = {
        id: 'log-id',
        habitId: HABIT_ID,
        status: HabitLogStatus.DONE,
        triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
        linkedReminderId: REMINDER_ID,
        sourceConfidence: 1.0,
      };
      reminderRepo.update.mockResolvedValue({
        ...reminder,
        status: ReminderStatus.ACTED,
      });
      reminderActionRepo.create.mockResolvedValue({ id: 'action-id' });
      habitLogRepo.create.mockResolvedValue(createdLog);

      const result = (await service.submitAction(USER_ID, REMINDER_ID, {
        actionType: ReminderActionType.DONE,
      })) as DoneActionResult;

      expect(reminderRepo.update).toHaveBeenCalledWith(REMINDER_ID, {
        status: ReminderStatus.ACTED,
      });
      expect(habitLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          habitId: HABIT_ID,
          status: HabitLogStatus.DONE,
          triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
          linkedReminderId: REMINDER_ID,
          sourceConfidence: 1.0,
        }),
      );
      expect(result.habitLog).toEqual(createdLog);
    });

    it('does NOT create a duplicate HabitLog when one already exists', async () => {
      const reminder = makePendingReminder();
      reminderRepo.findByIdAndUserId.mockResolvedValue(reminder);
      reminderActionRepo.hasDoneAction.mockResolvedValue(false);
      const existingLog = { id: 'existing-log' };
      habitLogRepo.findByLinkedReminderId.mockResolvedValue(existingLog);
      reminderRepo.update.mockResolvedValue({
        ...reminder,
        status: ReminderStatus.ACTED,
      });
      reminderActionRepo.create.mockResolvedValue({ id: 'action-id' });

      const result = (await service.submitAction(USER_ID, REMINDER_ID, {
        actionType: ReminderActionType.DONE,
      })) as DoneActionResult;

      expect(habitLogRepo.create).not.toHaveBeenCalled();
      expect(result.habitLog).toEqual(existingLog);
    });

    it('throws ConflictException when DONE action already exists', async () => {
      reminderRepo.findByIdAndUserId.mockResolvedValue(makePendingReminder());
      reminderActionRepo.hasDoneAction.mockResolvedValue(true);

      await expect(
        service.submitAction(USER_ID, REMINDER_ID, {
          actionType: ReminderActionType.DONE,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ── SNOOZE action ──────────────────────────────────────────────────────────

  describe('SNOOZE action', () => {
    it('creates a follow-up reminder snoozedUntil = actedAt + snoozeMinutes', async () => {
      const reminder = makePendingReminder();
      reminderRepo.findByIdAndUserId.mockResolvedValue(reminder);

      const followUpReminder = {
        id: 'follow-up-id',
        status: ReminderStatus.PENDING,
      };
      reminderActionRepo.create.mockResolvedValue({ id: 'snooze-action' });
      reminderRepo.create.mockResolvedValue(followUpReminder);

      const result = (await service.submitAction(USER_ID, REMINDER_ID, {
        actionType: ReminderActionType.SNOOZE,
        snoozeMinutes: 30,
      })) as SnoozeActionResult;

      expect(reminderActionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: ReminderActionType.SNOOZE,
          metadata: { snoozeMinutes: 30 },
        }),
      );
      expect(reminderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ habitId: HABIT_ID }),
      );
      expect(result.followUpReminder).toEqual(followUpReminder);
    });

    it('uses DEFAULT_SNOOZE_MINUTES (30) when snoozeMinutes is omitted', async () => {
      const reminder = makePendingReminder();
      reminderRepo.findByIdAndUserId.mockResolvedValue(reminder);
      reminderActionRepo.create.mockResolvedValue({ id: 'snooze-action' });
      reminderRepo.create.mockResolvedValue({ id: 'follow-up' });

      await service.submitAction(USER_ID, REMINDER_ID, {
        actionType: ReminderActionType.SNOOZE,
      });

      expect(reminderActionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { snoozeMinutes: 30 } }),
      );
    });
  });
});
