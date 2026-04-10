import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Weekday } from '../../../domain/enums/domain.enums';

export class CreateHabitScheduleDayDto {
  @ApiProperty({ enum: Weekday, example: Weekday.MONDAY })
  @IsEnum(Weekday)
  weekday!: Weekday;
}
