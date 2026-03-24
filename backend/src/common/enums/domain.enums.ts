export const HabitTrackingType = {
  SIMPLE_CHECKIN: 'SIMPLE_CHECKIN',
  QUANTITATIVE: 'QUANTITATIVE',
} as const;

export type HabitTrackingType =
  (typeof HabitTrackingType)[keyof typeof HabitTrackingType];

export const HabitLogStatus = {
  DONE: 'DONE',
  PARTIAL: 'PARTIAL',
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
  MANUAL_ENTRY: 'MANUAL_ENTRY',
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

export const CueDayType = {
  ANY: 'ANY',
  WEEKDAY: 'WEEKDAY',
  WEEKEND: 'WEEKEND',
} as const;

export type CueDayType = (typeof CueDayType)[keyof typeof CueDayType];
