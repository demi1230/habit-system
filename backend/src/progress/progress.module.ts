import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { HabitsModule } from '../habits/habits.module';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import { DIFFICULTY_FEEDBACK_REPOSITORY } from '../domain/repositories/difficulty-feedback.repository';
import { REFLECTION_REPOSITORY } from '../domain/repositories/reflection.repository';
import { REMINDER_POLICY_REPOSITORY } from '../domain/repositories/reminder-policy.repository';
import { ADAPTATION_RECOMMENDATION_REPOSITORY } from '../domain/repositories/adaptation-recommendation.repository';
import { HabitLogPrismaRepository } from '../infrastructure/persistence/habit-log.prisma-repository';
import { DifficultyFeedbackPrismaRepository } from '../infrastructure/persistence/difficulty-feedback.prisma-repository';
import { ReflectionPrismaRepository } from '../infrastructure/persistence/reflection.prisma-repository';
import { ReminderPolicyPrismaRepository } from '../infrastructure/persistence/reminder-policy.prisma-repository';
import { AdaptationRecommendationPrismaRepository } from '../infrastructure/persistence/adaptation-recommendation.prisma-repository';
import { EngagementModule } from '../engagement/engagement.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { FeedbackService } from './feedback.service';
import { RecommendationGenerationService } from './recommendation-generation.service';

/**
 * Application module — Progress
 * Manages completion logging, progress summary, habit-strength signals,
 * difficulty feedback, reflection, and adaptation recommendation.
 */
@Module({
  imports: [HabitsModule, AnalyticsModule, EngagementModule],
  controllers: [ProgressController],
  providers: [
    ProgressService,
    FeedbackService,
    RecommendationGenerationService,
    { provide: HABIT_LOG_REPOSITORY, useClass: HabitLogPrismaRepository },
    {
      provide: DIFFICULTY_FEEDBACK_REPOSITORY,
      useClass: DifficultyFeedbackPrismaRepository,
    },
    {
      provide: REFLECTION_REPOSITORY,
      useClass: ReflectionPrismaRepository,
    },
    {
      provide: REMINDER_POLICY_REPOSITORY,
      useClass: ReminderPolicyPrismaRepository,
    },
    {
      provide: ADAPTATION_RECOMMENDATION_REPOSITORY,
      useClass: AdaptationRecommendationPrismaRepository,
    },
  ],
  exports: [ProgressService, RecommendationGenerationService],
})
export class ProgressModule {}
