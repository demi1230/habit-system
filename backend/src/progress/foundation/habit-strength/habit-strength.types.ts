import { CompletionTriggerSource } from '../../../common/enums/domain.enums';

/**
 * Phase 1 habit-strength foundation:
 * the system stores raw inputs needed for later thesis-aligned strength
 * evaluation without calculating a final automaticity score yet.
 */
export interface HabitStrengthSignalSnapshot {
  habitId: string;
  totalLogs: number;
  completionByTriggerSource: Record<string, number>;
  hasCueConfiguration: boolean;
  scheduledWeekdayCount: number;
}

export interface HabitStrengthInputSignal {
  triggerSource?: CompletionTriggerSource;
  completedAt: Date;
}
