import {
  RecommendationCode,
  ReasonCode,
  RecommendationStatus,
  Priority,
} from '../enums/domain.enums';

/**
 * Domain entity — AdaptationRecommendation
 * Represents a personalized learning recommendation generated from habit signals.
 */
export interface AdaptationRecommendationEntity {
  id: string;
  userId: string;
  habitId: string;
  recommendationCode: RecommendationCode;
  reasonCode: ReasonCode;
  title: string;
  message: string;
  priority: Priority;
  status: RecommendationStatus;
  articleIds: string[];
  metadata?: Record<string, unknown> | null;
  generatedAt: Date;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
