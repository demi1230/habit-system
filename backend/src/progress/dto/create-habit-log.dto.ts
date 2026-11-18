import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsNumber, IsOptional, Min } from 'class-validator';
import { CompletionTriggerSource } from '../../domain/enums/domain.enums';

export class CreateHabitLogDto {
  @ApiProperty({
    example: 5.2,
    description:
      'Actual measured value. Status is derived: >= minimumTarget → DONE, else NOT_DONE.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  actualValue!: number;

  @ApiProperty({
    example: '2026-03-23T23:30:00.000Z',
    description:
      'When the habit was actually performed (ISO 8601). Send a UTC offset ' +
      '(e.g. `Z`); a value without an offset is read as Asia/Ulaanbaatar ' +
      'wall-clock time. Must not be later than today in that timezone.',
  })
  @IsISO8601()
  completedAt!: string;

  @ApiPropertyOptional({
    example: '2026-03-23T23:35:00.000Z',
    description:
      'When this log entry was recorded (same offset rules as completedAt). ' +
      'Defaults to now if omitted.',
  })
  @IsOptional()
  @IsISO8601()
  loggedAt?: string;

  @ApiPropertyOptional({
    enum: CompletionTriggerSource,
    deprecated: true,
    description:
      'Ignored. Accepted for older app versions; the server classifies the ' +
      'source from delivered reminders (REMINDER_TRIGGERED within 60 minutes ' +
      'of a reminder, UNKNOWN for earlier days, otherwise SELF_INITIATED).',
  })
  @IsOptional()
  @IsEnum(CompletionTriggerSource)
  triggerSource?: CompletionTriggerSource;
}
