import { Weekday } from '../enums/domain.enums';
import { HabitCueEntity } from '../entities/habit-cue.entity';
import { CueScheduleRules } from './cue-schedule.rules';

export type ReminderDecisionReason =
  | 'reminder_disabled'
  | 'not_scheduled_today'
  | 'no_active_cues'
  | 'remind';

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
      reason = 'reminder_disabled';
    } else if (!isScheduledToday) {
      reason = 'not_scheduled_today';
    } else if (activeCueCount === 0) {
      reason = 'no_active_cues';
    } else {
      reason = 'remind';
    }

    return {
      habitId: input.habitId,
      shouldRemind: reason === 'remind',
      reason,
      isScheduledToday,
      activeCueCount,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
