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
   * Returns a PENDING or SENT reminder whose effectiveUntil has not yet passed
   * and whose cooldownKey matches the given key.
   * Used for cooldown-key-based dedup — allows multiple valid reminder windows
   * per day (an hourly key enables e.g. morning + evening reminders for one habit).
   */
  findActiveByCooldownKey(
    cooldownKey: string,
    now: Date,
  ): Promise<ReminderEntity | null>;
}
