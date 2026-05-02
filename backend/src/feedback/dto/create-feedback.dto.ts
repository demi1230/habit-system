import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'Аппаа илүү хурдан ажиллуулаач гэсэн хүсэлттэй байна.' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;
}
