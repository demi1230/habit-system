import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminPushController } from './admin-push.controller';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { WebPushNotificationGateway } from './web-push-notification.gateway';

@Module({
  imports: [AuthModule],
  controllers: [PushSubscriptionsController, AdminPushController],
  providers: [PushSubscriptionsService, WebPushNotificationGateway],
  exports: [PushSubscriptionsService, WebPushNotificationGateway],
})
export class PushModule {}
