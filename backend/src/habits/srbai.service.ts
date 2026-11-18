import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  HabitStrengthRules,
  CompositeScoreResult,
  CURRENT_SRBAI_INSTRUMENT_VERSION,
} from '../domain/rules/habit-strength.rules';
import type { ISrbaiAssessmentRepository } from '../domain/repositories/srbai-assessment.repository';
import { SRBAI_ASSESSMENT_REPOSITORY } from '../domain/repositories/srbai-assessment.repository';
import type { IReminderPolicyRepository } from '../domain/repositories/reminder-policy.repository';
import { REMINDER_POLICY_REPOSITORY } from '../domain/repositories/reminder-policy.repository';
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import { HabitsService } from '../habits/habits.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateSrbaiAssessmentDto } from '../habits/dto/create-srbai-assessment.dto';
import { dateOnlyToYmd } from '../shared/time';

/**
 * Application service — SRBAI & habit-strength composite
 *
 * Handles:
 *  - SRBAI assessment submission with automatic scoring
 *  - Final composite habit-strength score computation
 *  - Deterministic reminder tapering policy recommendation + persistence
 *
 * Thesis mapping: "SRBAI үйлчилгээ · SRBAI & composite score service"
 */
@Injectable()
export class SrbaiService {
  private readonly logger = new Logger(SrbaiService.name);

  constructor(
    @Inject(SRBAI_ASSESSMENT_REPOSITORY)
    private readonly srbaiRepo: ISrbaiAssessmentRepository,
    @Inject(REMINDER_POLICY_REPOSITORY)
    private readonly policyRepo: IReminderPolicyRepository,
    @Inject(HABIT_LOG_REPOSITORY)
    private readonly habitLogRepo: IHabitLogRepository,
    private readonly habitsService: HabitsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  // ── Submit SRBAI ───────────────────────────────────────────────────────────

  async submitAssessment(
    userId: string,
    habitId: string,
    dto: CreateSrbaiAssessmentDto,
  ) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);

    const { rawAverage, normalizedScore100 } = HabitStrengthRules.scoreSrbai({
      item1: dto.item1,
      item2: dto.item2,
      item3: dto.item3,
      item4: dto.item4,
    });

    const assessment = await this.srbaiRepo.create({
      userId,
      habitId,
      item1: dto.item1,
      item2: dto.item2,
      item3: dto.item3,
      item4: dto.item4,
      instrumentVersion: CURRENT_SRBAI_INSTRUMENT_VERSION,
      rawAverage,
      normalizedScore100,
      assessedAt: dto.assessedAt ? new Date(dto.assessedAt) : new Date(),
    });

    await this.analyticsService.recordActivity(userId, 'srbai_submitted');

    // A new automaticity rating is the evidence the tapering rule needs, so
    // the reminder policy is re-derived here. Failure must not lose the
    // already-saved assessment.
    try {
      await this.computeAndApplyTaperingPolicy(userId, habitId);
    } catch (error) {
      this.logger.warn(
        `Reminder policy update failed for habit ${habitId}: ${String(error)}`,
      );
    }

    return assessment;
  }

  async getLatestAssessment(userId: string, habitId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    return this.srbaiRepo.findLatestByHabitId(habitId);
  }

  async listAssessments(userId: string, habitId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    return this.srbaiRepo.findAllByHabitId(habitId);
  }

  // ── Composite score ────────────────────────────────────────────────────────

  async getCompositeScore(
    userId: string,
    habitId: string,
  ): Promise<CompositeScoreResult> {
    const habit = await this.habitsService.getOwnedHabitOrThrow(
      userId,
      habitId,
    );
    const [logs, contextSnapshots, latestSrbai] = await Promise.all([
      this.habitLogRepo.findSummaryByHabitId(habitId),
      this.habitLogRepo.findContextSnapshotsByHabitId(habitId, 20),
      this.srbaiRepo.findLatestByHabitId(habitId),
    ]);

    return HabitStrengthRules.evaluateComposite({
      logs,
      scheduledWeekdays: habit.scheduleDays.map((d) => d.weekday),
      startDate: dateOnlyToYmd(habit.startDate),
      latestSrbaiScore: latestSrbai?.normalizedScore100 ?? null,
      contextSnapshots,
      now: new Date(),
    });
  }

  // ── Tapering policy ────────────────────────────────────────────────────────

  async computeAndApplyTaperingPolicy(userId: string, habitId: string) {
    const composite = await this.getCompositeScore(userId, habitId);

    // Without enough evidence the current policy is kept unchanged.
    if (composite.stage === 'insufficient_data') {
      return {
        composite,
        recommendation: null,
        policy: await this.policyRepo.findByHabitId(habitId),
      };
    }

    const recommendation = HabitStrengthRules.recommendTaperingPolicy(
      composite.stage,
      composite.selfInitiatedRate,
    );

    const policy = await this.policyRepo.upsert({
      habitId,
      mode: recommendation.recommendedMode,
      cooldownMinutes: recommendation.cooldownMinutes,
      maxPerDay: recommendation.maxPerDay,
      narrowingLevel: recommendation.narrowingLevel,
      effectiveFrom: new Date(),
    });

    return {
      composite,
      recommendation,
      policy,
    };
  }

  async getReminderPolicy(userId: string, habitId: string) {
    await this.habitsService.getOwnedHabitOrThrow(userId, habitId);
    return this.policyRepo.findByHabitId(habitId);
  }
}
