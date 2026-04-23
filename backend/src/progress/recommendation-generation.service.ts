import { Inject, Injectable } from '@nestjs/common';
import {
  RecommendationCode,
  ReasonCode,
  Priority,
  CompletionTriggerSource,
  HabitLogStatus,
} from '../domain/enums/domain.enums';
import type { IAdaptationRecommendationRepository } from '../domain/repositories/adaptation-recommendation.repository';
import { ADAPTATION_RECOMMENDATION_REPOSITORY } from '../domain/repositories/adaptation-recommendation.repository';
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import type { IDifficultyFeedbackRepository } from '../domain/repositories/difficulty-feedback.repository';
import { DIFFICULTY_FEEDBACK_REPOSITORY } from '../domain/repositories/difficulty-feedback.repository';
import type { IReminderPolicyRepository } from '../domain/repositories/reminder-policy.repository';
import { REMINDER_POLICY_REPOSITORY } from '../domain/repositories/reminder-policy.repository';
import { HabitsService } from '../habits/habits.service';
import { SrbaiService } from '../habits/srbai.service';

const DIFFICULTY_SCORE: Record<string, number> = {
  very_easy: 1,
  easy: 2,
  moderate: 3,
  hard: 4,
  very_hard: 5,
};

/** contextStabilityScore below this threshold triggers ADJUST_CUE (0–100 scale). */
const CONTEXT_STABILITY_LOW_THRESHOLD = 40;

interface RecommendationMapping {
  code: RecommendationCode;
  reasonCode: ReasonCode;
  title: string;
  message: string;
  priority: Priority;
  articleIds: string[];
}

/**
 * Application service — Recommendation Generation
 *
 * Priority-ordered rule engine that generates ONE primary recommendation per habit.
 * Existing ACTIVE recommendations are expired before the new one is persisted.
 *
 * Rule priority (first match wins):
 *  1. REDUCE_TARGET           — doneCount >= 5 AND hard AND partialDoneRate >= 0.5
 *  2. SIMPLIFY_HABIT          — doneCount >= 5 AND recentAvgDifficulty >= hard
 *  3. REVIEW_REMINDER_DEPENDENCE — doneCount >= 5 AND reminderDependenceRate >= 0.7
 *  4. ADJUST_CUE              — doneCount >= 5 AND contextStabilityScore < 40
 *  5. INCREASE_SUPPORT        — compositeScore < 40 AND doneRate < 0.4
 *  6. BUILD_CONSISTENCY       — doneCount >= 3 AND (selfInitiatedRate < 0.4 OR doneRate < 0.5)
 *  7. CELEBRATE_CONSISTENCY   — doneCount ∈ {7, 21, 66}
 */
@Injectable()
export class RecommendationGenerationService {
  constructor(
    @Inject(ADAPTATION_RECOMMENDATION_REPOSITORY)
    private readonly recommendationRepo: IAdaptationRecommendationRepository,
    @Inject(HABIT_LOG_REPOSITORY)
    private readonly habitLogRepo: IHabitLogRepository,
    @Inject(DIFFICULTY_FEEDBACK_REPOSITORY)
    private readonly difficultyRepo: IDifficultyFeedbackRepository,
    @Inject(REMINDER_POLICY_REPOSITORY)
    private readonly policyRepo: IReminderPolicyRepository,
    private readonly habitsService: HabitsService,
    private readonly srbaiService: SrbaiService,
  ) {}

