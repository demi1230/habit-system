import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitReflectionDto {
  @ApiProperty({
    example: 'I noticed I do this best right after my morning coffee.',
    description: 'Free-text reflection after completing a habit',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  text: string;

  @ApiPropertyOptional({
    example: '2026-03-25T08:05:00.000Z',
    description: 'ISO timestamp override (defaults to now)',
  })
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}
