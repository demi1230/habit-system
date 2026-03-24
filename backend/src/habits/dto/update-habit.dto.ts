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
} from '../../common/enums/domain.enums';
import { CreateHabitCueDto } from '../cues/dto/create-habit-cue.dto';
import { CreateHabitMotivationProfileDto } from '../motivation/dto/create-habit-motivation-profile.dto';
import { CreateHabitScheduleDayDto } from '../schedule/dto/create-habit-schedule-day.dto';

export class UpdateHabitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(HabitTrackingType)
  trackingType?: HabitTrackingType;

  @IsOptional()
  @IsBoolean()
  allowPartialCompletion?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  measurementUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minimumSuccessValue?: number;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsEnum(HabitLifecycleStatus)
  status?: HabitLifecycleStatus;

  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique((item: CreateHabitScheduleDayDto) => item.weekday)
  @ValidateNested({ each: true })
  @Type(() => CreateHabitScheduleDayDto)
  scheduleDays?: CreateHabitScheduleDayDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHabitCueDto)
  cues?: CreateHabitCueDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHabitMotivationProfileDto)
  motivationProfile?: CreateHabitMotivationProfileDto;
}
