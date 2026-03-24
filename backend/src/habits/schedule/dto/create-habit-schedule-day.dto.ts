import { IsEnum } from 'class-validator';
import { Weekday } from '../../../common/enums/domain.enums';

export class CreateHabitScheduleDayDto {
  @IsEnum(Weekday)
  weekday!: Weekday;
}
