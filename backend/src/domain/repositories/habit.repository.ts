import { HabitEntity } from '../entities/habit.entity';
import {
  HabitLifecycleStatus,
  Weekday,
} from '../enums/domain.enums';

/** Injection token for the habit repository port. */
export const HABIT_REPOSITORY = Symbol('IHabitRepository');

export interface CreateHabitData {
  userId: string;
  title: string;
  description?: string | null;
  precedingRoutine?: string | null;
  color?: string | null;
  iconType?: string | null;
  iconValue?: string | null;
  benefits?: string[];
  measurementUnit: string;
  targetValue: number;
  minimumTarget: number;
  startDate: Date;
  status: HabitLifecycleStatus;
  reminderEnabled: boolean;
  scheduleDays?: Array<{ weekday: Weekday }>;
  cues?: Array<{
    startTime?: string | null;
    endTime?: string | null;
    coarseLocation?: string | null;
    precedingRoutine?: string | null;
    isActive: boolean;
  }>;
  motivationProfile?: {
    goalTag?: string | null;
    reason?: string | null;
  } | null;
}

export interface UpdateHabitData {
  title?: string;
  description?: string | null;
  precedingRoutine?: string | null;
  color?: string | null;
  iconType?: string | null;
  iconValue?: string | null;
  benefits?: string[];
  measurementUnit?: string;
  targetValue?: number;
  minimumTarget?: number;
  startDate?: Date;
  status?: HabitLifecycleStatus;
  archivedAt?: Date | null;
  reminderEnabled?: boolean;
  /** When provided (even as empty array), replaces all schedule days. */
  scheduleDays?: Array<{ weekday: Weekday }>;
  /** When provided (even as empty array), replaces all cues. */
  cues?: Array<{
    startTime?: string | null;
    endTime?: string | null;
    coarseLocation?: string | null;
    precedingRoutine?: string | null;
    isActive: boolean;
  }>;
  /** When provided, upserts the motivation profile. */
  motivationProfile?: {
    goalTag?: string | null;
    reason?: string | null;
  } | null;
}

/**
 * Repository port (interface) for HabitEntity persistence.
 * Application services depend on this abstraction; infrastructure provides
 * the concrete Prisma implementation.
 */
export interface IHabitRepository {
  create(data: CreateHabitData): Promise<HabitEntity>;
  findAllByUserId(
    userId: string,
    includeArchived?: boolean,
  ): Promise<HabitEntity[]>;
  findActiveByUserId(userId: string): Promise<HabitEntity[]>;
  findByIdAndUserId(id: string, userId: string): Promise<HabitEntity | null>;
  update(id: string, data: UpdateHabitData): Promise<HabitEntity>;
}
