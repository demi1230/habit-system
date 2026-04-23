import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { HabitsModule } from '../habits/habits.module';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import { REMINDER_REPOSITORY } from '../domain/repositories/reminder.repository';
import { REMINDER_ACTION_REPOSITORY } from '../domain/repositories/reminder-action.repository';
import { REMINDER_POLICY_REPOSITORY } from '../domain/repositories/reminder-policy.repository';
import { NOTIFICATION_GATEWAY } from './notification/notification.gateway.interface';
import { HabitLogPrismaRepository } from '../infrastructure/persistence/habit-log.prisma-repository';
import { ReminderPrismaRepository } from '../infrastructure/persistence/reminder.prisma-repository';
import { ReminderActionPrismaRepository } from '../infrastructure/persistence/reminder-action.prisma-repository';
import { ReminderPolicyPrismaRepository } from '../infrastructure/persistence/reminder-policy.prisma-repository';
import { PushModule } from '../push/push.module';
import { WebPushNotificationGateway } from '../push/web-push-notification.gateway';
import { ReminderExecutionService } from './reminder-execution.service';
import { ReminderMessageBuilder } from './reminder-message.builder';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';

/**
 * Application module — Reminders
 * Manages reminder evaluation, persistence, action handling,
 * and stub notification delivery.
 *
 * Thesis mapping: "Сануулга модуль · Reminders module"
 */
@Module({
  imports: [HabitsModule, AnalyticsModule, PushModule],
  controllers: [RemindersController],
  providers: [
    ReminderExecutionService,
    RemindersService,
    ReminderMessageBuilder,
    ReminderSchedulerService,
    { provide: REMINDER_REPOSITORY, useClass: ReminderPrismaRepository },
    {
      provide: REMINDER_ACTION_REPOSITORY,
      useClass: ReminderActionPrismaRepository,
    },
    {
      provide: REMINDER_POLICY_REPOSITORY,
      useClass: ReminderPolicyPrismaRepository,
    },
    { provide: HABIT_LOG_REPOSITORY, useClass: HabitLogPrismaRepository },
    { provide: NOTIFICATION_GATEWAY, useClass: WebPushNotificationGateway },
  ],
  exports: [RemindersService],
})
export class RemindersModule {}
