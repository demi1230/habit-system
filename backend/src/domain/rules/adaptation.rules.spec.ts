import { AdaptationRules } from './adaptation.rules';
import { DifficultyRating } from '../enums/domain.enums';
import { ReminderPolicyMode } from '../enums/domain.enums';

describe('AdaptationRules.recommend', () => {
  const base = {
    compositeScore: 50,
    selfInitiatedRate: 0.5,
    reminderDependenceRate: 0.3,
    doneCount: 10,
    recentDifficultyLevel: null,
    currentPolicyMode: ReminderPolicyMode.FULL_SUPPORT,
  };

  it('recommends reduce_reminders when score >= 70 and selfInitiatedRate >= 0.7', () => {
    const result = AdaptationRules.recommend({
      ...base,
      compositeScore: 75,
      selfInitiatedRate: 0.8,
    });
    expect(result.focus).toBe('reduce_reminders');
    expect(result.suggestedPolicyMode).toBe(ReminderPolicyMode.MINIMAL);
    expect(result.milestoneReached).toBe(false);
  });

  it('recommends review_difficulty when avg difficulty is HARD and doneCount >= 5', () => {
    const result = AdaptationRules.recommend({
      ...base,
      compositeScore: 30,
      recentDifficultyLevel: DifficultyRating.HARD,
      doneCount: 8,
    });
    expect(result.focus).toBe('review_difficulty');
    expect(result.suggestedPolicyMode).toBeNull();
  });

  it('recommends review_difficulty when avg difficulty is VERY_HARD', () => {
    const result = AdaptationRules.recommend({
      ...base,
      compositeScore: 40,
      recentDifficultyLevel: DifficultyRating.VERY_HARD,
      doneCount: 10,
    });
    expect(result.focus).toBe('review_difficulty');
  });

  it('recommends increase_support when reminderDependenceRate >= 0.7 and doneCount >= 5', () => {
    const result = AdaptationRules.recommend({
      ...base,
      reminderDependenceRate: 0.8,
      selfInitiatedRate: 0.1,
      doneCount: 7,
    });
    expect(result.focus).toBe('increase_support');
    expect(result.suggestedPolicyMode).toBe(ReminderPolicyMode.FULL_SUPPORT);
  });

  it('recommends celebrate_consistency at milestone 7 with TAPERED mode when score >= 40', () => {
    const result = AdaptationRules.recommend({
      ...base,
      compositeScore: 55,
      doneCount: 7,
    });
    expect(result.focus).toBe('celebrate_consistency');
    expect(result.milestoneReached).toBe(true);
    expect(result.suggestedPolicyMode).toBe(ReminderPolicyMode.FADE_OUT);
  });

  it('recommends celebrate_consistency at milestone 21', () => {
    const result = AdaptationRules.recommend({
      ...base,
      doneCount: 21,
    });
    expect(result.focus).toBe('celebrate_consistency');
    expect(result.milestoneReached).toBe(true);
  });

  it('recommends celebrate_consistency at milestone 66', () => {
    const result = AdaptationRules.recommend({
      ...base,
      doneCount: 66,
    });
    expect(result.focus).toBe('celebrate_consistency');
    expect(result.milestoneReached).toBe(true);
  });

  it('defaults to maintain when no special condition is met', () => {
    const result = AdaptationRules.recommend(base);
    expect(result.focus).toBe('maintain');
    expect(result.milestoneReached).toBe(false);
  });

  it('does NOT trigger review_difficulty when doneCount < 5', () => {
    const result = AdaptationRules.recommend({
      ...base,
      recentDifficultyLevel: DifficultyRating.VERY_HARD,
      doneCount: 3,
    });
    // Should fall through to celebrate_consistency check, then maintain
    expect(result.focus).toBe('maintain');
  });

  it('handles null compositeScore (not yet assessed)', () => {
    const result = AdaptationRules.recommend({
      ...base,
      compositeScore: null,
    });
    // No reduce_reminders (score is null), falls to maintain
    expect(result.focus).toBe('maintain');
  });

  it('returns a valid ISO evaluatedAt timestamp', () => {
    const result = AdaptationRules.recommend(base);
    expect(new Date(result.evaluatedAt).toISOString()).toBe(result.evaluatedAt);
  });
});
