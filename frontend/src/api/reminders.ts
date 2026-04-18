import { api } from './client';

export type ReminderStatus = 'PENDING' | 'SENT' | 'ACTED' | 'EXPIRED' | 'CANCELLED';

export interface Reminder {
  id: string;
  userId: string;
  habitId: string;
  linkedCueId: string | null;
  decisionReason: string;
  status: ReminderStatus;
  scheduledFor: string;
  evaluatedAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  effectiveUntil: string | null;
  explanation: unknown;
  createdAt: string;
}

export const remindersApi = {
  list: (userId: string) =>
    api.get<Reminder[]>(`/users/${userId}/reminders`),

  submitAction: (
    userId: string,
    reminderId: string,
    actionType: 'DONE' | 'SNOOZE',
    snoozeMinutes?: number,
  ) =>
    api.post(`/users/${userId}/reminders/${reminderId}/actions`, {
      actionType,
      ...(snoozeMinutes ? { snoozeMinutes } : {}),
    }),
};
