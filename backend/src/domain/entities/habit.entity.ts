import {
  HabitLifecycleStatus,
  Weekday,
} from '../enums/domain.enums';
import { HabitCueEntity } from './habit-cue.entity';
import { HabitScheduleDayEntity } from './habit-schedule-day.entity';
import { MotivationProfileEntity } from './motivation-profile.entity';

/**
 * Domain entity — HabitEntity
 * Root aggregate for the Habit bounded context.  Encapsulates scheduling
 * and cue-configuration domain methods used by application services and
 * domain rules.
 */
export class HabitEntity {
  id!: string;
  userId!: string;
  title!: string;
  description!: string | null;
  measurementUnit!: string;
  targetValue!: number;
  minimumTarget!: number;
  startDate!: Date;
  status!: HabitLifecycleStatus;
  reminderEnabled!: boolean;
  archivedAt!: Date | null;
  scheduleDays!: HabitScheduleDayEntity[];
  cues!: HabitCueEntity[];
  motivationProfile!: MotivationProfileEntity | null;
  createdAt!: Date;
  updatedAt!: Date;

  /** Returns true when this habit is scheduled for the given weekday,
   *  or when no schedule days are set (treated as a daily habit). */
  isScheduledOn(weekday: Weekday): boolean {
    if (this.scheduleDays.length === 0) return true;
    return this.scheduleDays.some((d) => d.weekday === weekday);
  }

  /** Returns true when at least one cue is marked active. */
  hasActiveCues(): boolean {
    return this.cues.some((c) => c.isActive);
  }
}
