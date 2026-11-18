import { HabitStrengthRules } from './habit-strength.rules';
import {
  ReminderPolicyMode,
  HabitLogStatus,
  CompletionTriggerSource,
  Weekday,
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

  it('reports insufficient data instead of scoring a missing SRBAI as 0', () => {
    const result = HabitStrengthRules.computeComposite({
      srbaiScore: null,
      consistencyScore: 100,
      contextStabilityScore: 100,
      selfInitiatedRate: 1,
    });
    expect(result.finalScore).toBeNull();
    expect(result.stage).toBe('insufficient_data');
  });

  it('reports insufficient data without enough scheduled days', () => {
    const result = HabitStrengthRules.computeComposite({
      srbaiScore: 80,
      consistencyScore: null,
      contextStabilityScore: null,
      selfInitiatedRate: 1,
    });
    expect(result.stage).toBe('insufficient_data');
  });

  it('rescales the weights when context data is not available yet', () => {
    const result = HabitStrengthRules.computeComposite({
      srbaiScore: 100,
      consistencyScore: 0,
      contextStabilityScore: null,
      selfInitiatedRate: 0,
    });
    expect(result.finalScore).toBe(70.59); // 0.6 / 0.85
  });
});

describe('HabitStrengthRules.computeScheduleAdherence', () => {
  const today = '2026-03-30'; // Monday

  it('counts missed scheduled days, not only logged ones', () => {
    // Daily habit started 10 days ago, done on 4 of the 10 past days.
    const result = HabitStrengthRules.computeScheduleAdherence({
      doneDays: new Set([
        '2026-03-20',
        '2026-03-22',
        '2026-03-25',
        '2026-03-29',
      ]),
      scheduledWeekdays: [],
      startDate: '2026-03-20',
      today,
    });
    expect(result.scheduledDays).toBe(10);
    expect(result.completedScheduledDays).toBe(4);
    expect(result.rate).toBeCloseTo(0.4);
  });

  it('does not count today as missed before it is done', () => {
    const notYet = HabitStrengthRules.computeScheduleAdherence({
      doneDays: new Set<string>(),
      scheduledWeekdays: [],
      startDate: '2026-03-20',
      today,
    });
    const doneToday = HabitStrengthRules.computeScheduleAdherence({
      doneDays: new Set([today]),
      scheduledWeekdays: [],
      startDate: '2026-03-20',
      today,
    });
    expect(notYet.scheduledDays).toBe(10);
    expect(doneToday.scheduledDays).toBe(11);
  });

  it('only counts the scheduled weekdays within the 28-day window', () => {
    const result = HabitStrengthRules.computeScheduleAdherence({
      doneDays: new Set(['2026-03-23', '2026-03-16']),
      scheduledWeekdays: [Weekday.MONDAY],
      startDate: '2026-01-01',
      today,
    });
    // Mondays 03-02, 03-09, 03-16, 03-23 (today, Monday, not done yet).
    expect(result.scheduledDays).toBe(4);
    expect(result.completedScheduledDays).toBe(2);
    expect(result.rate).toBeNull(); // fewer than 7 scheduled days
  });
});

describe('HabitStrengthRules.computeContextStability', () => {
  const snap = (
    completionHour: number,
    coarseLocation: string | null = null,
  ) => ({
    completionHour,
    coarseLocation,
  });

  it('returns null until there are enough completions with a known hour', () => {
    expect(
      HabitStrengthRules.computeContextStability([snap(7), snap(7), snap(7)]),
    ).toBeNull();
  });

  it('treats completions within the same 3-hour band as stable', () => {
    expect(
      HabitStrengthRules.computeContextStability([
        snap(7),
        snap(8),
        snap(6),
        snap(7),
        snap(19),
      ]),
    ).toBe(80);
  });

  it('adds the place dimension only when completions were seen at a saved place', () => {
    expect(
      HabitStrengthRules.computeContextStability([
        snap(7, 'Гэр'),
        snap(7, 'Гэр'),
        snap(7, null),
        snap(7, 'Гэр'),
        snap(7, 'Гэр'),
      ]),
    ).toBe(90); // time 100 %, place 80 %
  });
});

describe('HabitStrengthRules.evaluateComposite', () => {
  it('no longer rates logging only completed days as perfect consistency', () => {
    // A daily habit for 20 days, done (and logged) on 5 of them.
    const logs = [
      '2026-03-12',
      '2026-03-15',
      '2026-03-18',
      '2026-03-24',
      '2026-03-28',
    ].map((day) => ({
      status: HabitLogStatus.DONE,
      triggerSource: CompletionTriggerSource.SELF_INITIATED,
      completedAt: new Date(`${day}T01:00:00.000Z`),
    }));

    const result = HabitStrengthRules.evaluateComposite({
      logs,
      scheduledWeekdays: [],
      startDate: '2026-03-10',
      latestSrbaiScore: 50,
      contextSnapshots: [],
      now: new Date('2026-03-30T02:00:00.000Z'),
    });

    expect(result.scheduledDays).toBe(20);
    expect(result.consistencyScore).toBe(25);
    expect(result.contextStabilityScore).toBeNull();
    expect(result.stage).not.toBe('insufficient_data');
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

  it('keeps MODERATE_SUPPORT for a strong habit that still depends on reminders', () => {
    const result = HabitStrengthRules.recommendTaperingPolicy('strong', 0.2);
    expect(result.recommendedMode).toBe(ReminderPolicyMode.MODERATE_SUPPORT);
    expect(result.maxPerDay).toBe(3);
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
