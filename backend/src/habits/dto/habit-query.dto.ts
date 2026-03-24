import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class HabitQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeArchived?: boolean;
}
