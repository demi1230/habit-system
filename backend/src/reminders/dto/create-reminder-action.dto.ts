import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ReminderActionType } from '../../domain/enums/domain.enums';

/**
 * DTO — submit an action on an existing Reminder.
 *
 * DONE  → marks reminder as acted, auto-creates HabitLog.
 * SNOOZE → reschedules the reminder after snoozeMinutes.
 */
export class CreateReminderActionDto {
  @ApiProperty({
    enum: ReminderActionType,
    description: 'DONE marks the habit complete. SNOOZE delays the reminder.',
    example: ReminderActionType.DONE,
  })
  @IsEnum(ReminderActionType)
  actionType!: ReminderActionType;

  @ApiPropertyOptional({
    description:
      'Required when actionType=SNOOZE. Number of minutes to delay before resending.',
    example: 30,
    minimum: 5,
    maximum: 1440,
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  snoozeMinutes?: number;

  @ApiPropertyOptional({
    description:
      'ISO-8601 timestamp of when the user acted. Defaults to server time if omitted.',
    example: '2026-03-25T08:15:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  actedAt?: string;
}
