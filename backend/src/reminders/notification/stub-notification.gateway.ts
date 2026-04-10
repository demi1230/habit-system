import { Injectable, Logger } from '@nestjs/common';
import {
  INotificationGateway,
  NotificationDeliveryResult,
  NotificationPayload,
} from './notification.gateway.interface';

/**
 * Stub implementation of INotificationGateway.
 * Logs to console; no real push is sent.
 * Replace with a real provider (FCM, APNs, etc.) when ready.
 */
@Injectable()
export class StubNotificationGateway implements INotificationGateway {
  private readonly logger = new Logger(StubNotificationGateway.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async send(
    payload: NotificationPayload,
  ): Promise<NotificationDeliveryResult> {
    this.logger.log(
      `[STUB] Reminder notification → userId=${payload.userId} ` +
        `habitId=${payload.habitId} reminderId=${payload.reminderId} ` +
        `title="${payload.title}" scheduledFor=${payload.scheduledFor.toISOString()}`,
    );

    return {
      delivered: true,
      deliveredAt: new Date(),
      providerResponse: 'stub:ok',
    };
  }
}
