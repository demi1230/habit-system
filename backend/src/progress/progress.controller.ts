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
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/habits/:habitId')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('logs')
  createHabitLog(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Body() createHabitLogDto: CreateHabitLogDto,
  ) {
    return this.progressService.createHabitLog(
      userId,
      habitId,
      createHabitLogDto,
    );
  }

  @Get('logs')
  listHabitLogs(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.progressService.listHabitLogs(userId, habitId);
  }

  @Get('progress-summary')
  getProgressSummary(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.progressService.getProgressSummary(userId, habitId);
  }
}
