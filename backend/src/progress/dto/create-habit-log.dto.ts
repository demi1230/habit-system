import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
} from 'class-validator';
import {
  CompletionTriggerSource,
  HabitLogStatus,
} from '../../common/enums/domain.enums';

export class CreateHabitLogDto {
  @IsOptional()
  @IsEnum(HabitLogStatus)
  status?: HabitLogStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  actualValue?: number;

  @IsISO8601()
  completedAt!: string;

  @IsOptional()
  @IsISO8601()
  loggedAt?: string;

  @IsOptional()
  @IsEnum(CompletionTriggerSource)
  triggerSource?: CompletionTriggerSource;
}
