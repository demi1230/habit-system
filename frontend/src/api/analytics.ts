import { api } from './client';

export interface UserActivityLog {
  id: string;
  userId: string;
  activityType: string;
  occurredAt: string;
  createdAt: string;
}

export const analyticsApi = {
  log: (userId: string, activityType: string, occurredAt?: string) =>
    api.post<UserActivityLog>(`/users/${userId}/activity-logs`, {
      activityType,
      ...(occurredAt ? { occurredAt } : {}),
    }),

  list: (userId: string) =>
    api.get<UserActivityLog[]>(`/users/${userId}/activity-logs`),
};
