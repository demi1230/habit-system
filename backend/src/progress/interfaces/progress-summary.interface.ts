import { CompletionTriggerSource } from '../../domain/enums/domain.enums';

export interface ProgressSummary {
  totalLogs: number;
  doneCount: number;
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
