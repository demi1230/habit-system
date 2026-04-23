import { RecommendationInteractionEntity } from '../entities/recommendation-interaction.entity';
import { RecommendationInteractionType } from '../enums/domain.enums';

export const RECOMMENDATION_INTERACTION_REPOSITORY = Symbol(
  'IRecommendationInteractionRepository',
);

export interface CreateRecommendationInteractionData {
  userId: string;
  recommendationId: string;
  interactionType: RecommendationInteractionType;
  occurredAt: Date;
}

export interface IRecommendationInteractionRepository {
  create(
    data: CreateRecommendationInteractionData,
  ): Promise<RecommendationInteractionEntity>;
  findByRecommendation(
    recommendationId: string,
  ): Promise<RecommendationInteractionEntity[]>;
  findByUserAndRecommendation(
    userId: string,
    recommendationId: string,
  ): Promise<RecommendationInteractionEntity[]>;
}
