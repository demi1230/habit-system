import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHabitDto } from './dto/create-habit.dto';
import { HabitQueryDto } from './dto/habit-query.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitsService } from './habits.service';

@ApiTags('habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/:userId/habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  createHabit(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() createHabitDto: CreateHabitDto,
  ) {
    return this.habitsService.createHabit(userId, createHabitDto);
  }

  @Get()
  listHabits(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query() habitQueryDto: HabitQueryDto,
  ) {
    return this.habitsService.listHabits(userId, habitQueryDto);
  }

  /**
   * Phase 3: returns only ACTIVE habits scheduled for today's weekday.
   * Habits with no scheduleDays are included every day.
   * Each habit includes a cueContext array with evaluation results.
   * Must be declared before GET :habitId to avoid route shadowing.
   */
  @Get('today')
  @ApiOperation({
    summary: 'Get habits scheduled for today with cue context',
  })
  getTodayHabits(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.habitsService.getTodayHabits(userId);
  }

  @Get(':habitId')
  getHabitById(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.habitsService.getOwnedHabitOrThrow(userId, habitId);
  }

  @Patch(':habitId')
  updateHabit(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ) {
    return this.habitsService.updateHabit(userId, habitId, updateHabitDto);
  }

  /**
   * Phase 3: stateless reminder decision for a habit.
   * Evaluates reminderEnabled + schedule + active cues — no notification delivery.
   */
  @Get(':habitId/reminder-decision')
  @ApiOperation({
    summary:
      'Get reminder decision for a habit (stateless, no delivery triggered)',
  })
  getReminderDecision(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('habitId', new ParseUUIDPipe()) habitId: string,
  ) {
    return this.habitsService.getReminderDecision(userId, habitId);
  }
}
