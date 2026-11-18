import {
  HabitLogStatus,
  CompletionTriggerSource,
  HabitStrengthStage as CompositeStage,
  ReminderPolicyMode,
  Weekday,
} from '../enums/domain.enums';
import { addDaysToYmd, appDateOf, weekdayIndexOfYmd } from '../../shared/time';

export type HabitStrengthStage =
  | 'insufficient_data'
  | 'early_stage'
  | 'building'
  | 'established';

// ── Phase 4B: SRBAI + composite score + tapering ──────────────────────────────

export interface SrbaiScoreInput {
  item1: number;
  item2: number;
  item3: number;
  item4: number;
}

export interface SrbaiScoreResult {
  rawAverage: number;
  normalizedScore100: number;
}

/** null = not enough evidence to compute this component. */
export interface CompositeScoreInput {
  srbaiScore: number | null; // 0–100
  consistencyScore: number | null; // 0–100
  contextStabilityScore: number | null; // 0–100
  selfInitiatedRate: number; // 0–1
}

export type CompositeStageResult = CompositeStage | 'insufficient_data';

export interface CompositeScoreResult {
  srbaiScore: number | null;
  consistencyScore: number | null;
  contextStabilityScore: number | null;
  selfInitiatedRate: number;
  /** null when SRBAI or schedule adherence is missing (insufficient data). */
  finalScore: number | null;
  stage: CompositeStageResult;
  evaluatedAt: string;
  /** Scheduled days and completed scheduled days behind consistencyScore. */
  scheduledDays?: number;
  completedScheduledDays?: number;
}

/** Window and minimum evidence for schedule adherence (consistency). */
export const ADHERENCE_WINDOW_DAYS = 28;
export const MIN_SCHEDULED_DAYS = 7;
/** Minimum completions with a known hour before context stability is scored. */
export const MIN_CONTEXT_SNAPSHOTS = 5;

/** Version of the SRBAI items shown to users (2 = Gardner et al. 2012 wording). */
export const CURRENT_SRBAI_INSTRUMENT_VERSION = 2;

const JS_DAY_TO_WEEKDAY: Weekday[] = [
  Weekday.SUNDAY,
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
];

export interface TaperingRecommendation {
  recommendedMode: ReminderPolicyMode;
  cooldownMinutes: number;
  maxPerDay: number;
  narrowingLevel: number;
  rationale: string;
}

export interface HabitStrengthInput {
  habitId: string;
  logs: Array<{
    status: HabitLogStatus;
    triggerSource: CompletionTriggerSource;
  }>;
  scheduledWeekdayCount: number;
  hasCueConfiguration: boolean;
  hasMotivationProfile: boolean;
}

export interface HabitStrengthResult {
  habitId: string;
  totalLogs: number;
  doneCount: number;
  partialCount: number;
  notDoneCount: number;
  doneRate: number;
  selfInitiatedRate: number;
  scheduledWeekdayCount: number;
  hasCueConfiguration: boolean;
  hasMotivationProfile: boolean;
  stage: HabitStrengthStage;
  evaluatedAt: string;
}

/**
 * Domain rules — Habit Strength (SRBAI model input signals)
 * Pure computation of habit-strength signals from completion history.
 * Thesis mapping: "Дадлын хүч · Habit strength · SRBAI" from the Domain layer.
 */
export class HabitStrengthRules {
  static compute(input: HabitStrengthInput): HabitStrengthResult {
    const {
      logs,
      habitId,
      scheduledWeekdayCount,
      hasCueConfiguration,
      hasMotivationProfile,
    } = input;

    const totalLogs = logs.length;
    let doneCount = 0;
    let notDoneCount = 0;
    let selfInitiatedCount = 0;

    for (const log of logs) {
      if (log.status === HabitLogStatus.DONE) {
        doneCount++;
        if (log.triggerSource === CompletionTriggerSource.SELF_INITIATED) {
          selfInitiatedCount++;
        }
      } else {
        notDoneCount++;
      }
    }

    return {
      habitId,
      totalLogs,
      doneCount,
      partialCount: notDoneCount,
      notDoneCount,
      doneRate:
        totalLogs > 0 ? Math.round((doneCount / totalLogs) * 1000) / 1000 : 0,
      selfInitiatedRate:
        doneCount > 0
          ? Math.round((selfInitiatedCount / doneCount) * 1000) / 1000
          : 0,
      scheduledWeekdayCount,
      hasCueConfiguration,
      hasMotivationProfile,
      stage: HabitStrengthRules.determineStage(totalLogs),
      evaluatedAt: new Date().toISOString(),
    };
  }

  static determineStage(totalLogs: number): HabitStrengthStage {
    if (totalLogs < 5) return 'insufficient_data';
    if (totalLogs < 15) return 'early_stage';
    if (totalLogs < 30) return 'building';
    return 'established';
  }

