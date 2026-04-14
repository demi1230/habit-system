import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { HabitLifecycleStatus } from '../domain/enums/domain.enums';
import type { IHabitRepository } from '../domain/repositories/habit.repository';
import { HABIT_REPOSITORY } from '../domain/repositories/habit.repository';
import { CueScheduleRules } from '../domain/rules/cue-schedule.rules';
import {
  ReminderDecisionRules,
  ReminderDecisionResult,
} from '../domain/rules/reminder-decision.rules';
import { CreateHabitDto } from './dto/create-habit.dto';
import { HabitQueryDto } from './dto/habit-query.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateHabitCueDto } from './cues/dto/create-habit-cue.dto';
import { CreateHabitMotivationProfileDto } from './motivation/dto/create-habit-motivation-profile.dto';
import { CreateHabitScheduleDayDto } from './schedule/dto/create-habit-schedule-day.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class HabitsService {
  constructor(
    @Inject(HABIT_REPOSITORY) private readonly habitRepo: IHabitRepository,
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async createHabit(userId: string, createHabitDto: CreateHabitDto) {
    await this.authService.ensureUserExists(userId);
    this.validateHabitConfiguration(createHabitDto);

    const habit = await this.habitRepo.create({
      userId,
      title: createHabitDto.title,
      description: createHabitDto.description,
      measurementUnit: createHabitDto.measurementUnit,
      targetValue: createHabitDto.targetValue,
      minimumTarget: createHabitDto.minimumTarget,
      startDate: new Date(createHabitDto.startDate),
      status: createHabitDto.status ?? HabitLifecycleStatus.ACTIVE,
      reminderEnabled: createHabitDto.reminderEnabled ?? false,
      scheduleDays: createHabitDto.scheduleDays?.map((d) => ({
        weekday: d.weekday,
      })),
      cues: createHabitDto.cues?.map((c) => this.buildCuePayload(c)),
      motivationProfile: createHabitDto.motivationProfile
        ? this.buildMotivationProfilePayload(createHabitDto.motivationProfile)
        : null,
    });

    await this.analyticsService.recordActivity(userId, 'habit_created');
    return habit;
  }

  async listHabits(userId: string, habitQueryDto: HabitQueryDto) {
    await this.authService.ensureUserExists(userId);
    return this.habitRepo.findAllByUserId(
      userId,
      habitQueryDto.includeArchived,
    );
  }

  async getOwnedHabitOrThrow(userId: string, habitId: string) {
    await this.authService.ensureUserExists(userId);

    const habit = await this.habitRepo.findByIdAndUserId(habitId, userId);

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
      minimumTarget:
        updateHabitDto.minimumTarget ?? existingHabit.minimumTarget,
      targetValue:
        updateHabitDto.targetValue ?? existingHabit.targetValue,
      scheduleDays:
        updateHabitDto.scheduleDays ??
        existingHabit.scheduleDays.map((d) => ({ weekday: d.weekday })),
    });

    const updatedHabit = await this.habitRepo.update(habitId, {
      title: updateHabitDto.title,
      description: updateHabitDto.description,
      measurementUnit: updateHabitDto.measurementUnit,
      targetValue: updateHabitDto.targetValue,
      minimumTarget: updateHabitDto.minimumTarget,
      startDate: updateHabitDto.startDate
        ? new Date(updateHabitDto.startDate)
        : undefined,
      status:
        updateHabitDto.status === HabitLifecycleStatus.ARCHIVED
          ? HabitLifecycleStatus.ARCHIVED
          : updateHabitDto.status,
      archivedAt:
        updateHabitDto.status === HabitLifecycleStatus.ARCHIVED
          ? (existingHabit.archivedAt ?? new Date())
          : updateHabitDto.status
            ? null
            : undefined,
      reminderEnabled: updateHabitDto.reminderEnabled,
      scheduleDays: updateHabitDto.scheduleDays?.map((d) => ({
        weekday: d.weekday,
      })),
      cues: updateHabitDto.cues?.map((c) => this.buildCuePayload(c)),
      motivationProfile:
        updateHabitDto.motivationProfile !== undefined
          ? this.buildMotivationProfilePayload(updateHabitDto.motivationProfile)
          : undefined,
    });

    await this.analyticsService.recordActivity(userId, 'habit_updated');
    return updatedHabit;
  }

  async getTodayHabits(userId: string) {
    await this.authService.ensureUserExists(userId);

    const todayWeekday = CueScheduleRules.todayWeekday();
    const habits = await this.habitRepo.findActiveByUserId(userId);
    const todayHabits = habits.filter((habit) =>
      habit.isScheduledOn(todayWeekday),
    );

    return todayHabits.map((habit) => ({
      ...habit,
      cueContext: habit.cues.map((cue) => CueScheduleRules.evaluateCue(cue)),
    }));
  }

  async getReminderDecision(
    userId: string,
    habitId: string,
  ): Promise<ReminderDecisionResult> {
    const habit = await this.getOwnedHabitOrThrow(userId, habitId);

    return ReminderDecisionRules.decide({
      habitId,
      reminderEnabled: habit.reminderEnabled,
      scheduleDays: habit.scheduleDays,
      cues: habit.cues,
    });
  }

  //Private helpers

  private validateHabitConfiguration(habitConfig: {
    minimumTarget: number;
    targetValue: number;
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

    if (habitConfig.minimumTarget > habitConfig.targetValue) {
      throw new BadRequestException(
        'minimumTarget must be less than or equal to targetValue.',
      );
    }
  }

  private buildCuePayload(cue: CreateHabitCueDto) {
    return {
      startTime: cue.startTime ?? null,
      endTime: cue.endTime ?? null,
      coarseLocation: cue.coarseLocation ?? null,
      precedingRoutine: cue.precedingRoutine ?? null,
      isActive: cue.isActive ?? true,
    };
  }

  private buildMotivationProfilePayload(
    motivationProfile: CreateHabitMotivationProfileDto,
  ) {
    return {
      reason: motivationProfile.reason ?? null,
    };
  }
}
