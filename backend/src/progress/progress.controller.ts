import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { UpdateHabitLogDto } from './dto/update-habit-log.dto';
import { SubmitDifficultyDto } from './dto/submit-difficulty.dto';
import { SubmitReflectionDto } from './dto/submit-reflection.dto';
import { ProgressService } from './progress.service';
import { FeedbackService } from './feedback.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/habits/:habitId')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly feedbackService: FeedbackService,
  ) {}

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

  @Patch('logs/:logId')
  @ApiOperation({ summary: 'Update a habit log (edit actual value)' })
  updateHabitLog(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Param('logId', new ParseUUIDPipe()) logId: string,
    @Body() dto: UpdateHabitLogDto,
  ) {
    return this.progressService.updateHabitLog(userId, habitId, logId, dto);
  }

  @Delete('logs/:logId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a habit log (undo)' })
  deleteHabitLog(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Param('logId', new ParseUUIDPipe()) logId: string,
  ) {
    return this.progressService.deleteHabitLog(userId, habitId, logId);
  }

  @Get('progress-summary')
  getProgressSummary(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.progressService.getProgressSummary(userId, habitId);
  }

  /**
   * Phase 3: habit-strength foundation.
   * Returns raw input signals derived from log history — no final score.
   */
  @Get('habit-strength')
  @ApiOperation({
    summary:
      'Get habit-strength input signals (foundation — no final score yet)',
  })
  getHabitStrengthSignals(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.progressService.getHabitStrengthSignals(userId, habitId);
  }

  // ── Phase 4C: Difficulty feedback ─────────────────────────────────────────

  @Post('logs/:logId/difficulty')
  @ApiOperation({ summary: 'Submit a difficulty rating after a habit completion' })
  submitDifficulty(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Param('logId', new ParseUUIDPipe()) logId: string,
    @Body() dto: SubmitDifficultyDto,
  ) {
    return this.feedbackService.submitDifficulty(userId, habitId, logId, dto);
  }

  @Get('difficulty-ratings')
  @ApiOperation({ summary: 'List all difficulty ratings for a habit' })
  listDifficultyRatings(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.feedbackService.listDifficultyRatings(userId, habitId);
  }

  // ── Phase 4C: Reflection ───────────────────────────────────────────────────

  @Post('logs/:logId/reflection')
  @ApiOperation({ summary: 'Submit a post-completion reflection' })
  submitReflection(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Param('logId', new ParseUUIDPipe()) logId: string,
    @Body() dto: SubmitReflectionDto,
  ) {
    return this.feedbackService.submitReflection(userId, habitId, logId, dto);
  }

  // ── Phase 4C: Adaptation recommendation ───────────────────────────────────

  @Get('adaptation-recommendation')
  @ApiOperation({
    summary: 'Get an adaptation recommendation computed fully server-side',
  })
  getAdaptationRecommendation(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.feedbackService.getAdaptationRecommendation(userId, habitId);
  }
}
