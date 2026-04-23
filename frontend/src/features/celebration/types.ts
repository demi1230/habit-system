import type { CompletionTriggerSource } from '@/api/types';

export type CelebrationMode = 'regular' | 'milestone';
export type MilestoneKind = 'first' | 'streak' | 'count';

export interface CelebrationContext {
  mode: CelebrationMode;
  streak: number;
  triggerSource: CompletionTriggerSource;
  milestoneKind?: MilestoneKind;
  milestoneValue?: number;
}
