import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsNumber, IsOptional } from 'class-validator';
import {
  CompletionTriggerSource,
  HabitLogStatus,
} from '../../domain/enums/domain.enums';

export class CreateHabitLogDto {
  @ApiPropertyOptional({
    enum: HabitLogStatus,
    example: HabitLogStatus.DONE,
    description:
      'Required for SIMPLE_CHECKIN habits. Omit for QUANTITATIVE — status is derived from actualValue.',
  })
  @IsOptional()
  @IsEnum(HabitLogStatus)
  status?: HabitLogStatus;

  @ApiPropertyOptional({
    example: 5.2,
    description: 'Required for QUANTITATIVE habits. Omit for SIMPLE_CHECKIN.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  actualValue?: number;

  @ApiProperty({
    example: '2026-03-24T07:30:00.000Z',
    description: 'When the habit was actually performed (ISO 8601)',
  })
  @IsISO8601()
  completedAt!: string;

  @ApiPropertyOptional({
    example: '2026-03-24T07:35:00.000Z',
    description:
      'When this log entry was recorded. Defaults to now if omitted.',
  })
  @IsOptional()
  @IsISO8601()
  loggedAt?: string;

  @ApiPropertyOptional({
    enum: CompletionTriggerSource,
    example: CompletionTriggerSource.SELF_INITIATED,
    description:
      'What initiated this completion — used for habit-strength self-initiated rate.',
  })
  @IsOptional()
  @IsEnum(CompletionTriggerSource)
  triggerSource?: CompletionTriggerSource;
}
