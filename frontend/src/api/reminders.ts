import { api } from './client';

export type ReminderStatus = 'PENDING' | 'SENT' | 'ACTED' | 'EXPIRED' | 'CANCELLED';

export interface ReminderExplanation {
  isScheduledToday: boolean;
  activeCueCount: number;
  body?: string;
  contentParts?: {
    cue: string | null;
    habit: string;
    reason: string | null;
    benefits: string[];
  };
}

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
  explanation: ReminderExplanation | null;
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
