import { Injectable } from '@nestjs/common';
import {
  IUserActivityLogRepository,
  CreateActivityLogData,
  UserActivityLogEntity,
} from '../../domain/repositories/user-activity-log.repository';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Infrastructure adapter — Prisma implementation of IUserActivityLogRepository.
 */
@Injectable()
export class UserActivityLogPrismaRepository implements IUserActivityLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateActivityLogData): Promise<UserActivityLogEntity> {
    const result = await this.prisma.userActivityLog.create({
      data: {
        userId: data.userId,
        activityType: data.activityType,
        occurredAt: data.occurredAt,
      },
    });
    return result as UserActivityLogEntity;
  }

  async findAllByUserId(userId: string): Promise<UserActivityLogEntity[]> {
    const results = await this.prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: [{ occurredAt: 'desc' }],
    });
    return results as UserActivityLogEntity[];
  }
}
