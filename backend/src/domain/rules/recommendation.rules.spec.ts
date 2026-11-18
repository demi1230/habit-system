import { RecommendationCode } from '../enums/domain.enums';
import {
  RecommendationRules,
  type RecommendationSignals,
} from './recommendation.rules';

const base: RecommendationSignals = {
  compositeScore: null,
  selfInitiatedRate: 0.8,
  reminderDependenceRate: 0.1,
  doneCount: 10,
  doneRate: 0.9,
  hardDifficulty: false,
  contextStabilityScore: null,
  partialDoneRate: 0,
};

describe('RecommendationRules.choose', () => {
  it('does not suggest adjusting cues when context stability is unknown', () => {
    expect(RecommendationRules.choose(base)).toBeNull();
  });

  it('suggests adjusting cues when the observed context is unstable', () => {
    expect(
      RecommendationRules.choose({ ...base, contextStabilityScore: 30 })?.code,
    ).toBe(RecommendationCode.ADJUST_CUE);
  });

  it('follows the priority order', () => {
    expect(
      RecommendationRules.choose({
        ...base,
        hardDifficulty: true,
        partialDoneRate: 0.6,
        contextStabilityScore: 10,
      })?.code,
    ).toBe(RecommendationCode.REDUCE_TARGET);
  });

  it('skips a recently dismissed recommendation and offers the next one', () => {
    const signals = {
      ...base,
      reminderDependenceRate: 0.8,
      contextStabilityScore: 20,
    };
    expect(RecommendationRules.choose(signals)?.code).toBe(
      RecommendationCode.REVIEW_REMINDER_DEPENDENCE,
    );
    expect(
      RecommendationRules.choose(
        signals,
        new Set([RecommendationCode.REVIEW_REMINDER_DEPENDENCE]),
      )?.code,
    ).toBe(RecommendationCode.ADJUST_CUE);
  });

  it('encourages a new habit after its first completions', () => {
    expect(RecommendationRules.choose({ ...base, doneCount: 1 })?.code).toBe(
      RecommendationCode.BUILD_CONSISTENCY,
    );
  });
});
