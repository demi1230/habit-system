import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';

/**
 * Thesis mapping:
 * habits owns habit management plus the cue/schedule and motivation-profile
 * subdomains in Phase 1. Reminder decision logic remains an extension point.
 */
@Module({
  imports: [PrismaModule, AuthModule, AnalyticsModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
