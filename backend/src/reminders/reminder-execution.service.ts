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

/** Default cooldown (minutes) when no ReminderPolicy exists for the habit. */
const DEFAULT_COOLDOWN_MINUTES = 60;

/**
 * Returns a local-time hourly bucket string "YYYY-MM-DDTHH" for dedup keys.
 * Uses the server's local clock (UTC+8 / Ulaanbaatar) so the bucket aligns
 * with the user-facing hour, matching how cue startTime/endTime are stored.
 */
function localHourBucket(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  return `${y}-${mo}-${d}T${h}`;
}

/**
 * Application service — Reminder execution
 * Evaluates whether a reminder should be sent, persists the result,
 * and drives the stub notification gateway.
 *
 * Dedup strategy: each reminder records a cooldownKey = `habitId:YYYY-MM-DDTHH`
 * (hourly bucket). Before creating a new reminder we check for any PENDING or
 * SENT reminder with the same key whose effectiveUntil is still in the future.
 * This allows multiple reminder windows per day while preventing duplicates
 * within the same window.
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

    // Hourly cooldown key: allows multiple windows per day, deduplicates within one
    // Uses local (server) time so the hourly bucket aligns with the user-facing clock.
    const cooldownKey = `${habitId}:${localHourBucket(now)}`; // YYYY-MM-DDTHH (local)

    // Resolve cooldown duration from persisted policy, falling back to default
    const policy = await this.policyRepo.findByHabitId(habitId);
    const cooldownMinutes = policy?.cooldownMinutes ?? DEFAULT_COOLDOWN_MINUTES;

    // Dedup: reject if an active reminder with the same key still covers now
    const existing = await this.reminderRepo.findActiveByCooldownKey(
      cooldownKey,
      now,
    );

    if (existing) {
      throw new ConflictException(
        `An active reminder already exists for habit ${habitId} in the ` +
          `current hourly window (reminderId=${existing.id}).`,
      );
    }

    // Convert UTC to Mongolia time (UTC+8)
    const mongoliaOffset = 8 * 60 * 60 * 1000;
    const scheduledFor = new Date(now.getTime() + mongoliaOffset);
    const effectiveUntil = new Date(
      now.getTime() + mongoliaOffset + cooldownMinutes * 60_000,
    );
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


