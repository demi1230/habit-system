import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserActivityLogDto } from './dto/create-user-activity-log.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/activity-logs')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  createUserActivityLog(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() createUserActivityLogDto: CreateUserActivityLogDto,
  ) {
    return this.analyticsService.createUserActivityLog(
      userId,
      createUserActivityLogDto,
    );
  }

  @Get()
  listUserActivityLogs(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.analyticsService.listUserActivityLogs(userId);
  }
}
