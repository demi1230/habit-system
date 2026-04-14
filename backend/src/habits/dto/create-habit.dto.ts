import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    maxLength: 40,
    example: 'km',
    description: 'Unit of measurement, e.g. "km", "pages", "glasses"',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  measurementUnit!: string;

  @ApiProperty({
    example: 5,
    description: 'Ideal target value. Completion is DONE when actualValue >= targetValue.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetValue!: number;

  @ApiProperty({
    example: 3,
    description:
      'Minimum value that counts as a successful completion (actualValue >= minimumTarget → DONE). Must be <= targetValue.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumTarget!: number;

  @ApiProperty({ example: '2026-03-24', description: 'ISO 8601 date string' })
  @IsISO8601()
  startDate!: string;

  @ApiPropertyOptional({
    enum: HabitLifecycleStatus,
    example: HabitLifecycleStatus.ACTIVE,
  })
  @IsOptional()
  @IsNotEmpty()
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
      reason: 'I want to build consistent exercise habits for long-term health',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHabitMotivationProfileDto)
  motivationProfile?: CreateHabitMotivationProfileDto;
}
