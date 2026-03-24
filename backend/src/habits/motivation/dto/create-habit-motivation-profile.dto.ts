import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHabitMotivationProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  goalTag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  personalReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  identityStatement?: string;
}
