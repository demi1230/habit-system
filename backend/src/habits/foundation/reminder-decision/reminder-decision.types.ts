import { CueDayType } from '../../../common/enums/domain.enums';

/**
 * Phase 1 reminder-decision foundation:
 * this keeps reminder-ready inputs visible in the codebase without introducing
 * scheduling, delivery, or adaptive reminder runtime behavior yet.
 */
export interface ReminderDecisionContext {
  habitId: string;
  reminderEnabled: boolean;
  cues: Array<{
    timeWindow?: string | null;
    dayType: CueDayType;
    coarseLocation?: string | null;
    precedingRoutine?: string | null;
    isActive: boolean;
  }>;
}
