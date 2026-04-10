import { ReminderPolicyEntity } from '../entities/reminder-policy.entity';
import { ReminderPolicyMode } from '../enums/domain.enums';

/** Injection token for the reminder-policy repository port. */
export const REMINDER_POLICY_REPOSITORY = Symbol('IReminderPolicyRepository');

export interface UpsertReminderPolicyData {
  habitId: string;
  mode: ReminderPolicyMode;
  cooldownMinutes: number;
  maxPerDay: number;
  narrowingLevel: number;
  effectiveFrom: Date;
}

/**
 * Repository port (interface) for ReminderPolicyEntity persistence.
 */
export interface IReminderPolicyRepository {
  upsert(data: UpsertReminderPolicyData): Promise<ReminderPolicyEntity>;
  findByHabitId(habitId: string): Promise<ReminderPolicyEntity | null>;
}