  /**
   * Generate and persist a single primary recommendation for a habit.
   * Expires all currently ACTIVE recommendations for the habit first,
   * then creates the new primary one (or none if no rule fires).
   */
  async generateRecommendations(
    userId: string,
    habitId: string,
  ): Promise<any[]> {
    const habit = await this.habitsService.getOwnedHabitOrThrow(
      userId,
      habitId,
    );

    // Gather signals in parallel (full logs needed for actualValue)
    const [composite, recentDifficulty, logs] = await Promise.all([
      this.srbaiService.getCompositeScore(userId, habitId).catch(() => null),
      this.difficultyRepo.findRecentByHabitId(habitId, 5),
      this.habitLogRepo.findAllByHabitId(habitId),
    ]);

    // Completion rates
    const doneLogs = logs.filter((l) => l.status === HabitLogStatus.DONE);
    const doneCount = doneLogs.length;
    const totalLogs = logs.length;
    const doneRate = totalLogs > 0 ? doneCount / totalLogs : 0;

    const selfInitCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.SELF_INITIATED,
    ).length;
    const reminderCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.REMINDER_TRIGGERED,
    ).length;
    const selfInitiatedRate = doneCount > 0 ? selfInitCount / doneCount : 0;
    const reminderDependenceRate =
      doneCount > 0 ? reminderCount / doneCount : 0;

    // Recent average difficulty (last 5 feedbacks)
    let recentAvgDifficultyScore: number | null = null;
    if (recentDifficulty.length > 0) {
      recentAvgDifficultyScore =
        recentDifficulty.reduce(
          (sum: number, e: { rating: string }) =>
            sum + (DIFFICULTY_SCORE[e.rating] ?? 3),
          0,
        ) / recentDifficulty.length;
    }
    const hardDifficulty =
      recentAvgDifficultyScore !== null && recentAvgDifficultyScore >= 4;

    // REDUCE_TARGET signal: done logs that only hit minimumTarget but missed targetValue
    const partialDoneCount = doneLogs.filter(
      (l) =>
        l.actualValue !== null &&
        l.actualValue >= habit.minimumTarget &&
        l.actualValue < habit.targetValue,
    ).length;
    const partialDoneRate = doneCount > 0 ? partialDoneCount / doneCount : 0;

    // Context stability and composite score from SRBAI service
    const contextStabilityScore = composite?.contextStabilityScore ?? null;
    const compositeScore = composite?.finalScore ?? null;

    // Determine the single primary recommendation (first rule that fires)
    const rec = this.computePrimaryRecommendation({
      compositeScore,
      selfInitiatedRate,
      reminderDependenceRate,
      doneCount,
      doneRate,
      hardDifficulty,
      contextStabilityScore,
      partialDoneRate,
    });

    // Expire all currently ACTIVE recommendations for this habit
    await this.recommendationRepo.expireActiveByHabit(habitId);

    if (!rec) return [];

    const created = await this.recommendationRepo.create({
      userId,
      habitId,
      recommendationCode: rec.code,
      reasonCode: rec.reasonCode,
      title: rec.title,
      message: rec.message,
      priority: rec.priority,
      articleIds: rec.articleIds,
      generatedAt: new Date(),
      expiresAt: null,
    });

    return [created];
  }

  /**
   * Priority-ordered rule engine — returns the FIRST matching recommendation.
   * Only one primary recommendation is returned per habit per refresh.
   */
  private computePrimaryRecommendation(signals: {
    compositeScore: number | null;
    selfInitiatedRate: number;
    reminderDependenceRate: number;
    doneCount: number;
    doneRate: number;
    hardDifficulty: boolean;
    contextStabilityScore: number | null;
    partialDoneRate: number;
  }): RecommendationMapping | null {
    const {
      compositeScore,
      selfInitiatedRate,
      reminderDependenceRate,
      doneCount,
      doneRate,
      hardDifficulty,
      contextStabilityScore,
      partialDoneRate,
    } = signals;

    // Rule 1 (highest priority): hard difficulty AND user consistently hits minimumTarget
    // but misses targetValue — reduce the target, not the habit steps
    if (doneCount >= 5 && hardDifficulty && partialDoneRate >= 0.5) {
      return {
        code: RecommendationCode.REDUCE_TARGET,
        reasonCode: ReasonCode.HIGH_DIFFICULTY,
        title: 'Зорилтот утгыг бага болго',
        message:
          'Та дадлаа зорилтот хэмжээнд хүргэхэд удаа дараа хүндрэлтэй байсан ч доод зорилтдоо хүрч байна. Зорилтоо хялбарчилж, тогтвортой гүйцэтгэлийг бий болго.',
        priority: Priority.HIGH,
        articleIds: ['reduce-friction', 'habit-small-steps'],
      };
    }

    // Rule 2: hard difficulty without a clear partial-completion pattern — simplify the habit steps
    if (doneCount >= 5 && hardDifficulty) {
      return {
        code: RecommendationCode.SIMPLIFY_HABIT,
        reasonCode: ReasonCode.HIGH_DIFFICULTY,
        title: 'Дадлыг хялбарчил',
        message:
          'Та энэ дадлыг сүүлд удаа дараалан "хэцүү" эсвэл "маш хэцүү" гэж үнэлсэн байна. Алхамуудыг жижиглэж, хийхэд шаардагдах хүчин чармайлтыг бага болго.',
        priority: Priority.HIGH,
        articleIds: ['habit-small-steps', 'reduce-friction'],
      };
    }

    // Rule 3: relying too heavily on reminders to complete the habit
    if (doneCount >= 5 && reminderDependenceRate >= 0.7) {
      return {
        code: RecommendationCode.REVIEW_REMINDER_DEPENDENCE,
        reasonCode: ReasonCode.HIGH_REMINDER_DEPENDENCE,
        title: 'Сануулагчаас хамаарлаа бага болго',
        message:
          'Таны дадлын ихэнх нь сануулагчаар гүйцэтгэгдсэн байна. Сануулагчгүйгээр өөрийн санаачлагаар дадлаа хийх чадварыг хөгжүүл.',
        priority: Priority.MEDIUM,
        articleIds: ['reduce-reminder-dependence', 'build-consistency'],
      };
    }

    // Rule 4: cue/time/location context not yet stable
    if (
      doneCount >= 5 &&
      contextStabilityScore !== null &&
      contextStabilityScore < CONTEXT_STABILITY_LOW_THRESHOLD
    ) {
      return {
        code: RecommendationCode.ADJUST_CUE,
        reasonCode: ReasonCode.LOW_CONTEXT_STABILITY,
        title: 'Дадлын цуур тэмдгийг тогтвортой болго',
        message:
          'Таны дадлын өдөөгч өмнөх үйлдлүүдтэй харьцангуй тогтвор муутай байна. Тогтсон цуур тэмдэг тогтворгүй дадлыг бэхжүүлдэг.',
        priority: Priority.MEDIUM,
        articleIds: ['fix-your-cues'],
      };
    }

    // Rule 5: overall signals weak — increase support
    if (compositeScore !== null && compositeScore < 40 && doneRate < 0.4) {
      return {
        code: RecommendationCode.INCREASE_SUPPORT,
        reasonCode: ReasonCode.LOW_CONSISTENCY,
        title: 'Дадлын дэмжлэгийг нэмэгдүүл',
        message:
          'Таны дадлын нийлмэл оноо болон гүйцэтгэлийн хувь аль аль нь бага байна. Дадлаа хийхэд орчноо зохион байгуулж, дэмжлэг нэмж өгөөрэй.',
        priority: Priority.MEDIUM,
        articleIds: ['build-consistency', 'reduce-friction'],
      };
    }

    // Rule 6: habit not yet stable — improve repetition and regularity
    if (doneCount >= 3 && (selfInitiatedRate < 0.4 || doneRate < 0.5)) {
      const buildReasonCode =
        selfInitiatedRate < 0.4
          ? ReasonCode.LOW_SELF_INITIATED_RATE
          : ReasonCode.LOW_CONSISTENCY;
      return {
        code: RecommendationCode.BUILD_CONSISTENCY,
        reasonCode: buildReasonCode,
        title: 'Дадлын тогтвортой байдлыг бий болго',
        message:
          'Дадлаа тогтмол давтаж хийх нь чухал. Дутуу өдрүүдийн дараа сэргэж, давтамжаа нэмэгдүүл.',
        priority: Priority.MEDIUM,
        articleIds: ['build-consistency', 'recover-after-missed-days'],
      };
    }

    // Rule 7: early-stage encouragement — not enough data for data-driven advice yet
    if (doneCount >= 1 && doneCount < 3) {
      return {
        code: RecommendationCode.BUILD_CONSISTENCY,
        reasonCode: ReasonCode.LOW_CONSISTENCY,
        title: 'Эхлэл тавьсан — дадлаа үргэлжлүүл!',
        message:
          'Дадлын эхэн үе хамгийн чухал. Тогтмол давтаж хийснээр тархи автоматаар биелүүлэх болдог. Дадлаа өдөр бүр хийхийг хичээгээрэй.',
        priority: Priority.LOW,
        articleIds: ['build-consistency'],
      };
    }

    // Rule 8 (lowest priority): milestone-based positive reinforcement
    if (doneCount === 7 || doneCount === 21 || doneCount === 66) {
      const milestoneMessage =
        doneCount === 66
          ? 'Та 66 удаа дадлаа хийсэн байна. Эрдэмтэдийн судалгаагаар энэ нь дадал тогтворжиж эхэлсний хүчтэй дохио. Үргэлжлүүл!'
          : doneCount === 21
            ? 'Та 21 удаа дадлаа хийсэн байна. Сайн явж байна — дадал идэвхтэй бүрдэж байгааг харуулж байна.'
            : 'Та 7 удаа дадлаа хийсэн байна. Жишиг газарт хүрлээ — дадлаа үргэлжлүүлэн хийж байгаарай!';
      return {
        code: RecommendationCode.CELEBRATE_CONSISTENCY,
        reasonCode: ReasonCode.MILESTONE_REACHED,
        title: `${doneCount} удаа гүйцэтгэсэн — тэмдэглэх цаг!`,
        message: milestoneMessage,
        priority: Priority.LOW,
        articleIds: ['maintain-strong-habits'],
      };
    }

    return null;
  }
}
