import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProgressModule } from '../progress/progress.module';
import { ADAPTATION_RECOMMENDATION_REPOSITORY } from '../domain/repositories/adaptation-recommendation.repository';
import { ARTICLE_INTERACTION_REPOSITORY } from '../domain/repositories/article-interaction.repository';
import { RECOMMENDATION_INTERACTION_REPOSITORY } from '../domain/repositories/recommendation-interaction.repository';
import { AdaptationRecommendationPrismaRepository } from '../infrastructure/persistence/adaptation-recommendation.prisma-repository';
import { ArticleInteractionPrismaRepository } from '../infrastructure/persistence/article-interaction.prisma-repository';
import { RecommendationInteractionPrismaRepository } from '../infrastructure/persistence/recommendation-interaction.prisma-repository';
import { LearningController, ArticleController } from './learning.controller';
import { LearningService } from './learning.service';

/**
 * Application module — Learning
 * Manages learning recommendations, article interactions, and user support flows.
 */
@Module({
  imports: [AuthModule, ProgressModule],
  controllers: [LearningController, ArticleController],
  providers: [
    LearningService,
    {
      provide: ADAPTATION_RECOMMENDATION_REPOSITORY,
      useClass: AdaptationRecommendationPrismaRepository,
    },
    {
      provide: ARTICLE_INTERACTION_REPOSITORY,
      useClass: ArticleInteractionPrismaRepository,
    },
    {
      provide: RECOMMENDATION_INTERACTION_REPOSITORY,
      useClass: RecommendationInteractionPrismaRepository,
    },
  ],
  exports: [LearningService],
})
export class LearningModule {}
