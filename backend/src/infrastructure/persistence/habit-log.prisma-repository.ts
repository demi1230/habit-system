import { Injectable } from '@nestjs/common';
import { HabitLogEntity } from '../../domain/entities/habit-log.entity';
import {
  IHabitLogRepository,
  CreateHabitLogData,
} from '../../domain/repositories/habit-log.repository';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Infrastructure adapter — Prisma implementation of IHabitLogRepository.
 */
@Injectable()
export class HabitLogPrismaRepository implements IHabitLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHabitLogData): Promise<HabitLogEntity> {
    const result = await this.prisma.habitLog.create({
      // Cast required: generated client predates linkedReminderId / sourceConfidence / context columns.
      // Remove once `prisma generate` is re-run after migration.
      data: {
        habitId: data.habitId,
        status: data.status,
        actualValue: data.actualValue ?? null,
        completedAt: data.completedAt,
        loggedAt: data.loggedAt,
        triggerSource: data.triggerSource ?? null,
        linkedReminderId: data.linkedReminderId ?? null,
        sourceConfidence: data.sourceConfidence ?? null,
        completionHour: data.completionHour ?? null,
        coarseLocation: data.coarseLocation ?? null,
        precedingRoutine: data.precedingRoutine ?? null,
      } as any,
    });
    return result as unknown as HabitLogEntity;
  }

  async findAllByHabitId(habitId: string): Promise<HabitLogEntity[]> {
    const results = await this.prisma.habitLog.findMany({
      where: { habitId },
      orderBy: [{ completedAt: 'desc' }, { loggedAt: 'desc' }],
    });
    return results as unknown as HabitLogEntity[];
  }

  async findSummaryByHabitId(
    habitId: string,
  ): Promise<
    Array<
      Pick<
        HabitLogEntity,
        'status' | 'triggerSource' | 'loggedAt' | 'completedAt'
      >
    >
  > {
    return this.prisma.habitLog.findMany({
      where: { habitId },
      select: {
        status: true,
        triggerSource: true,
        loggedAt: true,
        completedAt: true,
      },
      orderBy: [{ completedAt: 'desc' }, { loggedAt: 'desc' }],
    }) as Promise<
      Array<
        Pick<
          HabitLogEntity,
          'status' | 'triggerSource' | 'loggedAt' | 'completedAt'
        >
      >
    >;
  }

  async findByLinkedReminderId(
    reminderId: string,
  ): Promise<HabitLogEntity | null> {
    const result = await this.prisma.habitLog.findFirst({
      // Cast required: linkedReminderId not yet in generated client.
      where: { linkedReminderId: reminderId } as any,
    });
    return result as unknown as HabitLogEntity | null;
  }

  async findContextSnapshotsByHabitId(
    habitId: string,
    limit: number,
  ): Promise<
    Array<
      Pick<
        HabitLogEntity,
        'completionHour' | 'coarseLocation' | 'precedingRoutine'
      >
    >
  > {
    const results = await this.prisma.habitLog.findMany({
      where: { habitId, status: 'DONE' as any },
      select: {
        completionHour: true,
        coarseLocation: true,
        precedingRoutine: true,
      } as any,
      orderBy: [{ completedAt: 'desc' }],
      take: limit,
    });
    return results as unknown as Array<
      Pick<
        HabitLogEntity,
        'completionHour' | 'coarseLocation' | 'precedingRoutine'
      >
    >;
  }
}
