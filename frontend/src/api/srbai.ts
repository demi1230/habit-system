import { api } from './client';

export interface SrbaiAssessment {
  id: string;
  habitId: string;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  rawAverage: number;
  normalizedScore100: number;
  assessedAt: string;
}

export interface SrbaiCompositeScore {
  srbaiScore: number;
  consistencyScore: number;
  contextStabilityScore: number;
  selfInitiatedRate: number;
  finalScore: number;
  stage: 'weak' | 'building' | 'strong';
  evaluatedAt: string;
}

export const srbaiApi = {
  submit: (
    userId: string,
    habitId: string,
    items: { item1: number; item2: number; item3: number; item4: number },
  ) =>
    api.post<SrbaiAssessment>(
      `/users/${userId}/habits/${habitId}/srbai-assessments`,
      items,
    ),

  getLatest: (userId: string, habitId: string) =>
    api.get<SrbaiAssessment | null>(
      `/users/${userId}/habits/${habitId}/srbai-assessments/latest`,
    ),

  getCompositeScore: (userId: string, habitId: string) =>
    api.get<SrbaiCompositeScore>(
      `/users/${userId}/habits/${habitId}/habit-strength/composite`,
    ),
};
