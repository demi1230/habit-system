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
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import type { ISrbaiAssessmentRepository } from '../domain/repositories/srbai-assessment.repository';
import { SRBAI_ASSESSMENT_REPOSITORY } from '../domain/repositories/srbai-assessment.repository';
import { CueScheduleRules } from '../domain/rules/cue-schedule.rules';
import { HabitStrengthRules } from '../domain/rules/habit-strength.rules';
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
    @Inject(HABIT_LOG_REPOSITORY)
    private readonly habitLogRepo: IHabitLogRepository,
    @Inject(SRBAI_ASSESSMENT_REPOSITORY)
    private readonly srbaiRepo: ISrbaiAssessmentRepository,
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async createHabit(userId: string, createHabitDto: CreateHabitDto) {
    await this.authService.ensureUserExists(userId);
    this.validateHabitConfiguration(createHabitDto);

    // Derive reminderEnabled: explicit field or from reminder.enabled
    const reminderEnabled =
      createHabitDto.reminderEnabled ??
      createHabitDto.reminder?.enabled ??
      false;

    // Build cues: prefer explicit cues[], otherwise derive from reminder settings
    const cues =
      createHabitDto.cues?.map((c) => this.buildCuePayload(c)) ??
      this.buildCuesFromReminder(createHabitDto.reminder);

    // Build motivation profile: merge top-level reason into motivationProfile
    const motivationProfile = this.mergeMotivationProfile(
      createHabitDto.motivationProfile,
      createHabitDto.reason,
    );

    const habit = await this.habitRepo.create({
      userId,
      title: createHabitDto.title,
      description: createHabitDto.description,
      precedingRoutine: createHabitDto.precedingRoutine ?? null,
      color: createHabitDto.color ?? null,
      iconType: createHabitDto.iconType ?? null,
      iconValue: createHabitDto.iconValue ?? null,
      benefits: createHabitDto.benefits ?? [],
      measurementUnit: createHabitDto.measurementUnit,
      targetValue: createHabitDto.targetValue,
      minimumTarget: createHabitDto.minimumTarget,
      startDate: new Date(createHabitDto.startDate),
      status: createHabitDto.status ?? HabitLifecycleStatus.ACTIVE,
      reminderEnabled,
      scheduleDays: createHabitDto.scheduleDays?.map((d) => ({
        weekday: d.weekday,
      })),
      steps: this.normalizeSteps(createHabitDto.steps),
      cues,
      motivationProfile,
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
      targetValue: updateHabitDto.targetValue ?? existingHabit.targetValue,
      scheduleDays:
        updateHabitDto.scheduleDays ??
        existingHabit.scheduleDays.map((d) => ({ weekday: d.weekday })),
      steps:
        updateHabitDto.steps ??
        existingHabit.steps.map((step) => ({
          title: step.title,
          orderIndex: step.orderIndex,
        })),
    });

    const reminderEnabled =
      updateHabitDto.reminderEnabled ?? updateHabitDto.reminder?.enabled;

    const cues =
      updateHabitDto.cues?.map((c) => this.buildCuePayload(c)) ??
      (updateHabitDto.reminder
        ? this.buildCuesFromReminder(updateHabitDto.reminder)
        : undefined);

    const motivationProfile =
      updateHabitDto.motivationProfile !== undefined ||
      updateHabitDto.reason !== undefined
        ? this.mergeMotivationProfile(
            updateHabitDto.motivationProfile,
            updateHabitDto.reason,
          )
        : undefined;

    const updatedHabit = await this.habitRepo.update(habitId, {
      title: updateHabitDto.title,
      description: updateHabitDto.description,
      precedingRoutine: updateHabitDto.precedingRoutine,
      color: updateHabitDto.color,
      iconType: updateHabitDto.iconType,
      iconValue: updateHabitDto.iconValue,
      benefits: updateHabitDto.benefits,
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
      reminderEnabled,
      scheduleDays: updateHabitDto.scheduleDays?.map((d) => ({
        weekday: d.weekday,
      })),
      steps:
        updateHabitDto.steps !== undefined
          ? this.normalizeSteps(updateHabitDto.steps)
          : undefined,
      cues,
      motivationProfile,
    });

    await this.analyticsService.recordActivity(userId, 'habit_updated');
    return updatedHabit;
  }

  async getTodayHabits(userId: string, date?: string) {
    await this.authService.ensureUserExists(userId);

    const targetDate = date ? new Date(date + 'T00:00:00') : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const weekday = date
      ? CueScheduleRules.weekdayOf(date)
      : CueScheduleRules.todayWeekday();
    const habits = await this.habitRepo.findActiveByUserId(userId);
    const todayHabits = habits.filter(
      (habit) =>
        habit.isScheduledOn(weekday) &&
        new Date(habit.startDate).setHours(0, 0, 0, 0) <= targetDate.getTime(),
    );
    const todayLogs = await this.habitLogRepo.findLatestByHabitIdsForDate(
      todayHabits.map((habit) => habit.id),
      targetDate,
    );
    const todayLogByHabitId = new Map(
      todayLogs.map((log) => [log.habitId, log]),
    );

    return Promise.all(
      todayHabits.map(async (habit) => {
        const logs = await this.habitLogRepo.findSummaryByHabitId(habit.id);

        // Current streak: count consecutive scheduled days with a DONE log
        let currentStreak = 0;
        const scheduledWds = new Set(habit.scheduleDays.map((d) => d.weekday));
        const logDateSet = new Map<string, string>(); // dateStr → latest status
        for (const log of logs) {
          if (log.completedAt) {
            const d = new Date(log.completedAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!logDateSet.has(key)) {
              logDateSet.set(key, log.status);
            }
          }
        }
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);
        for (let i = 0; i < 365; i++) {
          const wd = CueScheduleRules.weekdayOf(cursor);
          if (scheduledWds.size === 0 || scheduledWds.has(wd)) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
            const status = logDateSet.get(key);
            if (status === 'DONE') {
              currentStreak++;
            } else {
              // Today with no log yet doesn't break streak
              if (i === 0 && !status) {
                /* skip today */
              } else break;
            }
          }
          cursor.setDate(cursor.getDate() - 1);
        }

        // Composite strength score — same formula as /habit-strength/composite
        const [latestSrbai, contextSnapshots] = await Promise.all([
          this.srbaiRepo.findLatestByHabitId(habit.id),
          this.habitLogRepo.findContextSnapshotsByHabitId(habit.id, 20),
        ]);

        const strength = HabitStrengthRules.compute({
          habitId: habit.id,
          logs,
          scheduledWeekdayCount: habit.scheduleDays.length,
          hasCueConfiguration: habit.cues.length > 0,
          hasMotivationProfile: habit.motivationProfile !== null,
        });

        const srbaiScore = latestSrbai?.normalizedScore100 ?? 0;
        const maturity = Math.min(strength.totalLogs / 21, 1);
        const consistencyScore =
          Math.round(strength.doneRate * maturity * 100 * 100) / 100;
        const contextStabilityScore =
          HabitStrengthRules.computeContextStability(contextSnapshots);

        const composite = HabitStrengthRules.computeComposite({
          srbaiScore,
          consistencyScore,
          contextStabilityScore,
          selfInitiatedRate: strength.selfInitiatedRate,
        });

        const strengthScore = Math.round(composite.finalScore);

        return {
          ...habit,
          cueContext: habit.cues.map((cue) =>
            CueScheduleRules.evaluateCue(cue),
          ),
          currentStreak,
          strengthScore,
          todayLog: todayLogByHabitId.get(habit.id) ?? null,
        };
      }),
    );
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
    steps?: Array<{ title: string; orderIndex: number }>;
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

    if (habitConfig.steps) {
      if (habitConfig.steps.length > 5) {
        throw new BadRequestException('A habit can have at most 5 tiny steps.');
      }
      const uniqueOrderIndexes = new Set(
        habitConfig.steps.map((step) => step.orderIndex),
      );
      if (uniqueOrderIndexes.size !== habitConfig.steps.length) {
        throw new BadRequestException(
          'Each tiny step must have a unique orderIndex.',
        );
      }
    }
  }

  private buildCuePayload(cue: CreateHabitCueDto) {
    return {
      startTime: cue.startTime ?? null,
      endTime: cue.endTime ?? null,
      coarseLocation: cue.coarseLocation ?? null,
      locationLat: cue.locationLat ?? null,
      locationLng: cue.locationLng ?? null,
      precedingRoutine: cue.precedingRoutine ?? null,
      isActive: cue.isActive ?? true,
    };
  }

  private buildMotivationProfilePayload(
    motivationProfile: CreateHabitMotivationProfileDto,
  ) {
    return {
      goalTag: motivationProfile.goalTag ?? null,
      reason: motivationProfile.reason ?? null,
    };
  }

  /** Convert structured reminder settings → cue rows for internal storage. */
  private buildCuesFromReminder(reminder?: {
    timeWindows?: Array<{ startTime: string; endTime: string }>;
    locations?: Array<{ label?: string; lat: number; lng: number }>;
  }) {
    if (!reminder) return undefined;
    const cues: Array<{
      startTime: string | null;
      endTime: string | null;
      coarseLocation: string | null;
      locationLat: number | null;
      locationLng: number | null;
      precedingRoutine: string | null;
      isActive: boolean;
    }> = [];

    for (const tw of reminder.timeWindows ?? []) {
      cues.push({
        startTime: tw.startTime,
        endTime: tw.endTime,
        coarseLocation: null,
        locationLat: null,
        locationLng: null,
        precedingRoutine: null,
        isActive: true,
      });
    }
    for (const loc of reminder.locations ?? []) {
      cues.push({
        startTime: null,
        endTime: null,
        coarseLocation: loc.label ?? null,
        locationLat: loc.lat,
        locationLng: loc.lng,
        precedingRoutine: null,
        isActive: true,
      });
    }

    return cues.length > 0 ? cues : undefined;
  }

  /** Merge top-level reason into motivationProfile. */
  private mergeMotivationProfile(
    profile?: CreateHabitMotivationProfileDto | null,
    reason?: string,
  ) {
    if (!profile && !reason) return null;
    return {
      goalTag: profile?.goalTag ?? null,
      reason: reason ?? profile?.reason ?? null,
    };
  }

  private normalizeSteps(steps?: Array<{ title: string; orderIndex: number }>) {
    if (!steps) return undefined;

    return [...steps]
      .map((step) => ({
        title: step.title.trim(),
        orderIndex: step.orderIndex,
      }))
      .filter((step) => step.title.length > 0)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
}
