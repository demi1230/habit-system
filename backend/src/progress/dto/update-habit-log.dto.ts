import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UpdateHabitLogDto {
  @ApiProperty({
    example: 3.5,
    description:
      'New actual measured value. Status is re-derived: >= minimumTarget → DONE, else NOT_DONE.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  actualValue!: number;
}
