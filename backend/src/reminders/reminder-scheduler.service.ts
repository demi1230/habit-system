import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ReminderExecutionService } from './reminder-execution.service';

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
        },
      });

      for (const habit of habits) {
        if (!this.isWithinAnyActiveWindow(habit.cues)) {
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
    }>,
  ) {
    const activeCues = cues.filter((cue) => cue.isActive);
    if (activeCues.length === 0) {
      return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return activeCues.some((cue) => {
      if (cue.coarseLocation && !cue.startTime && !cue.endTime) {
        return true;
      }
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
}
