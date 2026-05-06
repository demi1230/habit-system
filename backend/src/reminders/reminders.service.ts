import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CompletionTriggerSource,
  HabitLogStatus,
  ReminderActionType,
  ReminderStatus,
} from '../domain/enums/domain.enums';
import { ReminderEntity } from '../domain/entities/reminder.entity';
import { ReminderActionEntity } from '../domain/entities/reminder-action.entity';
import { HabitLogEntity } from '../domain/entities/habit-log.entity';
import type { IReminderRepository } from '../domain/repositories/reminder.repository';
import { REMINDER_REPOSITORY } from '../domain/repositories/reminder.repository';
import type { IReminderActionRepository } from '../domain/repositories/reminder-action.repository';
import { REMINDER_ACTION_REPOSITORY } from '../domain/repositories/reminder-action.repository';
import type { IHabitLogRepository } from '../domain/repositories/habit-log.repository';
import { HABIT_LOG_REPOSITORY } from '../domain/repositories/habit-log.repository';
import { CreateReminderActionDto } from './dto/create-reminder-action.dto';
import { AnalyticsService } from '../analytics/analytics.service';
import { HabitsService } from '../habits/habits.service';

/** Return shape for a DONE action. */
export interface DoneActionResult {
  reminder: ReminderEntity;
  action: ReminderActionEntity;
  habitLog: HabitLogEntity | null;
}

/** Return shape for a SNOOZE action. */
export interface SnoozeActionResult {
  reminder: ReminderEntity;
  action: ReminderActionEntity;
  followUpReminder: ReminderEntity;
}

/** Default snooze duration when no snoozeMinutes is provided. */
const DEFAULT_SNOOZE_MINUTES = 30;

/**
 * Application service — Reminders
 * Handles listing reminders and processing user actions (DONE / SNOOZE).
 *
 * Thesis mapping: "Сануулга · Reminders service"
 */
@Injectable()
export class RemindersService {
  constructor(
    @Inject(REMINDER_REPOSITORY)
    private readonly reminderRepo: IReminderRepository,
    @Inject(REMINDER_ACTION_REPOSITORY)
    private readonly reminderActionRepo: IReminderActionRepository,
    @Inject(HABIT_LOG_REPOSITORY)
    private readonly habitLogRepo: IHabitLogRepository,
    private readonly analyticsService: AnalyticsService,
    private readonly habitsService: HabitsService,
  ) {}

  async listReminders(userId: string): Promise<ReminderEntity[]> {
    return this.reminderRepo.findAllByUserId(userId);
  }

  async getReminder(
    userId: string,
    reminderId: string,
  ): Promise<ReminderEntity> {
    const reminder = await this.reminderRepo.findByIdAndUserId(
      reminderId,
      userId,
    );
    if (!reminder) {
      throw new NotFoundException(
        `Reminder ${reminderId} was not found for user ${userId}.`,
      );
    }
    return reminder;
  }

  /**
   * Submit a DONE or SNOOZE action on a reminder.
   *
   * DONE rules:
   *  - Reminder must not already be ACTED.
   *  - DONE action may only be recorded once.
   *  - Auto-creates a HabitLog with REMINDER_TRIGGERED if none already exists.
   *
   * SNOOZE rules:
   *  - Provided snoozeMinutes (default 30) determines snoozedUntil.
   *  - Does not create a completion log.
   *  - Creates a new Reminder starting at snoozedUntil (scheduled follow-up).
   */
  async submitAction(
    userId: string,
    reminderId: string,
    dto: CreateReminderActionDto,
  ): Promise<DoneActionResult | SnoozeActionResult> {
    const reminder = await this.getReminder(userId, reminderId);

    if (reminder.status === ReminderStatus.ACTED) {
      throw new ConflictException(
        `Reminder ${reminderId} has already been acted upon and accepts no further actions.`,
      );
    }

    if (reminder.status === ReminderStatus.EXPIRED) {
      throw new ConflictException(`Reminder ${reminderId} has expired.`);
    }

    if (reminder.status === ReminderStatus.CANCELLED) {
      throw new ConflictException(`Reminder ${reminderId} has been cancelled.`);
    }

    const actedAt = dto.actedAt ? new Date(dto.actedAt) : new Date();

    if (dto.actionType === ReminderActionType.DONE) {
      return this.handleDone(reminder, userId, actedAt);
    }

    if (dto.actionType === ReminderActionType.SNOOZE) {
      const snoozeMinutes = dto.snoozeMinutes ?? DEFAULT_SNOOZE_MINUTES;
      return this.handleSnooze(reminder, userId, actedAt, snoozeMinutes);
    }

    throw new BadRequestException(
      `Unknown actionType: ${dto.actionType as string}`,
    );
  }

