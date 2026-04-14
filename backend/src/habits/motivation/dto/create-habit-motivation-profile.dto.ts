import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHabitMotivationProfileDto {
  @ApiPropertyOptional({
    example: 'I want to build consistent exercise habits for long-term health',
    maxLength: 500,
    description: 'Why the user wants to build this habit',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
