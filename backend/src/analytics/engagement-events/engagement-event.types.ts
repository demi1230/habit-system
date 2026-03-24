/**
 * Phase 1 keeps usage and engagement events intentionally simple.
 * String activity types are persisted directly so future event expansion
 * does not require repeated schema changes.
 */
export interface EngagementEventDefinition {
  activityType: string;
  occurredAt?: Date;
}
