import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO — submit an SRBAI assessment for a habit.
 *
 * Self-Report Behavioural Automaticity Index (Gardner, Abraham, Lally &
 * de Bruijn, 2012). Each item completes the stem "Behaviour X is something…"
 * and is rated on a 7-point scale (1 = strongly disagree, 7 = strongly agree):
 *   1. I do automatically.
 *   2. I do without having to consciously remember.
 *   3. I do without thinking.
 *   4. I start doing before I realize I'm doing it.
 * The Mongolian wording in the app is the project's own translation and has
 * not been validated. Answers are stored with instrumentVersion = 2; earlier
 * answers (version 1) used different item wording.
 */
export class CreateSrbaiAssessmentDto {
  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 7,
    description: 'Item 1: "…something I do automatically."',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  item1!: number;

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 7,
    description:
      'Item 2: "…something I do without having to consciously remember."',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  item2!: number;

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 7,
    description: 'Item 3: "…something I do without thinking."',
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
      'Item 4: "…something I start doing before I realize I\'m doing it."',
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
