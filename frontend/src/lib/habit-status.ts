/**
 * How a habit's logged value is shown — kept in one place so every screen
 * agrees with the backend.
 *
 * Backend rule (backend/src/progress/progress.service.ts): a log is DONE when
 * `actualValue >= minimumTarget`, otherwise NOT_DONE. The full `targetValue`
 * is the aspiration; reaching the minimum already counts as done, which keeps
 * the "small, achievable action" meaning of the minimum target.
 */
import type { HabitLogStatus } from '@/api/types';

/** Fields shared by Habit, HabitWithCueContext and dashboard card habits. */
export interface MeasuredHabit {
  targetValue: number;
  minimumTarget?: number | null;
  measurementUnit?: string | null;
}

export type LogDisplayStatus = 'none' | 'partial' | 'done';

const BINARY_UNITS = ['удаа', 'times', 'boolean'];

/** A yes/no habit: one "time" is the whole target. */
export function isBinaryHabit(habit: MeasuredHabit): boolean {
  return (
    habit.targetValue === 1 &&
    BINARY_UNITS.includes(habit.measurementUnit ?? '')
  );
}

/** Fill of a progress ring or bar (0–100), relative to the full target. */
export function progressPercent(habit: MeasuredHabit, value: number): number {
  if (isBinaryHabit(habit)) return value > 0 ? 100 : 0;
  return Math.min((value / (habit.targetValue || 1)) * 100, 100);
}

/** Display status of a value, using the same rule as the backend. */
export function logStatusFor(
  habit: MeasuredHabit,
  value: number,
): LogDisplayStatus {
  if (value <= 0) return 'none';
  if (isBinaryHabit(habit)) return 'done';
  const minimum = habit.minimumTarget ?? habit.targetValue ?? 1;
  return value >= minimum ? 'done' : 'partial';
}

/** True when the value also reaches the full (aspirational) target. */
export function reachesFullTarget(habit: MeasuredHabit, value: number): boolean {
  return value >= (habit.targetValue || 1);
}

/** Display status of a log as saved by the server (the source of truth). */
export function statusFromServerLog(log: {
  status: HabitLogStatus;
  actualValue: number | null;
}): LogDisplayStatus {
  if (log.status === 'DONE') return 'done';
  return (log.actualValue ?? 0) > 0 ? 'partial' : 'none';
}
