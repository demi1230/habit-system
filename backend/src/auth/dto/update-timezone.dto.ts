import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateTimezoneDto {
  @ApiProperty({
    example: 'Asia/Ulaanbaatar',
    description:
      'IANA timezone identifier. Invalid values fall back to Asia/Ulaanbaatar.',
  })
  @IsString()
  @MaxLength(64)
  timezone!: string;
}
