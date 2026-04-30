import { Injectable } from '@nestjs/common';
import { HabitLogEntity } from '../../domain/entities/habit-log.entity';
import {
  IHabitLogRepository,
  CreateHabitLogData,
  UpdateHabitLogData,
} from '../../domain/repositories/habit-log.repository';
import { CompletionTriggerSource } from '../../domain/enums/domain.enums';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Infrastructure adapter — Prisma implementation of IHabitLogRepository.
 */
@Injectable()
export class HabitLogPrismaRepository implements IHabitLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHabitLogData): Promise<HabitLogEntity> {
    const result = await this.prisma.habitLog.create({
      data: {
        habitId: data.habitId,
        status: data.status,
        actualValue: data.actualValue ?? null,
        completedAt: data.completedAt,
        loggedAt: data.loggedAt,
        triggerSource: data.triggerSource ?? CompletionTriggerSource.UNKNOWN,
        linkedReminderId: data.linkedReminderId ?? null,
        sourceConfidence: data.sourceConfidence ?? null,
        completionHour: data.completionHour ?? null,
        coarseLocation: data.coarseLocation ?? null,
        precedingRoutine: data.precedingRoutine ?? null,
      },
    });
    return result as unknown as HabitLogEntity;
  }

  async findById(id: string): Promise<HabitLogEntity | null> {
    const result = await this.prisma.habitLog.findUnique({ where: { id } });
    return result as unknown as HabitLogEntity | null;
  }

  async update(id: string, data: UpdateHabitLogData): Promise<HabitLogEntity> {
    const result = await this.prisma.habitLog.update({
      where: { id },
      data: {
        status: data.status,
        actualValue: data.actualValue,
      },
    });
    return result as unknown as HabitLogEntity;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.habitLog.delete({ where: { id } });
  }

  async findAllByHabitId(habitId: string): Promise<HabitLogEntity[]> {
    const results = await this.prisma.habitLog.findMany({
      where: { habitId },
      orderBy: [{ completedAt: 'desc' }, { loggedAt: 'desc' }],
    });
    return results as unknown as HabitLogEntity[];
  }

  async findLatestByHabitIdsForDate(
    habitIds: string[],
    date: Date,
  ): Promise<
    Array<
      Pick<
        HabitLogEntity,
        'id' | 'habitId' | 'status' | 'actualValue' | 'completedAt' | 'loggedAt'
      >
    >
  > {
    if (habitIds.length === 0) return [];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await this.prisma.habitLog.findMany({
      where: {
        habitId: { in: habitIds },
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        habitId: true,
        status: true,
        actualValue: true,
        completedAt: true,
        loggedAt: true,
      },
      orderBy: [
        { habitId: 'asc' },
        { completedAt: 'desc' },
        { loggedAt: 'desc' },
      ],
    });

    const latestByHabitId = new Map<
      string,
      Pick<
        HabitLogEntity,
        'id' | 'habitId' | 'status' | 'actualValue' | 'completedAt' | 'loggedAt'
      >
    >();

    for (const result of results) {
      if (!latestByHabitId.has(result.habitId)) {
        latestByHabitId.set(
          result.habitId,
          result as Pick<
            HabitLogEntity,
            | 'id'
            | 'habitId'
            | 'status'
            | 'actualValue'
            | 'completedAt'
            | 'loggedAt'
          >,
        );
      }
    }

    return Array.from(latestByHabitId.values());
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
      where: { linkedReminderId: reminderId },
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
      where: { habitId, status: 'DONE' },
      select: {
        completionHour: true,
        coarseLocation: true,
        precedingRoutine: true,
      },
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
