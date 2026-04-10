import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSrbaiAssessmentDto } from './dto/create-srbai-assessment.dto';
import { SrbaiService } from './srbai.service';

@ApiTags('srbai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/habits/:habitId')
export class SrbaiController {
  constructor(private readonly srbaiService: SrbaiService) {}

  /**
   * Submit a new SRBAI assessment (4-item, 1–7 Likert).
   * rawAverage and normalizedScore100 are computed server-side.
   */
  @Post('srbai-assessments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit an SRBAI automaticity assessment for a habit',
    description:
      'Accepts 4 Likert items (1–7). Returns the stored record with server-computed ' +
      'rawAverage and normalizedScore100 = ((rawAverage - 1) / 6) * 100.',
  })
  @ApiCreatedResponse({ description: 'Assessment saved and scored.' })
  @ApiNotFoundResponse({ description: 'Habit or user not found.' })
  submitAssessment(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Body() dto: CreateSrbaiAssessmentDto,
  ) {
    return this.srbaiService.submitAssessment(userId, habitId, dto);
  }

  /**
   * Get the most recent SRBAI assessment for a habit.
   */
  @Get('srbai-assessments/latest')
  @ApiOperation({ summary: 'Get the latest SRBAI assessment for a habit' })
  @ApiOkResponse({ description: 'Latest SRBAI record, or null.' })
  getLatestAssessment(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.srbaiService.getLatestAssessment(userId, habitId);
  }

  /**
   * Get all SRBAI assessments for a habit (descending by assessedAt).
   */
  @Get('srbai-assessments')
  @ApiOperation({ summary: 'List all SRBAI assessments for a habit' })
  @ApiOkResponse({ description: 'Array of SRBAI records.' })
  listAssessments(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.srbaiService.listAssessments(userId, habitId);
  }

  /**
   * Get the final composite habit-strength score.
   * Requires at least one SRBAI submission; uses 0 for srbaiScore otherwise.
   */
  @Get('habit-strength/composite')
  @ApiOperation({
    summary: 'Get the final composite habit-strength score',
    description:
      'finalScore = 0.60 * srbaiScore + 0.25 * consistencyScore + 0.15 * contextStabilityScore. ' +
      'Stages: 0–39 weak, 40–69 building, 70–100 strong.',
  })
  @ApiOkResponse({ description: 'Composite score with stage label.' })
  getCompositeScore(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.srbaiService.getCompositeScore(userId, habitId);
  }

  /**
   * Compute a tapering policy recommendation based on the current
   * composite score, persist it, and return both.
   */
  @Post('reminder-policy/apply-tapering')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Compute + persist a reminder tapering policy from the current habit-strength stage',
    description:
      'Derives FULL_SUPPORT / MODERATE_SUPPORT / FADE_OUT / MINIMAL deterministically. ' +
      'Upserts the ReminderPolicy record and returns composite + recommendation + policy.',
  })
  @ApiCreatedResponse({ description: 'Tapering policy applied.' })
  applyTaperingPolicy(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.srbaiService.computeAndApplyTaperingPolicy(userId, habitId);
  }

  /**
   * Get the current reminder policy for a habit (if any).
   */
  @Get('reminder-policy')
  @ApiOperation({
    summary: 'Get the current reminder tapering policy for a habit',
  })
  @ApiOkResponse({ description: 'ReminderPolicy record or null.' })
  getReminderPolicy(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.srbaiService.getReminderPolicy(userId, habitId);
  }
}
