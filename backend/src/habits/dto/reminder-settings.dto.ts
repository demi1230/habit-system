import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
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
    example: ['home', 'dorm'],
    description: 'Locations where the reminder applies',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  locations?: string[];
}
