import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';
import {
  INotificationGateway,
  NotificationPayload,
  NotificationDeliveryResult,
} from '../reminders/notification/notification.gateway.interface';
import { PushSubscriptionsService } from './push-subscriptions.service';

@Injectable()
export class WebPushNotificationGateway implements INotificationGateway {
  private readonly logger = new Logger(WebPushNotificationGateway.name);
  private readonly vapidReady: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly pushSubscriptionsService: PushSubscriptionsService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.configService.get<string>('VAPID_SUBJECT') ??
      `mailto:${this.configService.get<string>('SUPPORT_EMAIL') ?? 'support@example.com'}`;

    this.vapidReady = Boolean(publicKey && privateKey);

    if (this.vapidReady) {
      webPush.setVapidDetails(subject, publicKey!, privateKey!);
    }
  }

  async send(
    payload: NotificationPayload,
  ): Promise<NotificationDeliveryResult> {
    const subscriptions = await this.pushSubscriptionsService.listByUserId(
      payload.userId,
    );

    if (!this.vapidReady) {
      this.logger.warn(
        `Skipping push delivery for reminder ${payload.reminderId}: VAPID keys are missing.`,
      );
      return {
        delivered: false,
        deliveredAt: null,
        providerResponse: 'web-push-disabled',
      };
    }

    if (subscriptions.length === 0) {
      return {
        delivered: false,
        deliveredAt: null,
        providerResponse: 'no-subscriptions',
      };
    }

    const message = JSON.stringify({
      title: payload.title,
      body: payload.body,
      reminderId: payload.reminderId,
      habitId: payload.habitId,
      url: `/reminders?reminderId=${payload.reminderId}`,
      scheduledFor: payload.scheduledFor.toISOString(),
    });

    let deliveredCount = 0;

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          message,
        );
        deliveredCount += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await this.pushSubscriptionsService.deleteByEndpoint(
            subscription.endpoint,
          );
        }
        this.logger.warn(
          `Push send failed for subscription ${subscription.id}: ${String(error)}`,
        );
      }
    }

    return {
      delivered: deliveredCount > 0,
      deliveredAt: deliveredCount > 0 ? new Date() : null,
      providerResponse: `web-push:${deliveredCount}/${subscriptions.length}`,
    };
  }
}
