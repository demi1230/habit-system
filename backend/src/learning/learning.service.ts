import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IAdaptationRecommendationRepository } from '../domain/repositories/adaptation-recommendation.repository';
import { ADAPTATION_RECOMMENDATION_REPOSITORY } from '../domain/repositories/adaptation-recommendation.repository';
import type { IArticleInteractionRepository } from '../domain/repositories/article-interaction.repository';
import { ARTICLE_INTERACTION_REPOSITORY } from '../domain/repositories/article-interaction.repository';
import type { IRecommendationInteractionRepository } from '../domain/repositories/recommendation-interaction.repository';
import { RECOMMENDATION_INTERACTION_REPOSITORY } from '../domain/repositories/recommendation-interaction.repository';
import {
  RecommendationInteractionType,
  ArticleInteractionType,
  SourceType,
  RecommendationStatus,
} from '../domain/enums/domain.enums';
import { RecommendationGenerationService } from '../progress/recommendation-generation.service';
import type { AdaptationRecommendationEntity } from '../domain/entities/adaptation-recommendation.entity';
import type { ArticleInteractionEntity } from '../domain/entities/article-interaction.entity';
import {
  LogArticleInteractionDto,
  LogRecommendationInteractionDto,
} from './dto';

/**
 * Lightweight response DTO for interaction-logging endpoints. Returned to
 * controllers (and ultimately to HTTP clients) instead of the full entity, so
 * we don't leak internal fields like `userId` or `createdAt`.
 */
export interface InteractionLogResponse {
  id: string;
  interactionType: string;
  occurredAt: string;
}

export interface ArticleInteractionLogResponse extends InteractionLogResponse {
  articleId: string;
}

/**
 * Application service — Learning
 * Handles recommendations, article interactions, and learning flows.
 */
@Injectable()
export class LearningService {
  constructor(
    @Inject(ADAPTATION_RECOMMENDATION_REPOSITORY)
    private readonly recommendationRepo: IAdaptationRecommendationRepository,
    @Inject(ARTICLE_INTERACTION_REPOSITORY)
    private readonly articleInteractionRepo: IArticleInteractionRepository,
    @Inject(RECOMMENDATION_INTERACTION_REPOSITORY)
    private readonly recommendationInteractionRepo: IRecommendationInteractionRepository,
    private readonly recommendationGenerationService: RecommendationGenerationService,
  ) {}

  /**
   * Get active recommendations for a user, optionally filtered by habitId.
   */
  async getRecommendations(
    userId: string,
    habitId?: string,
  ): Promise<AdaptationRecommendationEntity[]> {
    if (habitId) {
      return this.recommendationRepo.findActiveByUserAndHabit(userId, habitId);
    }
    return this.recommendationRepo.findActiveByUser(userId);
  }

  /**
   * Regenerate recommendations for a specific habit.
   * Generates new recommendations based on current signals.
   */
  async refreshRecommendations(
    userId: string,
    habitId: string,
  ): Promise<AdaptationRecommendationEntity[]> {
    return this.recommendationGenerationService.generateRecommendations(
      userId,
      habitId,
    );
  }

  /**
   * Get a single recommendation by ID.
   */
  async getRecommendationById(
    userId: string,
    id: string,
  ): Promise<AdaptationRecommendationEntity> {
    const rec = await this.recommendationRepo.findById(id);
    if (!rec) {
      throw new NotFoundException('Recommendation not found');
    }
    if (rec.userId !== userId) {
      throw new NotFoundException('Recommendation not found');
    }
    return rec;
  }

  /**
   * Dismiss a recommendation.
   */
  async dismissRecommendation(
    userId: string,
    recommendationId: string,
  ): Promise<AdaptationRecommendationEntity> {
    // Verify ownership; will throw NotFoundException if not found.
    await this.getRecommendationById(userId, recommendationId);

    const updated = await this.recommendationRepo.update(recommendationId, {
      status: RecommendationStatus.DISMISSED,
    });

    await this.recommendationInteractionRepo.create({
      userId,
      recommendationId,
      interactionType: RecommendationInteractionType.DISMISSED,
      occurredAt: new Date(),
    });

    return updated;
  }

  /**
   * Log a recommendation interaction (CLICKED, DISMISSED, APPLIED, etc).
   */
  async logRecommendationInteraction(
    userId: string,
    recommendationId: string,
    dto: LogRecommendationInteractionDto,
  ): Promise<InteractionLogResponse> {
    await this.getRecommendationById(userId, recommendationId);

    if (
      !Object.values(RecommendationInteractionType).includes(
        dto.interactionType,
      )
    ) {
      throw new BadRequestException('Invalid interaction type');
    }

    const interaction = await this.recommendationInteractionRepo.create({
      userId,
      recommendationId,
      interactionType: dto.interactionType,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });

    return {
      id: interaction.id,
      interactionType: interaction.interactionType,
      occurredAt: interaction.occurredAt.toISOString(),
    };
  }

  /**
   * Log an article interaction (OPENED, COMPLETED, BOOKMARKED, UNBOOKMARKED).
   */
  async logArticleInteraction(
    userId: string,
    articleId: string,
    dto: LogArticleInteractionDto,
  ): Promise<ArticleInteractionLogResponse> {
    if (!Object.values(ArticleInteractionType).includes(dto.interactionType)) {
      throw new BadRequestException('Invalid interaction type');
    }

    if (!Object.values(SourceType).includes(dto.sourceType)) {
      throw new BadRequestException('Invalid source type');
    }

    const interaction = await this.articleInteractionRepo.create({
      userId,
      habitId: dto.habitId,
      articleId,
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
      interactionType: dto.interactionType,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });

    return {
      id: interaction.id,
      articleId: interaction.articleId,
      interactionType: interaction.interactionType,
      occurredAt: interaction.occurredAt.toISOString(),
    };
  }

  /**
   * Get article interaction history for a user.
   */
  async getArticleInteractionHistory(
    userId: string,
    limit: number = 20,
  ): Promise<ArticleInteractionEntity[]> {
    return this.articleInteractionRepo.findRecentByUser(userId, limit);
  }
}
