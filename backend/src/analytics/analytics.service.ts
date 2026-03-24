import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserActivityLogDto } from './dto/create-user-activity-log.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createUserActivityLog(
    userId: string,
    createUserActivityLogDto: CreateUserActivityLogDto,
  ) {
    await this.authService.ensureUserExists(userId);

    return this.prisma.userActivityLog.create({
      data: {
        userId,
        activityType: createUserActivityLogDto.activityType,
        occurredAt: createUserActivityLogDto.occurredAt
          ? new Date(createUserActivityLogDto.occurredAt)
          : new Date(),
      },
    });
  }

  async listUserActivityLogs(userId: string) {
    await this.authService.ensureUserExists(userId);

    return this.prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: [{ occurredAt: 'desc' }],
    });
  }

  /**
   * Internal helper — only call from an already-authenticated context where
   * user existence has already been verified by the calling service.
   */
  async recordActivity(userId: string, activityType: string, occurredAt?: Date) {
    return this.prisma.userActivityLog.create({
      data: {
        userId,
        activityType,
        occurredAt: occurredAt ?? new Date(),
      },
    });
  }
}
