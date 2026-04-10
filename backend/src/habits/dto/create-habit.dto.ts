import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  HabitLifecycleStatus,
  HabitTrackingType,
} from '../../domain/enums/domain.enums';
import { CreateHabitCueDto } from '../cues/dto/create-habit-cue.dto';
import { CreateHabitMotivationProfileDto } from '../motivation/dto/create-habit-motivation-profile.dto';
import { CreateHabitScheduleDayDto } from '../schedule/dto/create-habit-schedule-day.dto';

export class CreateHabitDto {
  @ApiProperty({ example: 'Morning Run', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({
    example: '30 minute jog before breakfast',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: HabitTrackingType,
    example: HabitTrackingType.SIMPLE_CHECKIN,
  })
  @IsEnum(HabitTrackingType)
  trackingType!: HabitTrackingType;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allowPartialCompletion?: boolean;

  @ApiPropertyOptional({
    maxLength: 40,
    description: 'QUANTITATIVE only — e.g. "km", "pages", "glasses"',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  measurementUnit?: string;

  @ApiPropertyOptional({
    description: 'QUANTITATIVE only — target value to reach for DONE status',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetValue?: number;

  @ApiPropertyOptional({
    description:
      'QUANTITATIVE only — minimum value for PARTIAL status. Must be <= targetValue',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minimumSuccessValue?: number;

  @ApiProperty({ example: '2026-03-24', description: 'ISO 8601 date string' })
  @IsISO8601()
  startDate!: string;

  @ApiPropertyOptional({
    enum: HabitLifecycleStatus,
    example: HabitLifecycleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(HabitLifecycleStatus)
  status?: HabitLifecycleStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({
    type: [CreateHabitScheduleDayDto],
    example: [
      { weekday: 'MONDAY' },
      { weekday: 'WEDNESDAY' },
      { weekday: 'FRIDAY' },
    ],
    description:
      'Days of the week this habit is scheduled. Omit for daily habits.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: CreateHabitScheduleDayDto) => item.weekday)
  @ValidateNested({ each: true })
  @Type(() => CreateHabitScheduleDayDto)
  scheduleDays?: CreateHabitScheduleDayDto[];

  @ApiPropertyOptional({
    type: [CreateHabitCueDto],
    example: [
      {
        startTime: '07:00',
        endTime: '08:00',
        coarseLocation: 'home',
        precedingRoutine: 'wake up',
        isActive: true,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHabitCueDto)
  cues?: CreateHabitCueDto[];

  @ApiPropertyOptional({
    type: () => CreateHabitMotivationProfileDto,
    example: {
      goalTag: 'fitness',
      personalReason:
        'I want to build consistent exercise habits for long-term health',
      identityStatement: 'I am someone who moves their body every day',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHabitMotivationProfileDto)
  motivationProfile?: CreateHabitMotivationProfileDto;
}
