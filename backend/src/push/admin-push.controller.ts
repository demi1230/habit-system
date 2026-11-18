import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { createHash, timingSafeEqual } from 'node:crypto';
import { BroadcastPushDto } from './dto/broadcast-push.dto';
import { WebPushNotificationGateway } from './web-push-notification.gateway';

/**
 * Compares secrets in constant time. Hashing first gives equal-length inputs,
 * so neither the content nor the length of ADMIN_SECRET leaks through timing.
 */
function secretsMatch(provided: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(provided), digest(expected));
}

@ApiTags('admin')
@Controller('admin/push')
export class AdminPushController {
  constructor(
    private readonly notificationGateway: WebPushNotificationGateway,
    private readonly configService: ConfigService,
  ) {}

  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Broadcast push notification to all subscribers',
    description:
      'Requires `secret` field matching the `ADMIN_SECRET` environment variable. Rate-limited to 5 requests per minute per IP.',
  })
  @ApiOkResponse({ schema: { example: { sent: 5, failed: 0 } } })
  async broadcast(@Body() dto: BroadcastPushDto) {
    const adminSecret = this.configService.get<string>('ADMIN_SECRET');
    if (!adminSecret || !secretsMatch(dto.secret, adminSecret)) {
      throw new ForbiddenException('Invalid admin secret.');
    }
    return this.notificationGateway.broadcast(dto.title, dto.body);
  }
}
