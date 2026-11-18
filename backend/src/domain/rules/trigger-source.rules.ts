import { CompletionTriggerSource } from '../enums/domain.enums';
import { appDateOf } from '../../shared/time';

/**
 * Domain rules — Completion trigger source
 * Classifies what prompted a completion logged in the app, so the
 * self-initiated rate does not depend on what the client claims.
 *
 * Rule (explicit and testable; a heuristic, not an observed cause):
 *  - Logged for an earlier day (catch-up entry): UNKNOWN.
 *  - A reminder for the habit reached a device within the
 *    REMINDER_ATTRIBUTION_WINDOW_MINUTES before completedAt:
 *    REMINDER_TRIGGERED, linked to that reminder.
 *  - Otherwise: SELF_INITIATED.
 *
 * Known limitation: completedAt is when the user logged it in the app, which
 * may be later than when the habit was actually performed.
 */
export const REMINDER_ATTRIBUTION_WINDOW_MINUTES = 60;

export interface TriggerSourceInput {
  completedAt: Date;
  now: Date;
  /** Latest delivered reminder for the habit before completedAt, if any. */
  lastDeliveredReminder: { id: string; sentAt: Date } | null;
}

export interface TriggerSourceResult {
  triggerSource: CompletionTriggerSource;
  linkedReminderId: string | null;
}

export class TriggerSourceRules {
  static classify(input: TriggerSourceInput): TriggerSourceResult {
    if (appDateOf(input.completedAt) < appDateOf(input.now)) {
      return {
        triggerSource: CompletionTriggerSource.UNKNOWN,
        linkedReminderId: null,
      };
    }

    const reminder = input.lastDeliveredReminder;
    if (reminder) {
      const minutesAfterReminder =
        (input.completedAt.getTime() - reminder.sentAt.getTime()) / 60_000;
      if (
        minutesAfterReminder >= 0 &&
        minutesAfterReminder <= REMINDER_ATTRIBUTION_WINDOW_MINUTES
      ) {
        return {
          triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
          linkedReminderId: reminder.id,
        };
      }
    }

    return {
      triggerSource: CompletionTriggerSource.SELF_INITIATED,
      linkedReminderId: null,
    };
  }

  /** Earliest reminder send time that can still be attributed to a completion. */
  static attributionWindowStart(completedAt: Date): Date {
    return new Date(
      completedAt.getTime() - REMINDER_ATTRIBUTION_WINDOW_MINUTES * 60_000,
    );
  }
}
