import { Injectable } from '@nestjs/common';
import { HabitLifecycleStatus } from '../../domain/enums/domain.enums';
import { HabitEntity } from '../../domain/entities/habit.entity';
import {
  IHabitRepository,
  CreateHabitData,
  UpdateHabitData,
} from '../../domain/repositories/habit.repository';
import { PrismaService } from '../prisma/prisma.service';

/** Prisma include shape used for all habit queries. */
const HABIT_INCLUDE = {
  scheduleDays: true,
  cues: true,
  motivationProfile: true,
} as const;

type PrismaHabit = Awaited<
  ReturnType<PrismaService['habit']['findFirstOrThrow']>
> & {
  scheduleDays: Array<{ id: string; habitId: string; weekday: string }>;
  cues: Array<{
    id: string;
    habitId: string;
    startTime: string | null;
    endTime: string | null;
    coarseLocation: string | null;
    precedingRoutine: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  motivationProfile: {
    id: string;
    habitId: string;
    goalTag: string | null;
    reason: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

/**
 * Infrastructure adapter — Prisma implementation of IHabitRepository.
 * Translates between Prisma query results and HabitEntity domain objects.
 */
@Injectable()
export class HabitPrismaRepository implements IHabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHabitData): Promise<HabitEntity> {
    const result = await this.prisma.habit.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        precedingRoutine: data.precedingRoutine,
        color: data.color,
        iconType: data.iconType,
        iconValue: data.iconValue,
        benefits: data.benefits ?? [],
        measurementUnit: data.measurementUnit,
        targetValue: data.targetValue,
        minimumTarget: data.minimumTarget,
        startDate: data.startDate,
        status: data.status,
        reminderEnabled: data.reminderEnabled,
        scheduleDays: data.scheduleDays?.length
          ? { create: data.scheduleDays.map((d) => ({ weekday: d.weekday })) }
          : undefined,
        cues: data.cues?.length
          ? { create: data.cues.map((c) => ({ ...c })) }
          : undefined,
        motivationProfile: data.motivationProfile
          ? { create: data.motivationProfile }
          : undefined,
      },
      include: HABIT_INCLUDE,
    });
    return this.toEntity(result as PrismaHabit);
  }

  async findAllByUserId(
    userId: string,
    includeArchived = false,
  ): Promise<HabitEntity[]> {
    const results = await this.prisma.habit.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      include: HABIT_INCLUDE,
      orderBy: [{ createdAt: 'desc' }],
    });
    return results.map((r) => this.toEntity(r as PrismaHabit));
  }

  async findActiveByUserId(userId: string): Promise<HabitEntity[]> {
    const results = await this.prisma.habit.findMany({
      where: {
        userId,
        status: HabitLifecycleStatus.ACTIVE,
        archivedAt: null,
      },
      include: HABIT_INCLUDE,
      orderBy: [{ createdAt: 'desc' }],
    });
    return results.map((r) => this.toEntity(r as PrismaHabit));
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<HabitEntity | null> {
    const result = await this.prisma.habit.findFirst({
      where: { id, userId },
      include: HABIT_INCLUDE,
    });
    return result ? this.toEntity(result as PrismaHabit) : null;
  }

  async update(id: string, data: UpdateHabitData): Promise<HabitEntity> {
    const result = await this.prisma.habit.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.precedingRoutine !== undefined && {
          precedingRoutine: data.precedingRoutine,
        }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.iconType !== undefined && { iconType: data.iconType }),
        ...(data.iconValue !== undefined && { iconValue: data.iconValue }),
        ...(data.benefits !== undefined && { benefits: data.benefits }),
        ...(data.measurementUnit !== undefined && {
          measurementUnit: data.measurementUnit,
        }),
        ...(data.targetValue !== undefined && {
          targetValue: data.targetValue,
        }),
        ...(data.minimumTarget !== undefined && {
          minimumTarget: data.minimumTarget,
        }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.archivedAt !== undefined && { archivedAt: data.archivedAt }),
        ...(data.reminderEnabled !== undefined && {
          reminderEnabled: data.reminderEnabled,
        }),
        ...(data.scheduleDays !== undefined && {
          scheduleDays: {
            deleteMany: {},
            create: data.scheduleDays.map((d) => ({
              weekday: d.weekday,
            })),
          },
        }),
        ...(data.cues !== undefined && {
          cues: {
            deleteMany: {},
            create: data.cues.map((c) => ({ ...c })),
          },
        }),
        ...(data.motivationProfile !== undefined && {
          motivationProfile: {
            upsert: {
              create: data.motivationProfile ?? {},
              update: data.motivationProfile ?? {},
            },
          },
        }),
      },
      include: HABIT_INCLUDE,
    });
    return this.toEntity(result as PrismaHabit);
  }

  private toEntity(raw: PrismaHabit): HabitEntity {
    return Object.assign(new HabitEntity(), raw);
  }
}
