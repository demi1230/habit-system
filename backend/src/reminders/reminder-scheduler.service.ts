import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ReminderExecutionService } from './reminder-execution.service';
import { REMINDER_REPOSITORY } from '../domain/repositories/reminder.repository';
import type { IReminderRepository } from '../domain/repositories/reminder.repository';
import { Inject } from '@nestjs/common';

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
      const habits = await this.prisma.habit.findMany({
        where: {
          status: 'ACTIVE',
          archivedAt: null,
          reminderEnabled: true,
        },
        include: {
          cues: true,
          user: { select: { currentLat: true, currentLng: true } },
        },
      });

      for (const habit of habits) {
        if (!this.isWithinAnyActiveWindow(habit.cues, habit.user.currentLat, habit.user.currentLng)) {
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
      const now = new Date();
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

  private isWithinAnyActiveWindow(
    cues: Array<{
      isActive: boolean;
      startTime: string | null;
      endTime: string | null;
      coarseLocation: string | null;
      locationLat: number | null;
      locationLng: number | null;
    }>,
    userLat: number | null,
    userLng: number | null,
  ) {
    const activeCues = cues.filter((cue) => cue.isActive);
    if (activeCues.length === 0) {
      return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return activeCues.some((cue) => {
      // GPS location gate: cue has precise coordinates → user must be within 100 m
      if (cue.locationLat !== null && cue.locationLng !== null) {
        if (userLat === null || userLng === null) return false;
        if (!this.isWithin100m(userLat, userLng, cue.locationLat, cue.locationLng)) return false;
      }

      // Time window check
      if (!cue.startTime || !cue.endTime) {
        return true;
      }

      const [startHour, startMinute] = cue.startTime.split(':').map(Number);
      const [endHour, endMinute] = cue.endTime.split(':').map(Number);
      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;

      if (endTotal >= startTotal) {
        return currentMinutes >= startTotal && currentMinutes <= endTotal;
      }

      return currentMinutes >= startTotal || currentMinutes <= endTotal;
    });
  }

  /** Returns true if two GPS points are within 100 metres of each other (Haversine). */
  private isWithin100m(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
    thresholdMetres = 100,
  ): boolean {
    const R = 6_371_000; // Earth radius in metres
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const distance = 2 * R * Math.asin(Math.sqrt(a));
    return distance <= thresholdMetres;
  }
}
