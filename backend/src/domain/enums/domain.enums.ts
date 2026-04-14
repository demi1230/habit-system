/**
 * Domain layer — canonical enum definitions.
 * All layers import from here; src/common/enums re-exports for backwards
 * compatibility with existing DTOs and controllers.
 */

export const HabitLogStatus = {
  DONE: 'DONE',
  NOT_DONE: 'NOT_DONE',
} as const;

export type HabitLogStatus =
  (typeof HabitLogStatus)[keyof typeof HabitLogStatus];

export const HabitLifecycleStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type HabitLifecycleStatus =
  (typeof HabitLifecycleStatus)[keyof typeof HabitLifecycleStatus];

export const CompletionTriggerSource = {
  SELF_INITIATED: 'SELF_INITIATED',
  REMINDER_TRIGGERED: 'REMINDER_TRIGGERED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type CompletionTriggerSource =
  (typeof CompletionTriggerSource)[keyof typeof CompletionTriggerSource];

export const Weekday = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const;

export type Weekday = (typeof Weekday)[keyof typeof Weekday];

// ─── Phase 4A: Reminder domain enums ─────────────────────────────────────────

export const ReminderStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  ACTED: 'ACTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type ReminderStatus =
  (typeof ReminderStatus)[keyof typeof ReminderStatus];

export const ReminderDecisionReason = {
  REMINDER_DISABLED: 'REMINDER_DISABLED',
  NOT_SCHEDULED_TODAY: 'NOT_SCHEDULED_TODAY',
  NO_ACTIVE_CUES: 'NO_ACTIVE_CUES',
  SHOULD_REMIND: 'SHOULD_REMIND',
} as const;

export type ReminderDecisionReason =
  (typeof ReminderDecisionReason)[keyof typeof ReminderDecisionReason];

export const ReminderActionType = {
  DONE: 'DONE',
  SNOOZE: 'SNOOZE',
} as const;

export type ReminderActionType =
  (typeof ReminderActionType)[keyof typeof ReminderActionType];

// ─── Phase 4B: Habit-strength + tapering enums ───────────────────────────────

export const ReminderPolicyMode = {
  FULL_SUPPORT: 'FULL_SUPPORT',
  MODERATE_SUPPORT: 'MODERATE_SUPPORT',
  FADE_OUT: 'FADE_OUT',
  MINIMAL: 'MINIMAL',
} as const;

export type ReminderPolicyMode =
  (typeof ReminderPolicyMode)[keyof typeof ReminderPolicyMode];

export const HabitStrengthStage = {
  WEAK: 'weak',
  BUILDING: 'building',
  STRONG: 'strong',
} as const;

export type HabitStrengthStage =
  (typeof HabitStrengthStage)[keyof typeof HabitStrengthStage];

// ─── Phase 4B: Difficulty rating ─────────────────────────────────────────────

export const DifficultyRating = {
  VERY_EASY: 'very_easy',
  EASY: 'easy',
  MODERATE: 'moderate',
  HARD: 'hard',
  VERY_HARD: 'very_hard',
} as const;

export type DifficultyRating =
  (typeof DifficultyRating)[keyof typeof DifficultyRating];
