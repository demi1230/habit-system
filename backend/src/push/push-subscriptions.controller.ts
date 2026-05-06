import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterPushSubscriptionDto } from './dto/register-push-subscription.dto';
import { BroadcastPushDto } from './dto/broadcast-push.dto';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { WebPushNotificationGateway } from './web-push-notification.gateway';

@ApiTags('push-subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/push-subscriptions')
export class PushSubscriptionsController {
  constructor(
    private readonly pushSubscriptionsService: PushSubscriptionsService,
    private readonly notificationGateway: WebPushNotificationGateway,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List push subscriptions for a user' })
  list(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.pushSubscriptionsService.listByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Register or update a web push subscription' })
  register(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: RegisterPushSubscriptionDto,
  ) {
    return this.pushSubscriptionsService.register(userId, dto);
  }

  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Broadcast a push notification to all subscribers (admin only)' })
  async broadcast(@Body() dto: BroadcastPushDto) {
    const adminSecret = this.configService.get<string>('ADMIN_SECRET');
    if (!adminSecret || dto.secret !== adminSecret) {
      throw new ForbiddenException('Invalid admin secret.');
    }
    return this.notificationGateway.broadcast(dto.title, dto.body);
  }

  @Delete(':subscriptionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a push subscription' })
  remove(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('subscriptionId', new ParseUUIDPipe()) subscriptionId: string,
  ) {
    return this.pushSubscriptionsService.delete(userId, subscriptionId);
  }
}
