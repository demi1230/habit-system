import { CompletionTriggerSource, HabitLogStatus } from '../../common/enums/domain.enums';

export interface ProgressSummary {
  totalLogs: number;
  doneCount: number;
  partialCount: number;
  notDoneCount: number;
  lastLoggedAt: string | null;
  lastCompletedAt: string | null;
  completionByTriggerSource: Record<CompletionTriggerSource, number>;
}

export const progressStatusCountKeyMap: Record<HabitLogStatus, keyof Pick<
  ProgressSummary,
  'doneCount' | 'partialCount' | 'notDoneCount'
>> = {
  [HabitLogStatus.DONE]: 'doneCount',
  [HabitLogStatus.PARTIAL]: 'partialCount',
  [HabitLogStatus.NOT_DONE]: 'notDoneCount',
};
