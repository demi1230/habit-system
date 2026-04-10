import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import type { IUserActivityLogRepository } from '../domain/repositories/user-activity-log.repository';
import { USER_ACTIVITY_LOG_REPOSITORY } from '../domain/repositories/user-activity-log.repository';
import { CreateUserActivityLogDto } from './dto/create-user-activity-log.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(USER_ACTIVITY_LOG_REPOSITORY)
    private readonly activityLogRepo: IUserActivityLogRepository,
    private readonly authService: AuthService,
  ) {}

  async createUserActivityLog(
    userId: string,
    createUserActivityLogDto: CreateUserActivityLogDto,
  ) {
    await this.authService.ensureUserExists(userId);

    return this.activityLogRepo.create({
      userId,
      activityType: createUserActivityLogDto.activityType,
      occurredAt: createUserActivityLogDto.occurredAt
        ? new Date(createUserActivityLogDto.occurredAt)
        : new Date(),
    });
  }

  async listUserActivityLogs(userId: string) {
    await this.authService.ensureUserExists(userId);
    return this.activityLogRepo.findAllByUserId(userId);
  }

  /**
   * Internal helper — only call from an already-authenticated context where
   * user existence has already been verified by the calling service.
   */
  async recordActivity(
    userId: string,
    activityType: string,
    occurredAt?: Date,
  ) {
    return this.activityLogRepo.create({
      userId,
      activityType,
      occurredAt: occurredAt ?? new Date(),
    });
  }
}
