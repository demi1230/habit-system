import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateHabitCueDto {
  @ApiPropertyOptional({
    example: '07:00',
    description: 'Start of the cue time window, HH:MM (24-hour)',
  })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, {
    message: 'startTime must be in HH:MM format (24-hour)',
  })
  startTime?: string;

  @ApiPropertyOptional({
    example: '08:00',
    description: 'End of the cue time window, HH:MM (24-hour)',
  })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format (24-hour)' })
  endTime?: string;

  @ApiPropertyOptional({
    example: 'home',
    maxLength: 100,
    description: 'Broad location where the cue occurs',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  coarseLocation?: string;

  @ApiPropertyOptional({
    example: 'wake up',
    maxLength: 150,
    description: 'Routine that typically precedes this habit',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  precedingRoutine?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this cue is currently active. Defaults to true.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
