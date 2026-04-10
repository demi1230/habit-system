import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO — submit an SRBAI assessment for a habit.
 *
 * Each item is a 7-point Likert scale (1 = strongly disagree, 7 = strongly agree).
 * The four items probe automaticity:
 *   1. I do this habit automatically.
 *   2. I do this habit without thinking.
 *   3. I would find it hard NOT to do this habit.
 *   4. I do this habit without consciously remembering.
 */
export class CreateSrbaiAssessmentDto {
  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 7,
    description: 'Likert item 1: "I do this habit automatically."',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  item1!: number;

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 7,
    description: 'Likert item 2: "I do this habit without thinking."',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  item2!: number;

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 7,
    description: 'Likert item 3: "I would find it hard NOT to do this habit."',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  item3!: number;

  @ApiProperty({
    example: 3,
    minimum: 1,
    maximum: 7,
    description:
      'Likert item 4: "I do this habit without consciously remembering."',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  item4!: number;

  @ApiPropertyOptional({
    example: '2026-03-25T08:00:00.000Z',
    description: 'Assessment timestamp (ISO 8601). Defaults to now if omitted.',
  })
  @IsOptional()
  @IsISO8601()
  assessedAt?: string;
}
