import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { ReminderDecisionRules } from '../domain/rules/reminder-decision.rules';
import {
  ReminderDecisionReason,
  ReminderStatus,
} from '../domain/enums/domain.enums';
import type { IReminderRepository } from '../domain/repositories/reminder.repository';
import { REMINDER_REPOSITORY } from '../domain/repositories/reminder.repository';
import type { IReminderPolicyRepository } from '../domain/repositories/reminder-policy.repository';
import { REMINDER_POLICY_REPOSITORY } from '../domain/repositories/reminder-policy.repository';
import * as notificationGatewayInterface from './notification/notification.gateway.interface';
import { ReminderEntity } from '../domain/entities/reminder.entity';
import { HabitsService } from '../habits/habits.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { EvaluateAndCreateReminderDto } from './dto/evaluate-and-create-reminder.dto';
import { ReminderMessageBuilder } from './reminder-message.builder';
import { nowInAppTz } from '../shared/time';

/** Default cooldown (minutes) when no ReminderPolicy exists for the habit. */
const DEFAULT_COOLDOWN_MINUTES = 60;

/**
 * Application service — Reminder execution
 * Evaluates whether a reminder should be sent, persists the result,
 * and drives the stub notification gateway.
 *
 * Dedup strategy (habit-scoped, timezone-agnostic): before creating a new
 * reminder we check for any PENDING or SENT reminder for the same habit
 * whose `effectiveUntil` is still in the future. The dedup window is the
 * habit's `cooldownMinutes` (60 by default).
 *
 * The `cooldownKey` column is still populated for diagnostic purposes and is
 * also reused by the snooze follow-up pathway (which writes a `:snooze:` key).
 *
 * Thesis mapping: "Сануулга гүйцэтгэх · Reminder execution service"
 */
@Injectable()
export class ReminderExecutionService {
  private readonly logger = new Logger(ReminderExecutionService.name);

  constructor(
    @Inject(REMINDER_REPOSITORY)
    private readonly reminderRepo: IReminderRepository,
    @Inject(notificationGatewayInterface.NOTIFICATION_GATEWAY)
    private readonly notificationGateway: notificationGatewayInterface.INotificationGateway,
    @Inject(REMINDER_POLICY_REPOSITORY)
    private readonly policyRepo: IReminderPolicyRepository,
    private readonly habitsService: HabitsService,
    private readonly analyticsService: AnalyticsService,
    private readonly reminderMessageBuilder: ReminderMessageBuilder,
  ) {}

