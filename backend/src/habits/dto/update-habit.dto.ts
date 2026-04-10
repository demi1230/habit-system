import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateHabitDto {
  @ApiPropertyOptional({ example: 'Evening Walk', maxLength: 120 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    example: '20 minute walk after dinner',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: HabitTrackingType,
    example: HabitTrackingType.SIMPLE_CHECKIN,
  })
  @IsOptional()
  @IsEnum(HabitTrackingType)
  trackingType?: HabitTrackingType;

  @ApiPropertyOptional({ example: true })
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

  @ApiPropertyOptional({
    example: '2026-03-24',
    description: 'ISO 8601 date string',
  })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiPropertyOptional({
    enum: HabitLifecycleStatus,
    example: HabitLifecycleStatus.PAUSED,
  })
  @IsOptional()
  @IsEnum(HabitLifecycleStatus)
  status?: HabitLifecycleStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({
    type: [CreateHabitScheduleDayDto],
    example: [{ weekday: 'TUESDAY' }, { weekday: 'THURSDAY' }],
    description: 'Replaces the full scheduleDays list.',
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
        startTime: '19:00',
        endTime: '20:00',
        coarseLocation: 'neighborhood',
        precedingRoutine: 'dinner',
        isActive: true,
      },
    ],
    description: 'Replaces the full cues list.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHabitCueDto)
  cues?: CreateHabitCueDto[];

  @ApiPropertyOptional({
    type: () => CreateHabitMotivationProfileDto,
    example: {
      goalTag: 'health',
      personalReason: 'Wind down and stay active after a long work day',
      identityStatement: 'I am someone who takes care of their body',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHabitMotivationProfileDto)
  motivationProfile?: CreateHabitMotivationProfileDto;
}
