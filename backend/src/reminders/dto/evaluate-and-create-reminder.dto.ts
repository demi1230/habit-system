import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO — evaluate-and-create reminder for a habit.
 * The body is intentionally thin; all decision logic is server-side.
 * Optional snoozeMinutes allows overriding the default cooldown window.
 */
export class EvaluateAndCreateReminderDto {
  @ApiPropertyOptional({
    description:
      'If the previous reminder was snoozed, pass how many extra minutes to delay. ' +
      'Omit for a fresh evaluation.',
    example: 30,
    minimum: 5,
    maximum: 1440,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  cooldownOverrideMinutes?: number;
}
