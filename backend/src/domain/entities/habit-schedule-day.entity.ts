import { Weekday } from '../enums/domain.enums';

/**
 * Domain entity — HabitScheduleDay
 * One entry per weekday on which the habit is scheduled.
 */
export interface HabitScheduleDayEntity {
  id: string;
  habitId: string;
  weekday: Weekday;
}
