import { api } from './client';

export type ReminderStatus = 'PENDING' | 'DONE' | 'SNOOZED' | 'CANCELLED' | 'EXPIRED';

export interface Reminder {
  id: string;
  userId: string;
  habitId: string;
  scheduledFor: string;
  deliveredAt: string | null;
  status: ReminderStatus;
  triggerReason: string | null;
  createdAt: string;
}

export const remindersApi = {
  list: (userId: string) =>
    api.get<Reminder[]>(`/users/${userId}/reminders`),

  submitAction: (
    userId: string,
    reminderId: string,
    action: 'DONE' | 'SNOOZE',
    snoozedUntil?: string,
  ) =>
    api.post(`/users/${userId}/reminders/${reminderId}/actions`, {
      action,
      ...(snoozedUntil ? { snoozedUntil } : {}),
    }),
};
