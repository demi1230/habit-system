/**
 * Domain entity — HabitCue
 * Represents a contextual trigger (location, time window, preceding routine)
 * that signals the moment to perform a habit.
 */
export interface HabitCueEntity {
  id: string;
  habitId: string;
  startTime: string | null;
  endTime: string | null;
  coarseLocation: string | null;
  locationLat: number | null;
  locationLng: number | null;
  precedingRoutine: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
