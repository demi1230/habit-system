import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { HabitsModule } from '../habits/habits.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

/**
 * Thesis mapping:
 * progress owns low-friction completion logging, progress summary reads,
 * and future habit-strength input signals in Phase 1.
 */
@Module({
  imports: [PrismaModule, HabitsModule, AnalyticsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