  /**
   * Context stability (0–100) from recent DONE completions, using only
   * context the app actually observed when the completion was logged:
   *
   *  - Time: share of completions within ±1 hour of the best centre hour
   *    (Ulaanbaatar time), i.e. how often the habit happens in the same
   *    3-hour band.
   *  - Place: share of completions at the most common saved reminder place.
   *    Used only when at least one completion was observed at a saved place
   *    (requires location sharing).
   *
   * The habit's configured preceding routine is not used: copying a setting
   * into every log would always look perfectly stable without observing
   * anything. Returns null with fewer than MIN_CONTEXT_SNAPSHOTS completions
   * that have a known hour.
   */
  static computeContextStability(
    snapshots: Array<{
      completionHour: number | null;
      coarseLocation: string | null;
    }>,
  ): number | null {
    const observed = snapshots.filter((s) => s.completionHour !== null);
    if (observed.length < MIN_CONTEXT_SNAPSHOTS) return null;
    const n = observed.length;

    const hourDistance = (a: number, b: number) => {
      const diff = Math.abs(a - b) % 24;
      return Math.min(diff, 24 - diff);
    };
    let bestHourCount = 0;
    for (let centre = 0; centre < 24; centre += 1) {
      const count = observed.filter(
        (s) => hourDistance(s.completionHour!, centre) <= 1,
      ).length;
      bestHourCount = Math.max(bestHourCount, count);
    }
    const rates = [bestHourCount / n];

    const places = observed.map((s) => s.coarseLocation);
    if (places.some((place) => place !== null)) {
      const counts = new Map<string, number>();
      for (const place of places) {
        if (place !== null) counts.set(place, (counts.get(place) ?? 0) + 1);
      }
      rates.push(Math.max(...counts.values()) / n);
    }

    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    return Math.round(avg * 100 * 100) / 100; // 2 decimal places, 0–100
  }

  /**
   * Schedule adherence: share of scheduled days on which the habit was done,
   * over the last ADHERENCE_WINDOW_DAYS days (Ulaanbaatar calendar days,
   * not before the start date). Missed scheduled days count against it, which
   * a done-logs-over-all-logs ratio cannot show. Today is included only once
   * it is done, so an unfinished day is not counted as missed.
   * `rate` is null with fewer than MIN_SCHEDULED_DAYS scheduled days.
   */
  static computeScheduleAdherence(input: {
    doneDays: ReadonlySet<string>;
    /** Empty means every day. */
    scheduledWeekdays: Weekday[];
    startDate: string;
    today: string;
    windowDays?: number;
  }): {
    scheduledDays: number;
    completedScheduledDays: number;
    rate: number | null;
  } {
    const windowDays = input.windowDays ?? ADHERENCE_WINDOW_DAYS;
    const isScheduled = (ymd: string) =>
      input.scheduledWeekdays.length === 0 ||
      input.scheduledWeekdays.includes(
        JS_DAY_TO_WEEKDAY[weekdayIndexOfYmd(ymd)],
      );

    const windowStart = addDaysToYmd(input.today, -windowDays);
    let day = input.startDate > windowStart ? input.startDate : windowStart;
    let scheduledDays = 0;
    let completedScheduledDays = 0;

    for (; day <= input.today; day = addDaysToYmd(day, 1)) {
      if (!isScheduled(day)) continue;
      const done = input.doneDays.has(day);
      if (day === input.today && !done) continue;
      scheduledDays += 1;
      if (done) completedScheduledDays += 1;
    }

    return {
      scheduledDays,
      completedScheduledDays,
      rate:
        scheduledDays >= MIN_SCHEDULED_DAYS
          ? completedScheduledDays / scheduledDays
          : null,
    };
  }

  /**
   * The composite habit-strength estimate for one habit, from raw data.
   * Both the dashboard and the analytics endpoint use this single function.
   */
  static evaluateComposite(input: {
    logs: Array<{
      status: HabitLogStatus;
      triggerSource: CompletionTriggerSource;
      completedAt: Date;
    }>;
    scheduledWeekdays: Weekday[];
    startDate: string;
    latestSrbaiScore: number | null;
    contextSnapshots: Array<{
      completionHour: number | null;
      coarseLocation: string | null;
    }>;
    now: Date;
  }): CompositeScoreResult {
    const signals = HabitStrengthRules.compute({
      habitId: '',
      logs: input.logs,
      scheduledWeekdayCount: input.scheduledWeekdays.length,
      hasCueConfiguration: false,
      hasMotivationProfile: false,
    });

    const doneDays = new Set(
      input.logs
        .filter((log) => log.status === HabitLogStatus.DONE)
        .map((log) => appDateOf(new Date(log.completedAt))),
    );
    const adherence = HabitStrengthRules.computeScheduleAdherence({
      doneDays,
      scheduledWeekdays: input.scheduledWeekdays,
      startDate: input.startDate,
      today: appDateOf(input.now),
    });

    const composite = HabitStrengthRules.computeComposite({
      srbaiScore: input.latestSrbaiScore,
      consistencyScore:
        adherence.rate === null
          ? null
          : Math.round(adherence.rate * 100 * 100) / 100,
      contextStabilityScore: HabitStrengthRules.computeContextStability(
        input.contextSnapshots,
      ),
      selfInitiatedRate: signals.selfInitiatedRate,
    });

    return {
      ...composite,
      evaluatedAt: input.now.toISOString(),
      scheduledDays: adherence.scheduledDays,
      completedScheduledDays: adherence.completedScheduledDays,
    };
  }

