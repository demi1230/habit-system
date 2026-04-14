import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { HabitLifecycleStatus } from '../../domain/enums/domain.enums';
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
    maxLength: 40,
    description: 'Unit of measurement, e.g. "km", "pages", "glasses"',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  measurementUnit?: string;

  @ApiPropertyOptional({
    description: 'Ideal target value.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetValue?: number;

  @ApiPropertyOptional({
    description:
      'Minimum value that counts as a successful completion. Must be <= targetValue.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumTarget?: number;

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
  @IsNotEmpty()
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
      reason: 'Wind down and stay active after a long work day',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHabitMotivationProfileDto)
  motivationProfile?: CreateHabitMotivationProfileDto;
}
