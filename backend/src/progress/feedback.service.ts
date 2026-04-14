import { Inject, Injectable } from '@nestjs/common';
import type {
  IDifficultyFeedbackRepository,
} from '../domain/repositories/difficulty-feedback.repository';
import { DIFFICULTY_FEEDBACK_REPOSITORY } from '../domain/repositories/difficulty-feedback.repository';
import type {
  IReflectionRepository,
} from '../domain/repositories/reflection.repository';
import { REFLECTION_REPOSITORY } from '../domain/repositories/reflection.repository';
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import type { IReminderPolicyRepository } from '../domain/repositories/reminder-policy.repository';
import { REMINDER_POLICY_REPOSITORY } from '../domain/repositories/reminder-policy.repository';
import {
  AdaptationRules,
  AdaptationRecommendation,
} from '../domain/rules/adaptation.rules';
import { HabitStrengthRules } from '../domain/rules/habit-strength.rules';
import { DifficultyRating, SubmitDifficultyDto } from './dto/submit-difficulty.dto';
import { SubmitReflectionDto } from './dto/submit-reflection.dto';
import { HabitsService } from '../habits/habits.service';
import { SrbaiService } from '../habits/srbai.service';
import { CompletionTriggerSource, HabitLogStatus } from '../domain/enums/domain.enums';

const DIFFICULTY_SCORE: Record<DifficultyRating, number> = {
  [DifficultyRating.VERY_EASY]: 1,
  [DifficultyRating.EASY]: 2,
  [DifficultyRating.MODERATE]: 3,
  [DifficultyRating.HARD]: 4,
  [DifficultyRating.VERY_HARD]: 5,
};
const REVERSE_DIFFICULTY: Record<number, DifficultyRating> = {
  1: DifficultyRating.VERY_EASY,
  2: DifficultyRating.EASY,
  3: DifficultyRating.MODERATE,
  4: DifficultyRating.HARD,
  5: DifficultyRating.VERY_HARD,
};

/**
 * Application service — Post-completion feedback & Adaptation
 *
 * Difficulty and reflection entries now persist to dedicated domain tables
 * (difficulty_feedbacks, reflections) instead of UserActivityLog.
 *
 * Adaptation recommendation is computed fully server-side from persisted data.
 *
 * Thesis mapping: "Хэцүүдэлт & Тусан зохицол · Difficulty feedback & Adaptation"
 */
@Injectable()
export class FeedbackService {
  constructor(
    @Inject(DIFFICULTY_FEEDBACK_REPOSITORY)
    private readonly difficultyRepo: IDifficultyFeedbackRepository,
    @Inject(REFLECTION_REPOSITORY)
    private readonly reflectionRepo: IReflectionRepository,
    @Inject(HABIT_LOG_REPOSITORY)
    private readonly habitLogRepo: IHabitLogRepository,
    @Inject(REMINDER_POLICY_REPOSITORY)
    private readonly policyRepo: IReminderPolicyRepository,
    private readonly habitsService: HabitsService,
    private readonly srbaiService: SrbaiService,
  ) {}

  // ── Difficulty rating ──────────────────────────────────────────────────────

  async submitDifficulty(
    userId: string,
    habitId: string,
    logId: string,
    dto: SubmitDifficultyDto,
  ) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);

    const entry = await this.difficultyRepo.create({
      userId,
      habitId,
      logId,
      rating: dto.rating,
      note: dto.note ?? null,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });

    return {
      id: entry.id,
      logId: entry.logId,
      rating: entry.rating as DifficultyRating,
      note: entry.note,
      occurredAt: entry.occurredAt.toISOString(),
    };
  }

  async listDifficultyRatings(userId: string, habitId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    const entries = await this.difficultyRepo.findAllByHabitId(habitId);
    return entries.map((e) => ({
      id: e.id,
      logId: e.logId,
      rating: e.rating as DifficultyRating,
      note: e.note,
      occurredAt: e.occurredAt.toISOString(),
    }));
  }

  // ── Reflection ────────────────────────────────────────────────────────────

  async submitReflection(
    userId: string,
    habitId: string,
    logId: string,
    dto: SubmitReflectionDto,
  ) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);

    const entry = await this.reflectionRepo.create({
      userId,
      habitId,
      logId,
      text: dto.text,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });

    return {
      id: entry.id,
      logId: entry.logId,
      text: entry.text,
      occurredAt: entry.occurredAt.toISOString(),
    };
  }

  // ── Adaptation recommendation (fully server-side) ─────────────────────────

  /**
   * Computes the adaptation recommendation entirely from persisted data.
   * No client-supplied derived metrics are accepted.
   */
  async getAdaptationRecommendation(
    userId: string,
    habitId: string,
  ): Promise<AdaptationRecommendation> {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);

    // Gather all data sources in parallel
    const [composite, recentDifficulty, logs, policy] = await Promise.all([
      this.srbaiService.getCompositeScore(userId, habitId).catch(() => null),
      this.difficultyRepo.findRecentByHabitId(habitId, 5),
      this.habitLogRepo.findSummaryByHabitId(habitId),
      this.policyRepo.findByHabitId(habitId),
    ]);

    // doneCount and source rates from log history
    const doneLogs = logs.filter((l) => l.status === HabitLogStatus.DONE);
    const doneCount = doneLogs.length;
    const selfInitCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.SELF_INITIATED,
    ).length;
    const reminderCount = doneLogs.filter(
      (l) => l.triggerSource === CompletionTriggerSource.REMINDER_TRIGGERED,
    ).length;
    const selfInitiatedRate =
      doneCount > 0
        ? Math.round((selfInitCount / doneCount) * 1000) / 1000
        : 0;
    const reminderDependenceRate =
      doneCount > 0
        ? Math.round((reminderCount / doneCount) * 1000) / 1000
        : 0;

    // Derive recent average difficulty from last 5 entries
    let recentDifficultyLevel: DifficultyRating | null = null;
    if (recentDifficulty.length > 0) {
      const avg =
        recentDifficulty.reduce(
          (sum, e) => sum + (DIFFICULTY_SCORE[e.rating as DifficultyRating] ?? 3),
          0,
        ) / recentDifficulty.length;
      recentDifficultyLevel = REVERSE_DIFFICULTY[Math.round(avg)] ?? null;
    }

    return AdaptationRules.recommend({
      compositeScore: composite?.finalScore ?? null,
      selfInitiatedRate,
      reminderDependenceRate,
      doneCount,
      recentDifficultyLevel,
      currentPolicyMode: policy?.mode ?? null,
    });
  }
}
