import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserActivityLogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  activityType!: string;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}
