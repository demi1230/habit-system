import { Weekday } from '../enums/domain.enums';
import { HabitCueEntity } from '../entities/habit-cue.entity';

/** Maps JS Date.getDay() (0 = Sunday) to the Weekday enum. */
export const JS_DAY_TO_WEEKDAY: Record<number, Weekday> = {
  0: Weekday.SUNDAY,
  1: Weekday.MONDAY,
  2: Weekday.TUESDAY,
  3: Weekday.WEDNESDAY,
  4: Weekday.THURSDAY,
  5: Weekday.FRIDAY,
  6: Weekday.SATURDAY,
};

/** Evaluated cue — the read-side projection sent to the client. */
export interface CueContext {
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  coarseLocation: string | null;
  precedingRoutine: string | null;
}

/**
 * Domain rules — Cue · Schedule
 * Pure static methods with no I/O dependencies.  Thesis mapping:
 * "Өдөөгч нөхцөл · Cue schedule rules" from the Domain layer.
 */
export class CueScheduleRules {
  /** Returns today's weekday enum value. */
  static todayWeekday(): Weekday {
    return JS_DAY_TO_WEEKDAY[new Date().getDay()];
  }

  /** A habit with an empty schedule is treated as a daily habit. */
  static isScheduledToday(scheduleDays: Array<{ weekday: Weekday }>): boolean {
    if (scheduleDays.length === 0) return true;
    const today = CueScheduleRules.todayWeekday();
    return scheduleDays.some((d) => d.weekday === today);
  }

  /** Projects a cue to its read-side CueContext shape. */
  static evaluateCue(
    cue: Pick<
      HabitCueEntity,
      | 'isActive'
      | 'startTime'
      | 'endTime'
      | 'coarseLocation'
      | 'precedingRoutine'
    >,
  ): CueContext {
    return {
      isActive: cue.isActive,
      startTime: cue.startTime ?? null,
      endTime: cue.endTime ?? null,
      coarseLocation: cue.coarseLocation ?? null,
      precedingRoutine: cue.precedingRoutine ?? null,
    };
  }

  /**
   * Returns all evaluated cues that are currently active.
   * "Active" means the cue's `isActive` flag is `true` (an admin/user toggle).
   * Real-time time-window or location matching is NOT performed here.
   */
  static getActiveCues(cues: HabitCueEntity[]): CueContext[] {
    return cues
      .map((c) => CueScheduleRules.evaluateCue(c))
      .filter((c) => c.isActive);
  }
}
