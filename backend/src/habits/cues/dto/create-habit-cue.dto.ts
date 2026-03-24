import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CueDayType } from '../../../common/enums/domain.enums';

export class CreateHabitCueDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timeWindow?: string;

  @IsOptional()
  @IsEnum(CueDayType)
  dayType?: CueDayType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  coarseLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  precedingRoutine?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
