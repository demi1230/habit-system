import { api } from './client';
import type {
  Habit,
  HabitWithCueContext,
  HabitLog,
  CompletionTriggerSource,
  ProgressSummary,
  HabitStrengthSignals,
  Weekday,
} from './types';

export interface CreateHabitLogPayload {
  actualValue: number;
  completedAt: string;
  loggedAt?: string;
  triggerSource?: CompletionTriggerSource;
}

export interface CreateHabitPayload {
  title: string;
  description?: string;
  precedingRoutine?: string;
  reason?: string;
  color?: string;
  iconType?: string;
  iconValue?: string;
  benefits?: string[];
  measurementUnit: string;
  targetValue: number;
  minimumTarget: number;
  startDate: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  reminderEnabled?: boolean;
  scheduleDays?: Array<{ weekday: Weekday }>;
  cues?: Array<{
    startTime?: string;
    endTime?: string;
    coarseLocation?: string;
    precedingRoutine?: string;
    isActive: boolean;
  }>;
  motivationProfile?: {
    goalTag?: string;
    reason?: string;
  };
  reminder?: {
    enabled?: boolean;
    timeWindows?: Array<{ startTime: string; endTime: string }>;
    locations?: string[];
  };
}

export interface AdaptationRecommendation {
  focus: 'reduce_reminders' | 'maintain' | 'increase_support' | 'review_difficulty' | 'celebrate_consistency';
  summary: string;
  suggestedPolicyMode: string | null;
  milestoneReached: boolean;
  evaluatedAt: string;
}

export const habitsApi = {
  listToday: (userId: string) =>
    api.get<HabitWithCueContext[]>(`/users/${userId}/habits/today`),

  list: (userId: string, includeArchived?: boolean) =>
    api.get<Habit[]>(
      `/users/${userId}/habits${includeArchived ? '?includeArchived=true' : ''}`,
    ),

  getHabit: (userId: string, habitId: string) =>
    api.get<Habit>(`/users/${userId}/habits/${habitId}`),

  createHabit: (userId: string, data: CreateHabitPayload) =>
    api.post<Habit>(`/users/${userId}/habits`, data),

  updateHabit: (userId: string, habitId: string, data: Partial<CreateHabitPayload>) =>
    api.patch<Habit>(`/users/${userId}/habits/${habitId}`, data),

  createLog: (userId: string, habitId: string, data: CreateHabitLogPayload) =>
    api.post<HabitLog>(`/users/${userId}/habits/${habitId}/logs`, data),

  listLogs: (userId: string, habitId: string) =>
    api.get<HabitLog[]>(`/users/${userId}/habits/${habitId}/logs`),

  getProgressSummary: (userId: string, habitId: string) =>
    api.get<ProgressSummary>(`/users/${userId}/habits/${habitId}/progress-summary`),

  getStrengthSignals: (userId: string, habitId: string) =>
    api.get<HabitStrengthSignals>(`/users/${userId}/habits/${habitId}/habit-strength`),

  getAdaptationRecommendation: (userId: string, habitId: string) =>
    api.get<AdaptationRecommendation>(`/users/${userId}/habits/${habitId}/adaptation-recommendation`),
};
