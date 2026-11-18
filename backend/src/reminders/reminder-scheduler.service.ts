import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ReminderExecutionService } from './reminder-execution.service';
import { REMINDER_REPOSITORY } from '../domain/repositories/reminder.repository';
import type { IReminderRepository } from '../domain/repositories/reminder.repository';
import { Inject } from '@nestjs/common';
import { appDateOf, appDayRange, nowInAppTz } from '../shared/time';
import { CueWindowRules } from '../domain/rules/cue-window.rules';

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);
  private readonly schedulerEnabled: boolean;
  private isRunning = false;
  private lastFailureLoggedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reminderExecutionService: ReminderExecutionService,
    private readonly configService: ConfigService,
    @Inject(REMINDER_REPOSITORY)
    private readonly reminderRepo: IReminderRepository,
  ) {
    this.schedulerEnabled =
      this.configService.get<string>('REMINDER_SCHEDULER_ENABLED') === 'true';

    if (!this.schedulerEnabled) {
      this.logger.log(
        'Reminder scheduler is disabled. Set REMINDER_SCHEDULER_ENABLED=true to enable background reminder delivery.',
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processDueReminders() {
    if (!this.schedulerEnabled) {
      return;
    }

    if (this.isRunning) {
      this.logger.debug(
        'Skipping reminder scheduler tick because the previous run is still in progress.',
      );
      return;
    }

    this.isRunning = true;

    try {
      // Reminders from earlier days can no longer be acted on, and overdue
      // snooze follow-ups from those days must not all fire at once.
      await this.reminderRepo.expireScheduledBefore(
        appDayRange(appDateOf(new Date())).start,
      );

      const habits = await this.prisma.habit.findMany({
        where: {
          status: 'ACTIVE',
          archivedAt: null,
          reminderEnabled: true,
        },
        include: {
          cues: true,
          user: {
            select: {
              currentLat: true,
              currentLng: true,
              currentLocationAt: true,
            },
          },
        },
      });

      // Wall-clock time in the application timezone, not the host's (UTC).
      const now = new Date();
      const local = nowInAppTz(now);
      const minuteOfDay = local.hour * 60 + local.minute;

      for (const habit of habits) {
        const { currentLat, currentLng, currentLocationAt } = habit.user;
        const window = CueWindowRules.evaluate({
          cues: habit.cues,
          minuteOfDay,
          userLocation:
            currentLat !== null && currentLng !== null
              ? {
                  lat: currentLat,
                  lng: currentLng,
                  updatedAt: currentLocationAt,
                }
              : null,
          now,
        });
        if (!window.open) {
          continue;
        }

        try {
          await this.reminderExecutionService.evaluateAndCreate(
            habit.userId,
            habit.id,
            {},
          );
        } catch (error) {
          this.logger.debug(
            `Reminder scheduler skipped habit ${habit.id}: ${String(error)}`,
          );
        }
      }

      // Deliver any snooze follow-up reminders whose scheduled time has arrived
      const snoozeFollowUps =
        await this.reminderRepo.findDuePendingSnoozeFollowUps(now);

      for (const followUp of snoozeFollowUps) {
        try {
          await this.reminderExecutionService.deliverPendingReminder(followUp);
          this.logger.debug(
            `Snooze follow-up delivered: reminderId=${followUp.id}`,
          );
        } catch (error) {
          this.logger.debug(
            `Snooze follow-up delivery failed for reminderId=${followUp.id}: ${String(error)}`,
          );
        }
      }
    } catch (error) {
      const now = Date.now();
      const shouldLog = now - this.lastFailureLoggedAt >= 5 * 60 * 1000;

      if (shouldLog) {
        this.lastFailureLoggedAt = now;
        this.logger.warn(
          `Reminder scheduler could not query the database. Background reminders are temporarily skipped. ${String(error)}`,
        );
      }
    } finally {
      this.isRunning = false;
    }
  }
}
