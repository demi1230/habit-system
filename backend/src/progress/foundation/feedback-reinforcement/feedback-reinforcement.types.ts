import {
  CompletionTriggerSource,
  HabitLogStatus,
} from '../../../common/enums/domain.enums';

/**
 * Phase 1 keeps reinforcement as a future-ready contract only.
 * No reward engine or adaptive feedback workflow is implemented here.
 */
export interface FeedbackReinforcementContext {
  userId: string;
  habitId: string;
  status: HabitLogStatus;
  triggerSource?: CompletionTriggerSource;
  completedAt: Date;
}
