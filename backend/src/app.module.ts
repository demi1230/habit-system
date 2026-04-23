import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EngagementModule } from './engagement/engagement.module';
import { HabitsModule } from './habits/habits.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { PushModule } from './push/push.module';
import { RemindersModule } from './reminders/reminders.module';
import { LearningModule } from './learning/learning.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AnalyticsModule,
    HabitsModule,
    EngagementModule,
    ProgressModule,
    PushModule,
    RemindersModule,
    LearningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
