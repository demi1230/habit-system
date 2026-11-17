import { Weekday } from '../enums/domain.enums';
import { HabitCueEntity } from '../entities/habit-cue.entity';
import { appDateOf, weekdayIndexOfYmd } from '../../shared/time';

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
  locationLat: number | null;
  locationLng: number | null;
  precedingRoutine: string | null;
}

/**
 * Domain rules — Cue · Schedule
 * Pure static methods with no I/O dependencies.  Thesis mapping:
 * "Өдөөгч нөхцөл · Cue schedule rules" from the Domain layer.
 */
export class CueScheduleRules {
  /** Weekday of "today" in the application timezone at instant `now`. */
  static todayWeekday(now: Date = new Date()): Weekday {
    return CueScheduleRules.weekdayOf(appDateOf(now));
  }

  /**
   * Weekday of a calendar date (`YYYY-MM-DD`), or of the application-timezone
   * day containing an instant. Never uses the host's local timezone.
   */
  static weekdayOf(date: Date | string): Weekday {
    const ymd = typeof date === 'string' ? date : appDateOf(date);
    return JS_DAY_TO_WEEKDAY[weekdayIndexOfYmd(ymd)];
  }

  /** A habit with an empty schedule is treated as a daily habit. */
  static isScheduledToday(
    scheduleDays: Array<{ weekday: Weekday }>,
    now: Date = new Date(),
  ): boolean {
    if (scheduleDays.length === 0) return true;
    const today = CueScheduleRules.todayWeekday(now);
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
      | 'locationLat'
      | 'locationLng'
      | 'precedingRoutine'
    >,
  ): CueContext {
    return {
      isActive: cue.isActive,
      startTime: cue.startTime ?? null,
      endTime: cue.endTime ?? null,
      coarseLocation: cue.coarseLocation ?? null,
      locationLat: cue.locationLat ?? null,
      locationLng: cue.locationLng ?? null,
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
