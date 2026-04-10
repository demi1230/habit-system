import { ReminderDecisionReason, ReminderStatus } from '../enums/domain.enums';

/**
 * Domain entity — Reminder
 * Represents a single reminder evaluation result that has been persisted.
 * Thesis mapping: "Сануулга · Reminder" from the behavioral-feedback layer.
 */
export interface ReminderEntity {
  id: string;
  userId: string;
  habitId: string;
  linkedCueId: string | null;
  decisionReason: ReminderDecisionReason;
  status: ReminderStatus;
  scheduledFor: Date;
  evaluatedAt: Date;
  sentAt: Date | null;
  deliveredAt: Date | null;
  /**
   * Effective end of the cooldown window for this reminder.
   * Set to scheduledFor + cooldownMinutes (from ReminderPolicy, default 60 min).
   * The dedup check rejects new reminders while any PENDING/SENT reminder's
   * effectiveUntil is still in the future.
   */
  effectiveUntil: Date | null;
  /** Hourly bucket key: habitId:YYYY-MM-DDTHH — allows multiple windows per day. */
  cooldownKey: string | null;
  explanation: Record<string, unknown> | null;
  createdAt: Date;
}
