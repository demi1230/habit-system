import { HabitLogStatus, CompletionTriggerSource } from '../enums/domain.enums';

/**
 * Domain entity — HabitLogEntity (Completion)
 * Records a single completion event for a habit.  Maps to the
 * "Completion" entity in the thesis domain model.
 */
export interface HabitLogEntity {
  id: string;
  habitId: string;
  status: HabitLogStatus;
  actualValue: number | null;
  completedAt: Date;
  loggedAt: Date;
  triggerSource: CompletionTriggerSource | null;
  /** Phase 4A: link to the Reminder that triggered this completion. */
  linkedReminderId: string | null;
  /** Phase 4A: confidence score (0–1) that this source classification is correct. */
  sourceConfidence: number | null;
  /** Context snapshot fields — used for context-stability scoring. */
  completionHour: number | null;    // 0–23
  coarseLocation: string | null;
  precedingRoutine: string | null;
}
