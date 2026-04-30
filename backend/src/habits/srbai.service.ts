import { Inject, Injectable } from '@nestjs/common';
import {
  HabitStrengthRules,
  CompositeScoreResult,
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
      rawAverage,
      normalizedScore100,
      assessedAt: dto.assessedAt ? new Date(dto.assessedAt) : new Date(),
    });

    await this.analyticsService.recordActivity(userId, 'srbai_submitted');
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
    const logs = await this.habitLogRepo.findSummaryByHabitId(habitId);
    const contextSnapshots =
      await this.habitLogRepo.findContextSnapshotsByHabitId(habitId, 20);
    const latestSrbai = await this.srbaiRepo.findLatestByHabitId(habitId);

    const signals = HabitStrengthRules.compute({
      habitId,
      logs,
      scheduledWeekdayCount: habit.scheduleDays.length,
      hasCueConfiguration: habit.cues.length > 0,
      hasMotivationProfile: habit.motivationProfile !== null,
    });

    const srbaiScore = latestSrbai?.normalizedScore100 ?? 0;

    // consistencyScore = doneRate * maturity * 100  (maturity ramps 0→1 over 21 logs)
    const maturity = Math.min(signals.totalLogs / 21, 1);
    const consistencyScore =
      Math.round(signals.doneRate * maturity * 100 * 100) / 100;

    // contextStabilityScore: derived from per-log context snapshots (hour, location, routine)
    const contextStabilityScore =
      HabitStrengthRules.computeContextStability(contextSnapshots);

    return HabitStrengthRules.computeComposite({
      srbaiScore,
      consistencyScore,
      contextStabilityScore,
      selfInitiatedRate: signals.selfInitiatedRate,
    });
  }

  // ── Tapering policy ────────────────────────────────────────────────────────

  async computeAndApplyTaperingPolicy(userId: string, habitId: string) {
    const composite = await this.getCompositeScore(userId, habitId);

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
