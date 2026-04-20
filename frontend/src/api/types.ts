// ── Enums (mirrors backend domain.enums) ─────────────────────────────────────

export type HabitLifecycleStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type HabitLogStatus = 'DONE' | 'NOT_DONE';
export type CompletionTriggerSource = 'SELF_INITIATED' | 'REMINDER_TRIGGERED' | 'UNKNOWN';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type DifficultyRating = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard';

// ── Entities ──────────────────────────────────────────────────────────────────

export interface HabitScheduleDay {
  weekday: Weekday;
}

export interface HabitCue {
  id: string;
  habitId: string;
  startTime: string | null;
  endTime: string | null;
  coarseLocation: string | null;
  precedingRoutine: string | null;
  isActive: boolean;
}

export interface MotivationProfile {
  goalTag: string | null;
  reason: string | null;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  precedingRoutine: string | null;
  color: string | null;
  iconType: string | null;
  iconValue: string | null;
  benefits: string[];
  measurementUnit: string;
  targetValue: number;
  minimumTarget: number;
  startDate: string;
  status: HabitLifecycleStatus;
  reminderEnabled: boolean;
  archivedAt: string | null;
  scheduleDays: HabitScheduleDay[];
  cues: HabitCue[];
  motivationProfile: MotivationProfile | null;
  createdAt: string;
  updatedAt: string;
}

/** CueContext returned by GET /habits/today cueContext array */
export interface CueContext {
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  coarseLocation: string | null;
  precedingRoutine: string | null;
}

export interface HabitWithCueContext extends Habit {
  cueContext: CueContext[];
  currentStreak: number;
  strengthScore: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  status: HabitLogStatus;
  actualValue: number | null;
  completedAt: string;
  loggedAt: string;
  triggerSource: CompletionTriggerSource | null;
}

export interface ProgressSummary {
  totalLogs: number;
  doneCount: number;
  notDoneCount: number;
  lastLoggedAt: string | null;
  lastCompletedAt: string | null;
  completionByTriggerSource: Record<string, number>;
  selfInitiatedCount: number;
  reminderTriggeredCount: number;
  unknownSourceCount: number;
  selfInitiatedRate: number;
  reminderDependenceRate: number;
  completionWithoutReminderRate: number;
}

export interface HabitStrengthSignals {
  habitId: string;
  totalLogs: number;
  doneCount: number;
  partialCount: number;
  notDoneCount: number;
  doneRate: number;
  selfInitiatedRate: number;
  scheduledWeekdayCount: number;
  hasCueConfiguration: boolean;
  hasMotivationProfile: boolean;
  stage: 'insufficient_data' | 'early_stage' | 'building' | 'established';
  evaluatedAt: string;
}

export interface CompositeScore {
  srbaiScore: number;
  consistencyScore: number;
  contextStabilityScore: number;
  selfInitiatedRate: number;
  finalScore: number;
  stage: 'weak' | 'building' | 'strong';
  evaluatedAt: string;
}
