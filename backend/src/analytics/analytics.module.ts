import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { USER_ACTIVITY_LOG_REPOSITORY } from '../domain/repositories/user-activity-log.repository';
import { UserActivityLogPrismaRepository } from '../infrastructure/persistence/user-activity-log.prisma-repository';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * Application module — Analytics
 * Records and reads raw user activity logs.
 * Binds IUserActivityLogRepository port to UserActivityLogPrismaRepository adapter.
 */
@Module({
  imports: [AuthModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    {
      provide: USER_ACTIVITY_LOG_REPOSITORY,
      useClass: UserActivityLogPrismaRepository,
    },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
