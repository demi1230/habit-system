import { DifficultyRating } from '../enums/domain.enums';
import { ReminderPolicyMode } from '../enums/domain.enums';

export type AdaptationFocus =
  | 'reduce_reminders' // Habit is strong — taper reminders
  | 'maintain' // On-track — keep current pace
  | 'increase_support' // Struggling — add cues / motivation review
  | 'review_difficulty' // Consistently reporting hard — habit may be too ambitious
  | 'celebrate_consistency'; // Milestone reached

export interface AdaptationRecommendationInput {
  /** 0–100 composite habit-strength score, or null if not yet assessed */
  compositeScore: number | null;
  /** Self-initiated completion rate from progress summary (0–1) */
  selfInitiatedRate: number;
  /** Reminder dependence rate from progress summary (0–1) */
  reminderDependenceRate: number;
  /** Total DONE completions */
  doneCount: number;
  /** Average of the last N difficulty ratings (null = no ratings yet) */
  recentDifficultyLevel: DifficultyRating | null;
  /** Current tapering policy mode, or null if none set */
  currentPolicyMode: ReminderPolicyMode | null;
}

export interface AdaptationRecommendation {
  focus: AdaptationFocus;
  summary: string;
  suggestedPolicyMode: ReminderPolicyMode | null;
  milestoneReached: boolean;
  evaluatedAt: string;
}

const DIFFICULTY_SCORE: Record<DifficultyRating, number> = {
  [DifficultyRating.VERY_EASY]: 1,
  [DifficultyRating.EASY]: 2,
  [DifficultyRating.MODERATE]: 3,
  [DifficultyRating.HARD]: 4,
  [DifficultyRating.VERY_HARD]: 5,
};

/**
 * Domain rules — Adaptation Recommendation
 *
 * Produces a stateless recommendation based on habit-strength composite score,
 * completion source rates, total completions, and recent difficulty.
 *
 * Thesis mapping: "Дасан зохицол · Adaptation recommendation"
 */
export class AdaptationRules {
  static recommend(
    input: AdaptationRecommendationInput,
  ): AdaptationRecommendation {
    const evaluatedAt = new Date().toISOString();
    const score = input.compositeScore;
    const hardDifficulty =
      input.recentDifficultyLevel !== null &&
      DIFFICULTY_SCORE[input.recentDifficultyLevel] >= 4;
    const milestoneReached =
      input.doneCount === 7 || input.doneCount === 21 || input.doneCount === 66;

    // Case 1: strong habit — suggest tapering
    if (score !== null && score >= 70 && input.selfInitiatedRate >= 0.7) {
      return {
        focus: 'reduce_reminders',
        summary:
          'Habit is well-established and mostly self-initiated. Consider reducing reminder frequency.',
        suggestedPolicyMode: ReminderPolicyMode.MINIMAL,
        milestoneReached,
        evaluatedAt,
      };
    }

    // Case 2: hard difficulty consistently reported — habit may need rescoping
    if (hardDifficulty && input.doneCount >= 5) {
      return {
        focus: 'review_difficulty',
        summary:
          'You have been finding this habit consistently hard. Consider if the target or difficulty level needs adjusting.',
        suggestedPolicyMode: null,
        milestoneReached,
        evaluatedAt,
      };
    }

    // Case 3: high reminder dependence — increase support
    if (input.reminderDependenceRate >= 0.7 && input.doneCount >= 5) {
      return {
        focus: 'increase_support',
        summary:
          'Completions are mostly reminder-triggered. Review cue configuration and motivation to build intrinsic habit strength.',

        suggestedPolicyMode: ReminderPolicyMode.FULL_SUPPORT,
        milestoneReached,
        evaluatedAt,
      };
    }

    // Case 4: milestone celebration
    if (milestoneReached) {
      const mode =
        score !== null && score >= 40
          ? ReminderPolicyMode.FADE_OUT
          : ReminderPolicyMode.FULL_SUPPORT;
      return {
        focus: 'celebrate_consistency',
        summary: `You have completed this habit ${input.doneCount} times — a meaningful milestone! Keep the momentum going.`,
        suggestedPolicyMode: mode,
        milestoneReached: true,
        evaluatedAt,
      };
    }

    // Default: on-track
    return {
      focus: 'maintain',
      summary:
        'Habit is progressing well. Maintain your current routine and reminder settings.',
      suggestedPolicyMode: input.currentPolicyMode,
      milestoneReached: false,
      evaluatedAt,
    };
  }
}
