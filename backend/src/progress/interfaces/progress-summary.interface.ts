import {
  CompletionTriggerSource,
  HabitLogStatus,
} from '../../domain/enums/domain.enums';

export interface ProgressSummary {
  totalLogs: number;
  doneCount: number;
  partialCount: number;
  notDoneCount: number;
  lastLoggedAt: string | null;
  lastCompletedAt: string | null;
  completionByTriggerSource: Record<CompletionTriggerSource, number>;
  // Phase 4A: reminder-dependence metrics
  selfInitiatedCount: number;
  reminderTriggeredCount: number;
  unknownSourceCount: number;
  selfInitiatedRate: number;
  reminderDependenceRate: number;
  completionWithoutReminderRate: number;
}

export const progressStatusCountKeyMap: Record<
  HabitLogStatus,
  keyof Pick<ProgressSummary, 'doneCount' | 'partialCount' | 'notDoneCount'>
> = {
  [HabitLogStatus.DONE]: 'doneCount',
  [HabitLogStatus.PARTIAL]: 'partialCount',
  [HabitLogStatus.NOT_DONE]: 'notDoneCount',
};
