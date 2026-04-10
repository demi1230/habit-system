/**
 * Notification gateway port.
 * Abstracts the delivery channel so we can swap in real push providers later.
 * Thesis mapping: "Мэдэгдэл илгээх гарц · Notification delivery gateway"
 */
export interface NotificationPayload {
  userId: string;
  habitId: string;
  reminderId: string;
  title: string;
  body: string;
  scheduledFor: Date;
}

export interface NotificationDeliveryResult {
  delivered: boolean;
  deliveredAt: Date | null;
  providerResponse: string;
}

export const NOTIFICATION_GATEWAY = Symbol('INotificationGateway');

export interface INotificationGateway {
  send(payload: NotificationPayload): Promise<NotificationDeliveryResult>;
}
