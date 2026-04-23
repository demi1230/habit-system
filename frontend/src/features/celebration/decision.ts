import type { CompletionTriggerSource } from '@/api/types';
import type { CelebrationContext, MilestoneKind } from './types';

// Milestones checked against the NEW streak (currentStreak + 1).
// 3 is intentionally excluded — triggers too early and conflicts with the card display.
const STREAK_MILESTONES = new Set([7, 14, 21, 30, 50, 66, 100]);
const COUNT_MILESTONES = new Set([1, 7, 21, 30, 50, 66, 100]);

/**
 * Pure function — decides celebration mode and milestone metadata.
 * @param currentStreak  Streak value shown on the habit card (before today's log)
 * @param totalDone      Total DONE log count after this completion (pass 0 if unknown)
 * @param source         Trigger source for this log
 *
 * ctx.streak is set to currentStreak so it matches the card.
 * ctx.milestoneValue carries the achieved milestone number (currentStreak + 1).
 */
export function decideCelebration(
  currentStreak: number,
  totalDone: number,
  source: CompletionTriggerSource,
): CelebrationContext {
  const newStreak = currentStreak + 1; // what the streak becomes after today

  // Streak milestone — use newStreak for detection, display it as milestoneValue
  if (STREAK_MILESTONES.has(newStreak)) {
    const kind: MilestoneKind = 'streak';
    return { mode: 'milestone', streak: currentStreak, triggerSource: source, milestoneKind: kind, milestoneValue: newStreak };
  }

  // First-ever completion
  if (totalDone === 1) {
    return { mode: 'milestone', streak: currentStreak, triggerSource: source, milestoneKind: 'first', milestoneValue: 1 };
  }

  // Count milestones (only when totalDone is known and non-zero)
  if (totalDone > 1 && COUNT_MILESTONES.has(totalDone)) {
    return { mode: 'milestone', streak: currentStreak, triggerSource: source, milestoneKind: 'count', milestoneValue: totalDone };
  }

  return { mode: 'regular', streak: currentStreak, triggerSource: source };
}
