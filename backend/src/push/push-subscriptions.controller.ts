import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterPushSubscriptionDto } from './dto/register-push-subscription.dto';
import { PushSubscriptionsService } from './push-subscriptions.service';

@ApiTags('push-subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/push-subscriptions')
export class PushSubscriptionsController {
  constructor(
    private readonly pushSubscriptionsService: PushSubscriptionsService,
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
