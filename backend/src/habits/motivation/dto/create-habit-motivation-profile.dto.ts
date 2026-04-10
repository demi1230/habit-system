import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHabitMotivationProfileDto {
  @ApiPropertyOptional({
    example: 'fitness',
    maxLength: 60,
    description: 'Short label categorizing the habit goal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  goalTag?: string;

  @ApiPropertyOptional({
    example: 'I want to build consistent exercise habits for long-term health',
    maxLength: 500,
    description: "Personal motivation in the user's own words",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  personalReason?: string;

  @ApiPropertyOptional({
    example: 'I am someone who moves their body every day',
    maxLength: 300,
    description:
      'Identity-based statement reinforcing the habit (habit loop research)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  identityStatement?: string;
}
