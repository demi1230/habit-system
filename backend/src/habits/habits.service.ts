import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  CueDayType,
  HabitLifecycleStatus,
  HabitTrackingType,
} from '../common/enums/domain.enums';
import { CreateHabitDto } from './dto/create-habit.dto';
import { HabitQueryDto } from './dto/habit-query.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateHabitCueDto } from './cues/dto/create-habit-cue.dto';
import { CreateHabitMotivationProfileDto } from './motivation/dto/create-habit-motivation-profile.dto';
import { CreateHabitScheduleDayDto } from './schedule/dto/create-habit-schedule-day.dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HabitsService {
  private readonly habitInclude = {
    scheduleDays: true,
    cues: true,
    motivationProfile: true,
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async createHabit(userId: string, createHabitDto: CreateHabitDto) {
    await this.authService.ensureUserExists(userId);
    this.validateHabitConfiguration(createHabitDto);

    const habit = await this.prisma.habit.create({
      data: {
        userId,
        title: createHabitDto.title,
        description: createHabitDto.description,
        trackingType: createHabitDto.trackingType,
        allowPartialCompletion: createHabitDto.allowPartialCompletion ?? false,
        measurementUnit:
          createHabitDto.trackingType === HabitTrackingType.QUANTITATIVE
            ? createHabitDto.measurementUnit
            : null,
        targetValue:
          createHabitDto.trackingType === HabitTrackingType.QUANTITATIVE
            ? createHabitDto.targetValue
            : null,
        minimumSuccessValue:
          createHabitDto.trackingType === HabitTrackingType.QUANTITATIVE
            ? createHabitDto.minimumSuccessValue
            : null,
        startDate: new Date(createHabitDto.startDate),
        status: createHabitDto.status ?? HabitLifecycleStatus.ACTIVE,
        reminderEnabled: createHabitDto.reminderEnabled ?? false,
        scheduleDays: this.buildScheduleDaysCreate(createHabitDto.scheduleDays),
        cues: this.buildCuesCreate(createHabitDto.cues),
        motivationProfile: createHabitDto.motivationProfile
          ? {
              create: this.buildMotivationProfilePayload(
                createHabitDto.motivationProfile,
              ),
            }
          : undefined,
      },
      include: this.habitInclude,
    });

    await this.analyticsService.recordActivity(userId, 'habit.created');

    return habit;
  }

  async listHabits(userId: string, habitQueryDto: HabitQueryDto) {
    await this.authService.ensureUserExists(userId);

    return this.prisma.habit.findMany({
      where: {
        userId,
        ...(habitQueryDto.includeArchived ? {} : { archivedAt: null }),
      },
      include: this.habitInclude,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async getOwnedHabitOrThrow(userId: string, habitId: string) {
    await this.authService.ensureUserExists(userId);

    const habit = await this.prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
      include: this.habitInclude,
    });

    if (!habit) {
      throw new NotFoundException(
        `Habit ${habitId} was not found for user ${userId}.`,
      );
    }

    return habit;
  }

  async updateHabit(
    userId: string,
    habitId: string,
    updateHabitDto: UpdateHabitDto,
  ) {
    const existingHabit = await this.getOwnedHabitOrThrow(userId, habitId);

    this.validateHabitConfiguration({
      trackingType: updateHabitDto.trackingType ?? existingHabit.trackingType,
      allowPartialCompletion:
        updateHabitDto.allowPartialCompletion ??
        existingHabit.allowPartialCompletion,
      measurementUnit:
        updateHabitDto.measurementUnit ??
        existingHabit.measurementUnit ??
        undefined,
      targetValue:
        updateHabitDto.targetValue ?? existingHabit.targetValue ?? undefined,
      minimumSuccessValue:
        updateHabitDto.minimumSuccessValue ??
        existingHabit.minimumSuccessValue ??
        undefined,
      scheduleDays:
        updateHabitDto.scheduleDays ??
        existingHabit.scheduleDays.map((scheduleDay) => ({
          weekday: scheduleDay.weekday,
        })),
    });

    const updatedHabit = await this.prisma.habit.update({
      where: { id: habitId },
      data: {
        title: updateHabitDto.title,
        description: updateHabitDto.description,
        trackingType: updateHabitDto.trackingType,
        allowPartialCompletion: updateHabitDto.allowPartialCompletion,
        measurementUnit: this.resolveMeasurementUnit(
          updateHabitDto,
          existingHabit,
        ),
        targetValue: this.resolveMetricNumber(
          updateHabitDto,
          existingHabit,
          'targetValue',
        ),
        minimumSuccessValue: this.resolveMetricNumber(
          updateHabitDto,
          existingHabit,
          'minimumSuccessValue',
        ),
        startDate: updateHabitDto.startDate
          ? new Date(updateHabitDto.startDate)
          : undefined,
        status:
          updateHabitDto.status === HabitLifecycleStatus.ARCHIVED
            ? HabitLifecycleStatus.ARCHIVED
            : updateHabitDto.status,
        reminderEnabled: updateHabitDto.reminderEnabled,
        archivedAt:
          updateHabitDto.status === HabitLifecycleStatus.ARCHIVED
            ? (existingHabit.archivedAt ?? new Date())
            : updateHabitDto.status
              ? null
              : undefined,
        scheduleDays:
          updateHabitDto.scheduleDays !== undefined
            ? {
                deleteMany: {},
                create: updateHabitDto.scheduleDays.map((scheduleDay) => ({
                  weekday: scheduleDay.weekday,
                })),
              }
            : undefined,
        cues:
          updateHabitDto.cues !== undefined
            ? {
                deleteMany: {},
                create: updateHabitDto.cues.map((cue) =>
                  this.buildCuePayload(cue),
                ),
              }
            : undefined,
        motivationProfile:
          updateHabitDto.motivationProfile !== undefined
            ? {
                upsert: {
                  create: this.buildMotivationProfilePayload(
                    updateHabitDto.motivationProfile,
                  ),
                  update: this.buildMotivationProfilePayload(
                    updateHabitDto.motivationProfile,
                  ),
                },
              }
            : undefined,
      },
      include: this.habitInclude,
    });

    await this.analyticsService.recordActivity(userId, 'habit.updated');

    return updatedHabit;
  }

  private validateHabitConfiguration(habitConfig: {
    trackingType: HabitTrackingType;
    allowPartialCompletion?: boolean;
    measurementUnit?: string;
    targetValue?: number;
    minimumSuccessValue?: number;
    scheduleDays?: CreateHabitScheduleDayDto[];
  }) {
    if (habitConfig.scheduleDays) {
      const uniqueWeekdays = new Set(
        habitConfig.scheduleDays.map((scheduleDay) => scheduleDay.weekday),
      );

      if (uniqueWeekdays.size !== habitConfig.scheduleDays.length) {
        throw new BadRequestException(
          'Each selected weekday may appear only once for a habit schedule.',
        );
      }
    }

    if (habitConfig.trackingType === HabitTrackingType.SIMPLE_CHECKIN) {
      if (
        habitConfig.measurementUnit !== undefined ||
        habitConfig.targetValue !== undefined ||
        habitConfig.minimumSuccessValue !== undefined
      ) {
        throw new BadRequestException(
          'SIMPLE_CHECKIN habits must not define quantitative measurement fields.',
        );
      }

      return;
    }

    if (
      !habitConfig.measurementUnit ||
      habitConfig.targetValue === undefined ||
      habitConfig.minimumSuccessValue === undefined
    ) {
      throw new BadRequestException(
        'QUANTITATIVE habits require measurementUnit, targetValue, and minimumSuccessValue.',
      );
    }

    if (habitConfig.minimumSuccessValue > habitConfig.targetValue) {
      throw new BadRequestException(
        'minimumSuccessValue must be less than or equal to targetValue.',
      );
    }
  }

  private buildScheduleDaysCreate(scheduleDays?: CreateHabitScheduleDayDto[]) {
    if (!scheduleDays?.length) {
      return undefined;
    }

    return {
      create: scheduleDays.map((scheduleDay) => ({
        weekday: scheduleDay.weekday,
      })),
    };
  }

  private buildCuesCreate(cues?: CreateHabitCueDto[]) {
    if (!cues?.length) {
      return undefined;
    }

    return {
      create: cues.map((cue) => this.buildCuePayload(cue)),
    };
  }

  private buildCuePayload(cue: CreateHabitCueDto) {
    return {
      timeWindow: cue.timeWindow ?? null,
      dayType: cue.dayType ?? CueDayType.ANY,
      coarseLocation: cue.coarseLocation ?? null,
      precedingRoutine: cue.precedingRoutine ?? null,
      isActive: cue.isActive ?? true,
    };
  }

  private buildMotivationProfilePayload(
    motivationProfile: CreateHabitMotivationProfileDto,
  ) {
    return {
      goalTag: motivationProfile.goalTag ?? null,
      personalReason: motivationProfile.personalReason ?? null,
      identityStatement: motivationProfile.identityStatement ?? null,
    };
  }

  private resolveMeasurementUnit(
    updateHabitDto: UpdateHabitDto,
    existingHabit: {
      trackingType: HabitTrackingType;
      measurementUnit: string | null;
    },
  ) {
    const nextTrackingType =
      updateHabitDto.trackingType ?? existingHabit.trackingType;

    if (nextTrackingType === HabitTrackingType.SIMPLE_CHECKIN) {
      return null;
    }

    return updateHabitDto.measurementUnit ?? existingHabit.measurementUnit;
  }

  private resolveMetricNumber(
    updateHabitDto: UpdateHabitDto,
    existingHabit: {
      trackingType: HabitTrackingType;
      targetValue: number | null;
      minimumSuccessValue: number | null;
    },
    field: 'targetValue' | 'minimumSuccessValue',
  ) {
    const nextTrackingType =
      updateHabitDto.trackingType ?? existingHabit.trackingType;

    if (nextTrackingType === HabitTrackingType.SIMPLE_CHECKIN) {
      return null;
    }

    return updateHabitDto[field] ?? existingHabit[field];
  }
}
