import { api } from './client';

export interface AppFeedbackEntry {
  id: string;
  message: string;
  createdAt: string;
}

export const appFeedbackApi = {
  submit: (userId: string, message: string) =>
    api.post<AppFeedbackEntry>(`/users/${userId}/feedback`, { message }),

  list: (userId: string) =>
    api.get<AppFeedbackEntry[]>(`/users/${userId}/feedback`),
};
