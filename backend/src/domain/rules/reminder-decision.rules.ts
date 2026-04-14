import { Weekday, ReminderDecisionReason } from '../enums/domain.enums';
import { HabitCueEntity } from '../entities/habit-cue.entity';
import { CueScheduleRules } from './cue-schedule.rules';

export interface ReminderDecisionInput {
  habitId: string;
  reminderEnabled: boolean;
  scheduleDays: Array<{ weekday: Weekday }>;
  cues: HabitCueEntity[];
}

export interface ReminderDecisionResult {
  habitId: string;
  shouldRemind: boolean;
  reason: ReminderDecisionReason;
  isScheduledToday: boolean;
  activeCueCount: number;
  evaluatedAt: string;
}

/**
 * Domain rules — Reminder decision
 * Pure stateless logic for determining whether to remind a user about a habit.
 * Thesis mapping: "Санууглын шийдвэр · Reminder decision rules" from the Domain layer.
 */
export class ReminderDecisionRules {
  static decide(input: ReminderDecisionInput): ReminderDecisionResult {
    const isScheduledToday = CueScheduleRules.isScheduledToday(
      input.scheduleDays,
    );
    const activeCues = CueScheduleRules.getActiveCues(input.cues);
    const activeCueCount = activeCues.length;

    let reason: ReminderDecisionReason;

    if (!input.reminderEnabled) {
      reason = ReminderDecisionReason.REMINDER_DISABLED;
    } else if (!isScheduledToday) {
      reason = ReminderDecisionReason.NOT_SCHEDULED_TODAY;
    } else if (activeCueCount === 0) {
      reason = ReminderDecisionReason.NO_ACTIVE_CUES;
    } else {
      reason = ReminderDecisionReason.SHOULD_REMIND;
    }

    return {
      habitId: input.habitId,
      shouldRemind: reason === ReminderDecisionReason.SHOULD_REMIND,
      reason,
      isScheduledToday,
      activeCueCount,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
