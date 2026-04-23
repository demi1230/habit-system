import { AdaptationRecommendationEntity } from '../entities/adaptation-recommendation.entity';
import {
  RecommendationCode,
  ReasonCode,
  RecommendationStatus,
  Priority,
} from '../enums/domain.enums';

export const ADAPTATION_RECOMMENDATION_REPOSITORY = Symbol(
  'IAdaptationRecommendationRepository',
);

export interface CreateAdaptationRecommendationData {
  userId: string;
  habitId: string;
  recommendationCode: RecommendationCode;
  reasonCode: ReasonCode;
  title: string;
  message: string;
  priority: Priority;
  articleIds: string[];
  metadata?: Record<string, unknown> | null;
  generatedAt: Date;
  expiresAt?: Date | null;
}

export interface UpdateAdaptationRecommendationData {
  status?: RecommendationStatus;
  articleIds?: string[];
  expiresAt?: Date | null;
}

export interface IAdaptationRecommendationRepository {
  create(
    data: CreateAdaptationRecommendationData,
  ): Promise<AdaptationRecommendationEntity>;
  findById(id: string): Promise<AdaptationRecommendationEntity | null>;
  findActiveByUserAndHabit(
    userId: string,
    habitId: string,
  ): Promise<AdaptationRecommendationEntity[]>;
  findActiveByUser(userId: string): Promise<AdaptationRecommendationEntity[]>;
  findByUserHabitAndCode(
    userId: string,
    habitId: string,
    code: RecommendationCode,
  ): Promise<AdaptationRecommendationEntity | null>;
  update(
    id: string,
    data: UpdateAdaptationRecommendationData,
  ): Promise<AdaptationRecommendationEntity>;
  /** Expire old active recommendations for a habit (e.g., when regenerating). */
  expireActiveByHabit(habitId: string): Promise<number>;
}
