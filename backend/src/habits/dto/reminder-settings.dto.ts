import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class TimeWindowDto {
  @ApiPropertyOptional({ example: '07:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format' })
  startTime!: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format' })
  endTime!: string;
}

export class ReminderLocationDto {
  @ApiPropertyOptional({ example: 'Гэр', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({ example: 47.9184 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiPropertyOptional({ example: 106.9177 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class ReminderSettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    type: [TimeWindowDto],
    example: [{ startTime: '07:00', endTime: '08:00' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeWindowDto)
  timeWindows?: TimeWindowDto[];

  @ApiPropertyOptional({
    type: [ReminderLocationDto],
    description:
      'GPS-pinned locations where the reminder applies (within 100m)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReminderLocationDto)
  locations?: ReminderLocationDto[];
}
