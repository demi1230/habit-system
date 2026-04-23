import { api } from './client';
import type { PushSubscriptionRecord } from './types';

export const pushApi = {
  list: (userId: string) =>
    api.get<PushSubscriptionRecord[]>(`/users/${userId}/push-subscriptions`),

  register: (
    userId: string,
    subscription: PushSubscription,
    userAgent?: string,
  ) =>
    api.post<PushSubscriptionRecord>(`/users/${userId}/push-subscriptions`, {
      endpoint: subscription.endpoint,
      p256dh: btoa(
        String.fromCharCode(
          ...new Uint8Array(subscription.getKey('p256dh') ?? new ArrayBuffer(0)),
        ),
      ),
      auth: btoa(
        String.fromCharCode(
          ...new Uint8Array(subscription.getKey('auth') ?? new ArrayBuffer(0)),
        ),
      ),
      userAgent,
    }),

  remove: (userId: string, subscriptionId: string) =>
    api.del<void>(`/users/${userId}/push-subscriptions/${subscriptionId}`),
};
