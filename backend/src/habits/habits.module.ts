import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';
import { HABIT_REPOSITORY } from '../domain/repositories/habit.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import { SRBAI_ASSESSMENT_REPOSITORY } from '../domain/repositories/srbai-assessment.repository';
import { REMINDER_POLICY_REPOSITORY } from '../domain/repositories/reminder-policy.repository';
import { HabitPrismaRepository } from '../infrastructure/persistence/habit.prisma-repository';
import { HabitLogPrismaRepository } from '../infrastructure/persistence/habit-log.prisma-repository';
import { SrbaiAssessmentPrismaRepository } from '../infrastructure/persistence/srbai-assessment.prisma-repository';
import { ReminderPolicyPrismaRepository } from '../infrastructure/persistence/reminder-policy.prisma-repository';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { SrbaiController } from './srbai.controller';
import { SrbaiService } from './srbai.service';

/**
 * Application module — Habits
 * Manages habit lifecycle, cue configuration, schedule, motivation profile,
 * SRBAI assessments, composite habit-strength score, and reminder tapering policy.
 */
@Module({
  imports: [AuthModule, AnalyticsModule],
  controllers: [HabitsController, SrbaiController],
  providers: [
    HabitsService,
    SrbaiService,
    { provide: HABIT_REPOSITORY, useClass: HabitPrismaRepository },
    { provide: HABIT_LOG_REPOSITORY, useClass: HabitLogPrismaRepository },
    {
      provide: SRBAI_ASSESSMENT_REPOSITORY,
      useClass: SrbaiAssessmentPrismaRepository,
    },
    {
      provide: REMINDER_POLICY_REPOSITORY,
      useClass: ReminderPolicyPrismaRepository,
    },
  ],
  exports: [HabitsService, SrbaiService],
})
export class HabitsModule {}
