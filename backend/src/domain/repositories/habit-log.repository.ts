import { HabitLogEntity } from '../entities/habit-log.entity';
import { HabitLogStatus, CompletionTriggerSource } from '../enums/domain.enums';

/** Injection token for the habit-log repository port. */
export const HABIT_LOG_REPOSITORY = Symbol('IHabitLogRepository');

export interface CreateHabitLogData {
  habitId: string;
  status: HabitLogStatus;
  actualValue?: number | null;
  completedAt: Date;
  loggedAt: Date;
  triggerSource?: CompletionTriggerSource;
  /** Phase 4A: link to the Reminder that triggered this log entry. */
  linkedReminderId?: string | null;
  /** Phase 4A: confidence of the source classification (0–1). */
  sourceConfidence?: number | null;
  /** Context snapshot — captured at completion time for context-stability scoring. */
  completionHour?: number | null;
  coarseLocation?: string | null;
  precedingRoutine?: string | null;
}

export interface UpdateHabitLogData {
  status: HabitLogStatus;
  actualValue: number;
}

/**
 * Repository port (interface) for HabitLogEntity persistence.
 */
export interface IHabitLogRepository {
  create(data: CreateHabitLogData): Promise<HabitLogEntity>;
  findById(id: string): Promise<HabitLogEntity | null>;
  update(id: string, data: UpdateHabitLogData): Promise<HabitLogEntity>;
  delete(id: string): Promise<void>;
  findAllByHabitId(habitId: string): Promise<HabitLogEntity[]>;
  /**
   * Returns the latest log on a specific calendar day for each habit id.
   * Used by dashboard/today views to avoid one HTTP + DB call per habit.
   */
  findLatestByHabitIdsForDate(
    habitIds: string[],
    date: Date,
  ): Promise<
    Array<
      Pick<
        HabitLogEntity,
        'id' | 'habitId' | 'status' | 'actualValue' | 'completedAt' | 'loggedAt'
      >
    >
  >;
  /** Lightweight projection used by habit-strength and progress-summary reads. */
  findSummaryByHabitId(
    habitId: string,
  ): Promise<
    Array<
      Pick<
        HabitLogEntity,
        'status' | 'triggerSource' | 'loggedAt' | 'completedAt'
      >
    >
  >;
  /**
   * Returns the context fields for the last N DONE logs.
   * Used by context-stability scoring.
   */
  findContextSnapshotsByHabitId(
    habitId: string,
    limit: number,
  ): Promise<
    Array<
      Pick<
        HabitLogEntity,
        'completionHour' | 'coarseLocation' | 'precedingRoutine'
      >
    >
  >;
  /** Phase 4A: check whether a completion log already exists for a given reminder. */
  findByLinkedReminderId(reminderId: string): Promise<HabitLogEntity | null>;
}