  // ─── Private action handlers ────────────────────────────────────────────────

  private async handleDone(
    reminder: ReminderEntity,
    userId: string,
    actedAt: Date,
  ): Promise<DoneActionResult> {
    // Idempotency: prevent double DONE
    const alreadyDone = await this.reminderActionRepo.hasDoneAction(
      reminder.id,
    );
    if (alreadyDone) {
      throw new ConflictException(
        `A DONE action already exists for reminder ${reminder.id}.`,
      );
    }

    // Mark reminder as ACTED
    await this.reminderRepo.update(reminder.id, {
      status: ReminderStatus.ACTED,
    });

    // Record the action
    const action = await this.reminderActionRepo.create({
      reminderId: reminder.id,
      userId,
      actionType: ReminderActionType.DONE,
      actedAt,
    });

    // Auto-create HabitLog if none already exists for this habit today.
    // Check two things:
    //  1. A log already linked to this specific reminder (strict idempotency).
    //  2. ANY log for today's date for this habit (prevents double-log when
    //     the user also manually completed the habit in the Dashboard).
    const todayDate = new Date();
    const [existingLinkedLog, todayLogs] = await Promise.all([
      this.habitLogRepo.findByLinkedReminderId(reminder.id),
      this.habitLogRepo.findLatestByHabitIdsForDate(
        [reminder.habitId],
        todayDate,
      ),
    ]);

    const existingTodayLog = todayLogs.find(
      (l) => l.habitId === reminder.habitId,
    );

    let habitLog: HabitLogEntity | null;
    if (existingLinkedLog) {
      // Already linked to this reminder — fully idempotent, reuse
      habitLog = existingLinkedLog;
    } else if (existingTodayLog) {
      // Habit already logged today (e.g., from Dashboard) — reuse that log,
      // don't create a second one
      habitLog = await this.habitLogRepo.findById(existingTodayLog.id);
    } else {
      // No log for today — create one using the habit's targetValue
      const habit = await this.habitsService.getOwnedHabitOrThrow(
        userId,
        reminder.habitId,
      );
      habitLog = await this.habitLogRepo.create({
        habitId: reminder.habitId,
        status: HabitLogStatus.DONE,
        actualValue: habit.targetValue,
        completedAt: actedAt,
        loggedAt: new Date(),
        triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
        linkedReminderId: reminder.id,
        sourceConfidence: 1.0,
      });
    }

    await this.analyticsService.recordActivity(userId, 'reminder_done');

    return {
      reminder: { ...reminder, status: ReminderStatus.ACTED },
      action,
      habitLog,
    };
  }

  private async handleSnooze(
    reminder: ReminderEntity,
    userId: string,
    actedAt: Date,
    snoozeMinutes: number,
  ): Promise<SnoozeActionResult> {
    const snoozedUntil = new Date(
      actedAt.getTime() + snoozeMinutes * 60 * 1000,
    );

    // Record the snooze action
    const action = await this.reminderActionRepo.create({
      reminderId: reminder.id,
      userId,
      actionType: ReminderActionType.SNOOZE,
      actedAt,
      snoozedUntil,
      metadata: { snoozeMinutes },
    });

    await this.reminderRepo.update(reminder.id, {
      status: ReminderStatus.CANCELLED,
    });

    // Create a follow-up PENDING reminder at snoozedUntil
    const followUp = await this.reminderRepo.create({
      userId,
      habitId: reminder.habitId,
      linkedCueId: reminder.linkedCueId,
      decisionReason: reminder.decisionReason,
      scheduledFor: snoozedUntil,
      evaluatedAt: new Date(),
      effectiveUntil: new Date(snoozedUntil.getTime() + 2 * 60 * 60 * 1000),
      cooldownKey: `${reminder.habitId}:snooze:${snoozedUntil.toISOString()}`,
      explanation: { snoozeFromReminderId: reminder.id, snoozeMinutes },
    });

    await this.analyticsService.recordActivity(userId, 'reminder_snooze');

    return {
      reminder: { ...reminder, status: ReminderStatus.CANCELLED },
      action,
      followUpReminder: followUp,
    };
  }
}
