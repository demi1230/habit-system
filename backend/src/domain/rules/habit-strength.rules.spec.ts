import { HabitStrengthRules } from './habit-strength.rules';
import {
  ReminderPolicyMode,
  HabitLogStatus,
  CompletionTriggerSource,
} from '../enums/domain.enums';

describe('HabitStrengthRules.scoreSrbai', () => {
  it('computes rawAverage = mean of 4 items', () => {
    const result = HabitStrengthRules.scoreSrbai({
      item1: 4,
      item2: 4,
      item3: 4,
      item4: 4,
    });
    expect(result.rawAverage).toBe(4);
  });

  it('normalizes min (all 1s) → 0', () => {
    const result = HabitStrengthRules.scoreSrbai({
      item1: 1,
      item2: 1,
      item3: 1,
      item4: 1,
    });
    expect(result.normalizedScore100).toBe(0);
  });

  it('normalizes max (all 7s) → 100', () => {
    const result = HabitStrengthRules.scoreSrbai({
      item1: 7,
      item2: 7,
      item3: 7,
      item4: 7,
    });
    expect(result.normalizedScore100).toBe(100);
  });

  it('normalizes midpoint (all 4s) → 50', () => {
    const result = HabitStrengthRules.scoreSrbai({
      item1: 4,
      item2: 4,
      item3: 4,
      item4: 4,
    });
    expect(result.normalizedScore100).toBe(50);
  });

  it('handles mixed items correctly', () => {
    // rawAverage = (3+5+4+4)/4 = 4
    const result = HabitStrengthRules.scoreSrbai({
      item1: 3,
      item2: 5,
      item3: 4,
      item4: 4,
    });
    expect(result.rawAverage).toBe(4);
    expect(result.normalizedScore100).toBe(50);
  });
});

describe('HabitStrengthRules.computeComposite', () => {
  it('returns stage=weak for finalScore < 40', () => {
    const result = HabitStrengthRules.computeComposite({
      srbaiScore: 20,
      consistencyScore: 20,
      contextStabilityScore: 20,
      selfInitiatedRate: 0.3,
    });
    expect(result.stage).toBe('weak');
    expect(result.finalScore).toBeLessThan(40);
  });

  it('returns stage=building for finalScore in 40–69', () => {
    const result = HabitStrengthRules.computeComposite({
      srbaiScore: 60,
      consistencyScore: 60,
      contextStabilityScore: 60,
      selfInitiatedRate: 0.5,
    });
    expect(result.stage).toBe('building');
    expect(result.finalScore).toBeGreaterThanOrEqual(40);
    expect(result.finalScore).toBeLessThan(70);
  });

  it('returns stage=strong for finalScore >= 70', () => {
    const result = HabitStrengthRules.computeComposite({
      srbaiScore: 90,
      consistencyScore: 80,
      contextStabilityScore: 80,
      selfInitiatedRate: 0.8,
    });
    expect(result.stage).toBe('strong');
    expect(result.finalScore).toBeGreaterThanOrEqual(70);
  });

  it('formula weights: 0.60 srbai + 0.25 consistency + 0.15 context', () => {
    const result = HabitStrengthRules.computeComposite({
      srbaiScore: 100,
      consistencyScore: 0,
      contextStabilityScore: 0,
      selfInitiatedRate: 0,
    });
    expect(result.finalScore).toBe(60);
  });
});

describe('HabitStrengthRules.recommendTaperingPolicy', () => {
  it('recommends MINIMAL for strong habit with selfInitiatedRate >= 0.7', () => {
    const result = HabitStrengthRules.recommendTaperingPolicy('strong', 0.8);
    expect(result.recommendedMode).toBe(ReminderPolicyMode.MINIMAL);
  });

  it('recommends FADE_OUT for strong habit with selfInitiatedRate 0.4–0.69', () => {
    const result = HabitStrengthRules.recommendTaperingPolicy('strong', 0.5);
    expect(result.recommendedMode).toBe(ReminderPolicyMode.FADE_OUT);
  });

  it('recommends MODERATE_SUPPORT for building habit', () => {
    const result = HabitStrengthRules.recommendTaperingPolicy('building', 0.3);
    expect(result.recommendedMode).toBe(ReminderPolicyMode.MODERATE_SUPPORT);
  });

  it('recommends FULL_SUPPORT for weak habit', () => {
    const result = HabitStrengthRules.recommendTaperingPolicy('weak', 0.1);
    expect(result.recommendedMode).toBe(ReminderPolicyMode.FULL_SUPPORT);
  });

  it('MINIMAL policy has the strictest cooldown (240min) and lowest maxPerDay (1)', () => {
    const result = HabitStrengthRules.recommendTaperingPolicy('strong', 0.9);
    expect(result.cooldownMinutes).toBe(240);
    expect(result.maxPerDay).toBe(1);
  });

  it('FULL_SUPPORT policy has the shortest cooldown (30min) and highest maxPerDay (4)', () => {
    const result = HabitStrengthRules.recommendTaperingPolicy('weak', 0.0);
    expect(result.cooldownMinutes).toBe(30);
    expect(result.maxPerDay).toBe(4);
  });
});

describe('HabitStrengthRules.compute', () => {
  const D = HabitLogStatus.DONE;
  const N = HabitLogStatus.NOT_DONE;
  const SI = CompletionTriggerSource.SELF_INITIATED;
  const RT = CompletionTriggerSource.REMINDER_TRIGGERED;
  const UK = CompletionTriggerSource.UNKNOWN;

  const base = {
    habitId: 'h1',
    scheduledWeekdayCount: 5,
    hasCueConfiguration: true,
    hasMotivationProfile: false,
  };

  it('counts selfInitiatedRate over doneCount only (not totalLogs)', () => {
    const result = HabitStrengthRules.compute({
      ...base,
      logs: [
        { status: D, triggerSource: SI },
        { status: D, triggerSource: SI },
        { status: N, triggerSource: UK }, // NOT_DONE — should not affect selfInitiatedRate
        { status: N, triggerSource: SI }, // NOT_DONE SELF_INITIATED — must NOT count
      ],
    });
    expect(result.doneCount).toBe(2);
    expect(result.notDoneCount).toBe(2);
    expect(result.totalLogs).toBe(4);
    // 2 self-initiated out of 2 DONE → 1.0
    expect(result.selfInitiatedRate).toBe(1.0);
    expect(result.doneRate).toBe(0.5);
  });

  it('returns selfInitiatedRate=0 when all logs are NOT_DONE', () => {
    const result = HabitStrengthRules.compute({
      ...base,
      logs: [
        { status: N, triggerSource: SI },
        { status: N, triggerSource: RT },
      ],
    });
    expect(result.doneCount).toBe(0);
    expect(result.selfInitiatedRate).toBe(0);
    expect(result.doneRate).toBe(0);
  });

  it('computes correct selfInitiatedRate with mixed DONE trigger sources', () => {
    const result = HabitStrengthRules.compute({
      ...base,
      logs: [
        { status: D, triggerSource: SI },
        { status: D, triggerSource: RT },
        { status: D, triggerSource: RT },
        { status: D, triggerSource: UK },
      ],
    });
    // 1 SI out of 4 DONE
    expect(result.selfInitiatedRate).toBe(0.25);
    expect(result.doneRate).toBe(1);
  });
});
