/**
 * Thesis mapping:
 * Phase 3 habit-strength foundation — returns raw input signals that feed
 * the thesis habit-strength model. A final automaticity score is out of scope
 * until the research model is finalized.
 */
export type HabitStrengthStage =
  | 'insufficient_data'
  | 'early_stage'
  | 'building'
  | 'established';

export interface HabitStrengthSignals {
  habitId: string;
  totalLogs: number;
  doneCount: number;
  partialCount: number;
  notDoneCount: number;
  /** doneCount / totalLogs, 0 when totalLogs = 0 */
  doneRate: number;
  /** selfInitiated logs / totalLogs, 0 when totalLogs = 0 */
  selfInitiatedRate: number;
  scheduledWeekdayCount: number;
  hasCueConfiguration: boolean;
  hasMotivationProfile: boolean;
  /**
   * Coarse label derived from totalLogs:
   * <5 → insufficient_data, 5-14 → early_stage, 15-29 → building, 30+ → established
   */
  stage: HabitStrengthStage;
  evaluatedAt: string;
}
