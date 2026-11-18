import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IDifficultyFeedbackRepository } from '../domain/repositories/difficulty-feedback.repository';
import { DIFFICULTY_FEEDBACK_REPOSITORY } from '../domain/repositories/difficulty-feedback.repository';
import type { IReflectionRepository } from '../domain/repositories/reflection.repository';
import { REFLECTION_REPOSITORY } from '../domain/repositories/reflection.repository';
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import {
  DifficultyRating,
  SubmitDifficultyDto,
} from './dto/submit-difficulty.dto';
import { SubmitReflectionDto } from './dto/submit-reflection.dto';
import { HabitsService } from '../habits/habits.service';

/**
 * Application service — Post-completion feedback
 *
 * Difficulty ratings and reflections persist to dedicated domain tables
 * (difficulty_feedbacks, reflections). Recommendations built from these
 * signals live in RecommendationGenerationService / RecommendationRules.
 *
 * Thesis mapping: "Хэцүүдэлт & Тусгал · Difficulty feedback & Reflection"
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
    private readonly habitsService: HabitsService,
  ) {}

  // ── Difficulty rating ──────────────────────────────────────────────────────

  /**
   * The habit must belong to the user and the log to that habit; otherwise a
   * rating or reflection could be attached to another user's log by id.
   */
  private async assertOwnedLog(userId: string, habitId: string, logId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    const log = await this.habitLogRepo.findById(logId);
    if (!log || log.habitId !== habitId) {
      throw new NotFoundException('Log not found');
    }
  }

  async submitDifficulty(
    userId: string,
    habitId: string,
    logId: string,
    dto: SubmitDifficultyDto,
  ) {
    await this.assertOwnedLog(userId, habitId, logId);

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
    await this.assertOwnedLog(userId, habitId, logId);

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

  async listReflections(userId: string, habitId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    const entries = await this.reflectionRepo.findAllByHabitId(habitId);
    return entries.map((e) => ({
      id: e.id,
      logId: e.logId,
      text: e.text,
      occurredAt: e.occurredAt.toISOString(),
    }));
  }
}