  /**
   * Core entry-point called by the controller.
   * 1. Loads the habit with ownership check.
   * 2. Runs stateless ReminderDecisionRules.
   * 3. If shouldRemind=false → returns decision without persisting.
   * 4. Checks cooldown key to prevent duplicate reminders in the same window.
   * 5. Persists the Reminder record (PENDING).
   * 6. Calls the notification gateway → SENT.
   */
  async evaluateAndCreate(
    userId: string,
    habitId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dto: EvaluateAndCreateReminderDto,
  ): Promise<EvaluateAndCreateResult> {
    const habit = await this.habitsService.getOwnedHabitOrThrow(
      userId,
      habitId,
    );

    const decision = ReminderDecisionRules.decide({
      habitId,
      reminderEnabled: habit.reminderEnabled,
      scheduleDays: habit.scheduleDays,
      cues: habit.cues,
    });

    const decisionReason = decision.reason;

    if (!decision.shouldRemind) {
      return {
        persisted: false,
        decisionReason,
        evaluatedAt: decision.evaluatedAt,
        reminder: null,
      };
    }

    const now = new Date();

    // Resolve cooldown duration from persisted policy, falling back to default
    const policy = await this.policyRepo.findByHabitId(habitId);
    const cooldownMinutes = policy?.cooldownMinutes ?? DEFAULT_COOLDOWN_MINUTES;

    // Habit-scoped dedup: reject if any active PENDING/SENT reminder for this
    // habit still has effectiveUntil > now. Timezone-agnostic by construction
    // (no bucket strings involved), so it stays correct on Railway/UTC hosts
    // and survives any change of `APP_TIMEZONE` going forward.
    const existing = await this.reminderRepo.findActiveByHabitId(habitId, now);

    if (existing) {
      throw new ConflictException(
        `An active reminder already exists for habit ${habitId} ` +
          `(reminderId=${existing.id}).`,
      );
    }

    // Stored for diagnostics and to keep the schema column non-null-ish.
    // The hourly bucket is computed in the app timezone via Intl so it lines
    // up with what the user sees on screen, regardless of host timezone.
    const cooldownKey = `${habitId}:${nowInAppTz(now).ymdh}`; // YYYY-MM-DDTHH

    // Persist real UTC instants. The frontend renders them in the user's
    // local timezone via Intl, so no offset manipulation is needed here.
    const scheduledFor = now;
    const effectiveUntil = new Date(now.getTime() + cooldownMinutes * 60_000);
    const message = this.reminderMessageBuilder.build(habit);

    // Persist PENDING reminder
    let reminder = await this.reminderRepo.create({
      userId,
      habitId,
      linkedCueId: decision.activeCueCount > 0 ? null : null,
      decisionReason,
      scheduledFor,
      evaluatedAt: new Date(decision.evaluatedAt),
      effectiveUntil,
      cooldownKey,
      explanation: {
        isScheduledToday: decision.isScheduledToday,
        activeCueCount: decision.activeCueCount,
        contentParts: message.contentParts,
        body: message.body,
      },
    });

    // Send via gateway → mark SENT
    try {
      const delivery = await this.notificationGateway.send({
        userId,
        habitId,
        reminderId: reminder.id,
        title: message.title,
        body: message.body,
        scheduledFor,
      });

      reminder = await this.reminderRepo.update(reminder.id, {
        status: ReminderStatus.SENT,
        sentAt: new Date(),
        deliveredAt: delivery.deliveredAt ?? undefined,
      });

      await this.analyticsService.recordActivity(userId, 'reminder_sent');
    } catch (err) {
      this.logger.error(
        `Notification gateway failed for reminderId=${reminder.id}: ${String(err)}`,
      );
      // Leave reminder in PENDING — caller can retry
    }

    return {
      persisted: true,
      decisionReason,
      evaluatedAt: decision.evaluatedAt,
      reminder,
    };
  }

  /**
   * Delivers push for an already-persisted PENDING reminder (e.g. snooze follow-ups).
   * Reads title/body from explanation.contentParts if available.
   */
  async deliverPendingReminder(reminder: ReminderEntity): Promise<void> {
    const explanation = reminder.explanation;
    const parts = explanation?.contentParts as
      | { habit?: string; cue?: string | null }
      | undefined;

    const habitTitle = parts?.habit ?? 'Дадлын сануулга';
    const body =
      (explanation?.body as string | undefined) ??
      `${habitTitle} дадлаа хийгээрэй.`;

    try {
      const delivery = await this.notificationGateway.send({
        userId: reminder.userId,
        habitId: reminder.habitId,
        reminderId: reminder.id,
        title: habitTitle,
        body,
        scheduledFor: new Date(reminder.scheduledFor),
      });

      await this.reminderRepo.update(reminder.id, {
        status: ReminderStatus.SENT,
        sentAt: new Date(),
        deliveredAt: delivery.deliveredAt ?? undefined,
      });

      await this.analyticsService.recordActivity(
        reminder.userId,
        'reminder_sent',
      );
    } catch (err) {
      this.logger.error(
        `deliverPendingReminder failed for reminderId=${reminder.id}: ${String(err)}`,
      );
    }
  }
}

export interface EvaluateAndCreateResult {
  persisted: boolean;
  decisionReason: ReminderDecisionReason;
  evaluatedAt: string;
  reminder: ReminderEntity | null;
}
