import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BroadcastPushDto } from './dto/broadcast-push.dto';
import { WebPushNotificationGateway } from './web-push-notification.gateway';

@ApiTags('admin')
@Controller('admin/push')
export class AdminPushController {
  constructor(
    private readonly notificationGateway: WebPushNotificationGateway,
    private readonly configService: ConfigService,
  ) {}

  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Broadcast push notification to all subscribers',
    description: 'Requires `secret` field matching the `ADMIN_SECRET` environment variable.',
  })
  @ApiOkResponse({ schema: { example: { sent: 5, failed: 0 } } })
  async broadcast(@Body() dto: BroadcastPushDto) {
    const adminSecret = this.configService.get<string>('ADMIN_SECRET');
    if (!adminSecret || dto.secret !== adminSecret) {
      throw new ForbiddenException('Invalid admin secret.');
    }
    return this.notificationGateway.broadcast(dto.title, dto.body);
  }
}
