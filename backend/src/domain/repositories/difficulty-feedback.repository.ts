import { DifficultyFeedbackEntity } from '../entities/difficulty-feedback.entity';

export const DIFFICULTY_FEEDBACK_REPOSITORY = Symbol(
  'IDifficultyFeedbackRepository',
);

export interface CreateDifficultyFeedbackData {
  userId: string;
  habitId: string;
  logId: string;
  rating: string;
  note?: string | null;
  occurredAt: Date;
}

export interface IDifficultyFeedbackRepository {
  create(data: CreateDifficultyFeedbackData): Promise<DifficultyFeedbackEntity>;
  findAllByHabitId(habitId: string): Promise<DifficultyFeedbackEntity[]>;
  /** Returns up to `limit` entries ordered newest-first. */
  findRecentByHabitId(
    habitId: string,
    limit: number,
  ): Promise<DifficultyFeedbackEntity[]>;
}
