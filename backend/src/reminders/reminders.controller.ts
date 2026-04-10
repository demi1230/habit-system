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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReminderActionDto } from './dto/create-reminder-action.dto';
import { EvaluateAndCreateReminderDto } from './dto/evaluate-and-create-reminder.dto';
import { ReminderExecutionService } from './reminder-execution.service';
import { RemindersService } from './reminders.service';

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId')
export class RemindersController {
  constructor(
    private readonly executionService: ReminderExecutionService,
    private readonly remindersService: RemindersService,
  ) {}

  /**
   * Evaluate reminder decision for a habit + persist and send if shouldRemind=true.
   */
  @Post('habits/:habitId/reminders/evaluate-and-create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Evaluate reminder decision and persist reminder if applicable',
    description:
      'Runs the stateless reminder decision rules for the habit. ' +
      'If shouldRemind=true, creates a Reminder record and fires the notification stub. ' +
      'Returns the decision reason even when no reminder is persisted.',
  })
  @ApiCreatedResponse({
    description: 'Decision evaluated; reminder persisted if shouldRemind=true.',
  })
  @ApiConflictResponse({
    description: 'An active reminder already exists in the dedup window.',
  })
  @ApiNotFoundResponse({ description: 'Habit or user not found.' })
  evaluateAndCreate(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Body() dto: EvaluateAndCreateReminderDto,
  ) {
    return this.executionService.evaluateAndCreate(userId, habitId, dto);
  }

  /**
   * List all reminders for a user.
   */
  @Get('reminders')
  @ApiOperation({ summary: 'List all reminders for a user' })
  @ApiOkResponse({
    description: 'Array of reminders in descending scheduledFor order.',
  })
  listReminders(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.remindersService.listReminders(userId);
  }

  /**
   * Get a single reminder by ID.
   */
  @Get('reminders/:reminderId')
  @ApiOperation({ summary: 'Get a single reminder' })
  @ApiOkResponse({ description: 'Reminder record.' })
  @ApiNotFoundResponse({ description: 'Reminder not found for this user.' })
  getReminder(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('reminderId', new ParseUUIDPipe()) reminderId: string,
  ) {
    return this.remindersService.getReminder(userId, reminderId);
  }

  /**
   * Submit a DONE or SNOOZE action on a reminder.
   * DONE auto-creates a HabitLog (REMINDER_TRIGGERED).
   * SNOOZE creates a follow-up scheduled reminder.
   */
  @Post('reminders/:reminderId/actions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a DONE or SNOOZE action on a reminder',
    description:
      'DONE: marks the reminder acted, auto-creates a HabitLog with REMINDER_TRIGGERED source. ' +
      'SNOOZE: records the snooze, creates a follow-up Reminder at snoozedUntil.',
  })
  @ApiCreatedResponse({ description: 'Action recorded.' })
  @ApiConflictResponse({
    description:
      'Reminder already acted/expired/cancelled, or DONE already exists.',
  })
  @ApiNotFoundResponse({ description: 'Reminder not found for this user.' })
  submitAction(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('reminderId', new ParseUUIDPipe()) reminderId: string,
    @Body() dto: CreateReminderActionDto,
  ) {
    return this.remindersService.submitAction(userId, reminderId, dto);
  }
}
