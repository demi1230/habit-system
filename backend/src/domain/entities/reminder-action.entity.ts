import { ReminderActionType } from '../enums/domain.enums';

/**
 * Domain entity — ReminderAction
 * Records a user action taken on a delivered reminder (DONE or SNOOZE).
 * Thesis mapping: "Сануулгын үйлдэл · Reminder action" from the behavioral-feedback layer.
 */
export interface ReminderActionEntity {
  id: string;
  reminderId: string;
  userId: string;
  actionType: ReminderActionType;
  actedAt: Date;
  snoozedUntil: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
