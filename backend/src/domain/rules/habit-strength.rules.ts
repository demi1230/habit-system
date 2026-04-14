import {
  HabitLogStatus,
  CompletionTriggerSource,
  HabitStrengthStage as CompositeStage,
  ReminderPolicyMode,
} from '../enums/domain.enums';

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

export interface CompositeScoreInput {
  srbaiScore: number; // 0–100
  consistencyScore: number; // 0–100
  contextStabilityScore: number; // 0–100
  selfInitiatedRate: number; // 0–1
}

export interface CompositeScoreResult {
  srbaiScore: number;
  consistencyScore: number;
  contextStabilityScore: number;
  selfInitiatedRate: number;
  finalScore: number;
  stage: CompositeStage;
  evaluatedAt: string;
}

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
   * Computes a context-stability score (0–100) from the last N DONE log snapshots.
   *
   * Three sub-dimensions are measured: hour-of-completion, coarse location, and
   * preceding routine. For each dimension, the "modal value rate" measures how
   * consistently a single value dominates. The final score is the average of
   * whichever dimensions have at least one recorded value.
   *
   * With no snapshots the score is 0.
   *
   * Example: if 8/10 completions happen at the same hour, location rate is 7/10,
   * and routine rate is 9/10 → contextStabilityScore = round((0.8+0.7+0.9)/3 * 100) = 80
   */
  static computeContextStability(
    snapshots: Array<{
      completionHour: number | null;
      coarseLocation: string | null;
      precedingRoutine: string | null;
    }>,
  ): number {
    if (snapshots.length === 0) return 0;
    const n = snapshots.length;

    const modalRate = (
      values: Array<string | number | null>,
    ): number | null => {
      const valid = values.filter((v) => v !== null);
      if (valid.length === 0) return null;
      const freq = new Map<string | number, number>();
      for (const v of valid) freq.set(v, (freq.get(v) ?? 0) + 1);
      const maxCount = Math.max(...freq.values());
      return maxCount / n; // relative to total, not just valid entries
    };

    const rates = [
      modalRate(snapshots.map((s) => s.completionHour)),
      modalRate(snapshots.map((s) => s.coarseLocation)),
      modalRate(snapshots.map((s) => s.precedingRoutine)),
    ].filter((r): r is number => r !== null);

    if (rates.length === 0) return 0;
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    return Math.round(avg * 100 * 100) / 100; // 2 decimal places, 0–100
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
   */
  static computeComposite(input: CompositeScoreInput): CompositeScoreResult {
    const finalScore =
      Math.round(
        (0.6 * input.srbaiScore +
          0.25 * input.consistencyScore +
          0.15 * input.contextStabilityScore) *
          100,
      ) / 100;

    let stage: CompositeStage;
    if (finalScore >= 70) {
      stage = 'strong';
    } else if (finalScore >= 40) {
      stage = 'building';
    } else {
      stage = 'weak';
    }

    return {
      srbaiScore: input.srbaiScore,
      consistencyScore: input.consistencyScore,
      contextStabilityScore: input.contextStabilityScore,
      selfInitiatedRate: input.selfInitiatedRate,
      finalScore,
      stage,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // ── Phase 4B: Tapering recommendation ────────────────────────────────────

  /**
   * Deterministic policy derivation from habit-strength stage + self-initiated rate.
   *
   *   strong + selfInitiatedRate >= 0.7  → MINIMAL
   *   strong + selfInitiatedRate >= 0.4  → FADE_OUT
   *   building any                       → MODERATE_SUPPORT
   *   weak any                           → FULL_SUPPORT
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
    if (stage === 'building') {
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
