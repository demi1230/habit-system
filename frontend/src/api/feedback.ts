import { api } from './client';
import type { DifficultyRating } from './types';

export interface DifficultyFeedback {
  id: string;
  logId: string;
  rating: DifficultyRating;
  note: string | null;
  occurredAt: string;
}

export interface ReflectionResponse {
  id: string;
  logId: string;
  text: string;
  occurredAt: string;
}

export const feedbackApi = {
  submitDifficulty: (
    userId: string,
    habitId: string,
    logId: string,
    rating: DifficultyRating,
    note?: string,
  ) =>
    api.post<DifficultyFeedback>(
      `/users/${userId}/habits/${habitId}/logs/${logId}/difficulty`,
      { rating, ...(note ? { note } : {}) },
    ),

  listDifficultyRatings: (userId: string, habitId: string) =>
    api.get<DifficultyFeedback[]>(
      `/users/${userId}/habits/${habitId}/difficulty-ratings`,
    ),

  listReflections: (userId: string, habitId: string) =>
    api.get<ReflectionResponse[]>(
      `/users/${userId}/habits/${habitId}/reflections`,
    ),

  submitReflection: (
    userId: string,
    habitId: string,
    logId: string,
    text: string,
  ) =>
    api.post<ReflectionResponse>(
      `/users/${userId}/habits/${habitId}/logs/${logId}/reflection`,
      { text },
    ),
};
