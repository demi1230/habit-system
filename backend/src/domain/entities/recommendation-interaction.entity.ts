import { RecommendationInteractionType } from '../enums/domain.enums';

/**
 * Domain entity — RecommendationInteraction
 * Logs user interactions with adaptation recommendations.
 */
export interface RecommendationInteractionEntity {
  id: string;
  userId: string;
  recommendationId: string;
  interactionType: RecommendationInteractionType;
  occurredAt: Date;
  createdAt: Date;
}
