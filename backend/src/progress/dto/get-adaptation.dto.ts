import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetAdaptationDto {
  @ApiPropertyOptional({
    example: 72.5,
    description:
      'Composite habit-strength score (0–100). Omit if not yet assessed.',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  compositeScore?: number;

  @ApiProperty({
    example: 0.75,
    description: 'Self-initiated completion rate (0–1) from progress summary',
    minimum: 0,
    maximum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  selfInitiatedRate: number;

  @ApiProperty({
    example: 0.2,
    description: 'Reminder-dependence rate (0–1) from progress summary',
    minimum: 0,
    maximum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  reminderDependenceRate: number;

  @ApiProperty({
    example: 14,
    description: 'Total DONE completions for this habit',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  doneCount: number;

  @ApiPropertyOptional({
    example: 'STANDARD',
    description: 'Current reminder policy mode, if any',
  })
  @IsOptional()
  @IsString()
  currentPolicyMode?: string;
}
