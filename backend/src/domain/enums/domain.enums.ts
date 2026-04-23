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

// ─── Learning & Recommendations enums ─────────────────────────────────────

export const RecommendationCode = {
  SIMPLIFY_HABIT: 'SIMPLIFY_HABIT',
  ADJUST_CUE: 'ADJUST_CUE',
  REDUCE_TARGET: 'REDUCE_TARGET',
  INCREASE_SUPPORT: 'INCREASE_SUPPORT',
  REVIEW_REMINDER_DEPENDENCE: 'REVIEW_REMINDER_DEPENDENCE',
  BUILD_CONSISTENCY: 'BUILD_CONSISTENCY',
  CELEBRATE_CONSISTENCY: 'CELEBRATE_CONSISTENCY',
} as const;

export type RecommendationCode =
  (typeof RecommendationCode)[keyof typeof RecommendationCode];

export const ReasonCode = {
  LOW_CONSISTENCY: 'LOW_CONSISTENCY',
  HIGH_DIFFICULTY: 'HIGH_DIFFICULTY',
  HIGH_REMINDER_DEPENDENCE: 'HIGH_REMINDER_DEPENDENCE',
  LOW_CONTEXT_STABILITY: 'LOW_CONTEXT_STABILITY',
  LOW_SELF_INITIATED_RATE: 'LOW_SELF_INITIATED_RATE',
  PLATEAUED_HABIT_STRENGTH: 'PLATEAUED_HABIT_STRENGTH',
  MILESTONE_REACHED: 'MILESTONE_REACHED',
} as const;

export type ReasonCode = (typeof ReasonCode)[keyof typeof ReasonCode];

export const RecommendationStatus = {
  ACTIVE: 'ACTIVE',
  DISMISSED: 'DISMISSED',
  APPLIED: 'APPLIED',
  EXPIRED: 'EXPIRED',
} as const;

export type RecommendationStatus =
  (typeof RecommendationStatus)[keyof typeof RecommendationStatus];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

export const ArticleInteractionType = {
  OPENED: 'OPENED',
  COMPLETED: 'COMPLETED',
  BOOKMARKED: 'BOOKMARKED',
  UNBOOKMARKED: 'UNBOOKMARKED',
} as const;

export type ArticleInteractionType =
  (typeof ArticleInteractionType)[keyof typeof ArticleInteractionType];

export const SourceType = {
  LEARNING_PAGE: 'LEARNING_PAGE',
  RECOMMENDATION: 'RECOMMENDATION',
  HABIT_DETAIL: 'HABIT_DETAIL',
  ANALYTICS_PAGE: 'ANALYTICS_PAGE',
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const RecommendationInteractionType = {
  SHOWN: 'SHOWN',
  CLICKED: 'CLICKED',
  DISMISSED: 'DISMISSED',
  APPLIED: 'APPLIED',
} as const;

export type RecommendationInteractionType =
  (typeof RecommendationInteractionType)[keyof typeof RecommendationInteractionType];
