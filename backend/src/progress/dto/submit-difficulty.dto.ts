import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export const DifficultyRating = {
  VERY_EASY: 'very_easy',
  EASY: 'easy',
  MODERATE: 'moderate',
  HARD: 'hard',
  VERY_HARD: 'very_hard',
} as const;
export type DifficultyRating = (typeof DifficultyRating)[keyof typeof DifficultyRating];

export class SubmitDifficultyDto {
  @ApiProperty({
    enum: DifficultyRating,
    example: DifficultyRating.MODERATE,
    description: 'Subjective difficulty rating for this completion',
  })
  @IsEnum(DifficultyRating)
  rating: DifficultyRating;

  @ApiPropertyOptional({
    example: 'Felt tired today but pushed through.',
    description: 'Optional free-text note',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    example: '2026-03-25T08:00:00.000Z',
    description: 'ISO timestamp override (defaults to now)',
  })
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}
