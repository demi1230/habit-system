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
import {
  LogArticleInteractionDto,
  LogRecommendationInteractionDto,
} from './dto';

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
  async getRecommendations(userId: string, habitId?: string): Promise<any[]> {
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
  ): Promise<any[]> {
    // Generate fresh recommendations (updates existing or creates new)
    return this.recommendationGenerationService.generateRecommendations(
      userId,
      habitId,
    );
  }

  /**
   * Get a single recommendation by ID.
   */
  async getRecommendationById(userId: string, id: string): Promise<any> {
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
  ): Promise<any> {
    const rec = await this.getRecommendationById(userId, recommendationId);

    // Update status to DISMISSED
    const updated = await this.recommendationRepo.update(recommendationId, {
      status: RecommendationStatus.DISMISSED,
    });

    // Log interaction
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
  ): Promise<any> {
    await this.getRecommendationById(userId, recommendationId);

    // Validate interaction type
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
  ): Promise<any> {
    // Validate interaction type
    if (!Object.values(ArticleInteractionType).includes(dto.interactionType)) {
      throw new BadRequestException('Invalid interaction type');
    }

    // Validate source type
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
  ): Promise<any[]> {
    return this.articleInteractionRepo.findRecentByUser(userId, limit);
  }
}
