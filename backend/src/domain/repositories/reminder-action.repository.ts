import { ReminderActionType } from '../enums/domain.enums';
import { ReminderActionEntity } from '../entities/reminder-action.entity';

/** Injection token for the reminder-action repository port. */
export const REMINDER_ACTION_REPOSITORY = Symbol('IReminderActionRepository');

export interface CreateReminderActionData {
  reminderId: string;
  userId: string;
  actionType: ReminderActionType;
  actedAt: Date;
  snoozedUntil?: Date | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Repository port (interface) for ReminderActionEntity persistence.
 */
export interface IReminderActionRepository {
  create(data: CreateReminderActionData): Promise<ReminderActionEntity>;
  findAllByReminderId(reminderId: string): Promise<ReminderActionEntity[]>;
  hasDoneAction(reminderId: string): Promise<boolean>;
}
