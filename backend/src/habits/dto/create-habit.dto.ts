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
import { HabitStepDto } from './habit-step.dto';
import { CreateHabitMotivationProfileDto } from '../motivation/dto/create-habit-motivation-profile.dto';
import { CreateHabitScheduleDayDto } from '../schedule/dto/create-habit-schedule-day.dto';
import { ReminderSettingsDto } from './reminder-settings.dto';

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

  @ApiPropertyOptional({
    example: 'wake up',
    maxLength: 150,
    description: 'Routine that typically precedes this habit (top-level)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  precedingRoutine?: string;

  @ApiPropertyOptional({
    example: 'Өдрийг тайван эхлүүлэхийн тулд',
    maxLength: 500,
    description: 'Why the user wants this habit — stored in motivationProfile.reason',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    example: 'lavender',
    maxLength: 30,
    description: 'Color key or hex for the habit card',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  color?: string;

  @ApiPropertyOptional({ example: 'EMOJI', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  iconType?: string;

  @ApiPropertyOptional({ example: '🧘', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  iconValue?: string;

  @ApiPropertyOptional({
    example: ['Тайвшруулна', 'Төвлөрөл сайжруулна'],
    description: 'List of benefits the user associates with this habit',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  benefits?: string[];

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
    type: [HabitStepDto],
    example: [
      { title: 'Пүүзээ бэлдэх', orderIndex: 0 },
      { title: 'Гадагшаа гарах', orderIndex: 1 },
    ],
    description: 'Optional 1-5 tiny steps for this habit',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HabitStepDto)
  steps?: HabitStepDto[];

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

  @ApiPropertyOptional({
    type: () => ReminderSettingsDto,
    example: {
      enabled: true,
      timeWindows: [{ startTime: '07:00', endTime: '08:00' }],
      locations: ['home'],
    },
    description: 'Structured reminder settings — converted to cues internally',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderSettingsDto)
  reminder?: ReminderSettingsDto;
}
