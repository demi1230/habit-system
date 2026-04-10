import { ReminderPolicyMode } from '../enums/domain.enums';

/**
 * Domain entity — ReminderPolicy
 * Stores the tapering configuration for a habit's reminder delivery.
 * Thesis mapping: "Сануулгын бодлого · Reminder tapering policy"
 */
export interface ReminderPolicyEntity {
  id: string;
  habitId: string;
  mode: ReminderPolicyMode;
  cooldownMinutes: number;
  maxPerDay: number;
  narrowingLevel: number;
  effectiveFrom: Date;
  createdAt: Date;
  updatedAt: Date;
}
