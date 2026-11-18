import { Inject, Injectable } from '@nestjs/common';
import {
  CompletionTriggerSource,
  HabitLogStatus,
} from '../domain/enums/domain.enums';
import {
  DISMISSED_SUPPRESSION_DAYS,
  RecommendationRules,
} from '../domain/rules/recommendation.rules';
import { appDateOf } from '../shared/time';
import type { IAdaptationRecommendationRepository } from '../domain/repositories/adaptation-recommendation.repository';
import { ADAPTATION_RECOMMENDATION_REPOSITORY } from '../domain/repositories/adaptation-recommendation.repository';
import type { AdaptationRecommendationEntity } from '../domain/entities/adaptation-recommendation.entity';
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

/**
 * Application service — Recommendation Generation
 *
 * Gathers a habit's signals, picks ONE primary recommendation with
 * RecommendationRules (src/domain/rules/recommendation.rules.ts, which lists
 * the rules and their priority) and persists it.
 *
 * - Regenerated at most once per Asia/Ulaanbaatar day while an active
 *   recommendation exists, so opening a habit repeatedly does not churn it.
 * - Codes the user dismissed in the last DISMISSED_SUPPRESSION_DAYS days are
 *   skipped in favour of the next matching rule.
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
  ): Promise<AdaptationRecommendationEntity[]> {
    const habit = await this.habitsService.getOwnedHabitOrThrow(
      userId,
      habitId,
    );

    const now = new Date();
    const active = await this.recommendationRepo.findActiveByUserAndHabit(
      userId,
      habitId,
    );
    if (
      active.some(
        (rec) => appDateOf(new Date(rec.generatedAt)) === appDateOf(now),
      )
    ) {
      return active;
    }

    // Gather signals in parallel (full logs needed for actualValue)
    const [composite, recentDifficulty, logs, dismissedCodes] =
      await Promise.all([
        this.srbaiService.getCompositeScore(userId, habitId).catch(() => null),
        this.difficultyRepo.findRecentByHabitId(habitId, 5),
        this.habitLogRepo.findAllByHabitId(habitId),
        this.recommendationRepo.findCodesDismissedSince(
          habitId,
          new Date(now.getTime() - DISMISSED_SUPPRESSION_DAYS * 86_400_000),
        ),
      ]);

    // Completion rates. Consistency is the share of scheduled days done
    // (schedule adherence) once there are enough scheduled days; before
    // that, the share of logged days that reached the minimum.
    const doneLogs = logs.filter((l) => l.status === HabitLogStatus.DONE);
    const doneCount = doneLogs.length;
    const totalLogs = logs.length;
    const doneRate =
      composite?.consistencyScore != null
        ? composite.consistencyScore / 100
        : totalLogs > 0
          ? doneCount / totalLogs
          : 0;

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

    // The single primary recommendation (first matching, not recently dismissed)
    const rec = RecommendationRules.choose(
      {
        compositeScore,
        selfInitiatedRate,
        reminderDependenceRate,
        doneCount,
        doneRate,
        hardDifficulty,
        contextStabilityScore,
        partialDoneRate,
      },
      new Set(dismissedCodes),
    );

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
}
