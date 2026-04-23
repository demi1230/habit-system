import { api } from './client';
import type { EngagementSummary } from './types';

export const engagementApi = {
  getSummary: (userId: string) =>
    api.get<EngagementSummary>(`/users/${userId}/engagement/summary`),
};
