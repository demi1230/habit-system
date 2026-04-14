// ── Enums (mirrors backend domain.enums) ─────────────────────────────────────

export type HabitLifecycleStatus = 'ACTIVE' | 'ARCHIVED';
export type HabitLogStatus = 'DONE' | 'NOT_DONE';
export type CompletionTriggerSource = 'SELF_INITIATED' | 'REMINDER_TRIGGERED' | 'MANUAL_ENTRY';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// ── Entities ──────────────────────────────────────────────────────────────────

export interface HabitScheduleDay {
  weekday: Weekday;
}

export interface HabitCue {
  id: string;
  habitId: string;
  type: string;
  value: string;
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

export interface CueEvaluationResult {
  cueId: string;
  type: string;
  value: string;
  isActive: boolean;
  isCurrentlyTriggered: boolean;
}

export interface HabitWithCueContext extends Habit {
  cueContext: CueEvaluationResult[];
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
  doneRate: number;
  selfInitiatedRate: number;
  stage: 'insufficient_data' | 'early_stage' | 'building' | 'established';
  evaluatedAt: string;
}

export interface CompositeScore {
  srbaiScore: number;
  consistencyScore: number;
  contextStabilityScore: number;
  selfInitiatedRate: number;
  finalScore: number;
  stage: 'WEAK' | 'BUILDING' | 'STRONG';
  evaluatedAt: string;
}
