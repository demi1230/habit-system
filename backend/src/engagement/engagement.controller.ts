import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EngagementService } from './engagement.service';

@ApiTags('engagement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get XP, badges, achievements, and push summary' })
  getSummary(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.engagementService.getSummary(userId);
  }
}