  // ── Phase 4B: SRBAI scoring ───────────────────────────────────────────────

  static scoreSrbai(input: SrbaiScoreInput): SrbaiScoreResult {
    const rawAverage =
      (input.item1 + input.item2 + input.item3 + input.item4) / 4;
    const normalizedScore100 = Math.round(((rawAverage - 1) / 6) * 10000) / 100;
    return { rawAverage, normalizedScore100 };
  }

  // ── Phase 4B: Composite score ─────────────────────────────────────────────

  /**
   * Final score formula:
   *   finalScore = 0.60 * srbaiScore
   *              + 0.25 * consistencyScore
   *              + 0.15 * contextStabilityScore
   *
   * Stage mapping:
   *   0–39  → weak
   *   40–69 → building
   *   70–100 → strong
   *
   * Missing evidence is never scored as 0:
   *   - no SRBAI answer or too few scheduled days → finalScore null,
   *     stage 'insufficient_data';
   *   - no context data yet → the other two weights are rescaled
   *     (0.6 and 0.25 out of 0.85).
   * The result is a heuristic estimate, not a validated measure.
   */
  static computeComposite(input: CompositeScoreInput): CompositeScoreResult {
    const base = {
      srbaiScore: input.srbaiScore,
      consistencyScore: input.consistencyScore,
      contextStabilityScore: input.contextStabilityScore,
      selfInitiatedRate: input.selfInitiatedRate,
      evaluatedAt: new Date().toISOString(),
    };

    if (input.srbaiScore === null || input.consistencyScore === null) {
      return { ...base, finalScore: null, stage: 'insufficient_data' };
    }

    const parts: Array<[weight: number, value: number]> = [
      [0.6, input.srbaiScore],
      [0.25, input.consistencyScore],
    ];
    if (input.contextStabilityScore !== null) {
      parts.push([0.15, input.contextStabilityScore]);
    }
    const totalWeight = parts.reduce((sum, [weight]) => sum + weight, 0);
    const weighted = parts.reduce(
      (sum, [weight, value]) => sum + weight * value,
      0,
    );
    const finalScore = Math.round((weighted / totalWeight) * 100) / 100;

    let stage: CompositeStage;
    if (finalScore >= 70) {
      stage = 'strong';
    } else if (finalScore >= 40) {
      stage = 'building';
    } else {
      stage = 'weak';
    }

    return { ...base, finalScore, stage };
  }

  // ── Phase 4B: Tapering recommendation ────────────────────────────────────

  /**
   * Deterministic policy derivation from habit-strength stage + self-initiated rate.
   *
   *   strong + selfInitiatedRate >= 0.7  → MINIMAL
   *   strong + selfInitiatedRate >= 0.4  → FADE_OUT
   *   strong + selfInitiatedRate <  0.4  → MODERATE_SUPPORT (still reminder-dependent)
   *   building any                       → MODERATE_SUPPORT
   *   weak any                           → FULL_SUPPORT
   *
   * Support never increases because a habit is strong: a strong habit that
   * still depends on reminders keeps moderate support rather than falling
   * through to the full support meant for weak habits.
   */
  static recommendTaperingPolicy(
    stage: CompositeStage,
    selfInitiatedRate: number,
  ): TaperingRecommendation {
    if (stage === 'strong' && selfInitiatedRate >= 0.7) {
      return {
        recommendedMode: ReminderPolicyMode.MINIMAL,
        cooldownMinutes: 240,
        maxPerDay: 1,
        narrowingLevel: 3,
        rationale:
          'Habit is strong and mostly self-initiated. Minimal reminder support.',
      };
    }
    if (stage === 'strong' && selfInitiatedRate >= 0.4) {
      return {
        recommendedMode: ReminderPolicyMode.FADE_OUT,
        cooldownMinutes: 120,
        maxPerDay: 2,
        narrowingLevel: 2,
        rationale:
          'Habit is strong but still partially reminder-dependent. Fade-out support.',
      };
    }
    if (stage === 'building' || stage === 'strong') {
      return {
        recommendedMode: ReminderPolicyMode.MODERATE_SUPPORT,
        cooldownMinutes: 60,
        maxPerDay: 3,
        narrowingLevel: 1,
        rationale:
          'Habit is still forming. Moderate reminder support recommended.',
      };
    }
    // weak
    return {
      recommendedMode: ReminderPolicyMode.FULL_SUPPORT,
      cooldownMinutes: 30,
      maxPerDay: 4,
      narrowingLevel: 0,
      rationale: 'Habit is weak. Full reminder support to build the loop.',
    };
  }
}
