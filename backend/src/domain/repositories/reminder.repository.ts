import { ReminderDecisionReason, ReminderStatus } from '../enums/domain.enums';
import { ReminderEntity } from '../entities/reminder.entity';

/** Injection token for the reminder repository port. */
export const REMINDER_REPOSITORY = Symbol('IReminderRepository');

export interface CreateReminderData {
  userId: string;
  habitId: string;
  linkedCueId?: string | null;
  decisionReason: ReminderDecisionReason;
  scheduledFor: Date;
  evaluatedAt: Date;
  effectiveUntil?: Date | null;
  cooldownKey?: string | null;
  explanation?: Record<string, unknown> | null;
}

export interface UpdateReminderData {
  status?: ReminderStatus;
  sentAt?: Date | null;
  deliveredAt?: Date | null;
}

/**
 * Repository port (interface) for ReminderEntity persistence.
 */
export interface IReminderRepository {
  create(data: CreateReminderData): Promise<ReminderEntity>;
  findById(id: string): Promise<ReminderEntity | null>;
  findByIdAndUserId(id: string, userId: string): Promise<ReminderEntity | null>;
  findAllByUserId(userId: string): Promise<ReminderEntity[]>;
  update(id: string, data: UpdateReminderData): Promise<ReminderEntity>;

  /**
   * Returns a PENDING or SENT reminder for the given habit whose
   * `effectiveUntil` has not yet passed. Used for habit-scoped cooldown dedup.
   *
   * This replaces the previous `findActiveByCooldownKey` approach: matching
   * by `habitId + effectiveUntil` is timezone-agnostic, so it stays correct
   * regardless of which timezone the server runs in (older bucket-string keys
   * were derived from `Date.getHours()`, which differs between a Mongolia
   * laptop and a UTC cloud host).
   */
  findActiveByHabitId(
    habitId: string,
    now: Date,
  ): Promise<ReminderEntity | null>;

  /**
   * Returns PENDING reminders whose scheduledFor <= now and whose cooldownKey
   * starts with "snooze:" — these are follow-ups created by SNOOZE actions that
   * have not yet been delivered via push.
   */
  findDuePendingSnoozeFollowUps(now: Date): Promise<ReminderEntity[]>;
}
