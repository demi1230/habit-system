import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class BroadcastPushDto {
  @ApiProperty({ example: 'Апп шинэчлэгдлээ' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: 'Notification-ийн bug засагдлаа. Дахин нэвтэрч орно уу.' })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiProperty({ description: 'Admin secret key from ADMIN_SECRET env var' })
  @IsString()
  @MinLength(1)
  secret!: string;
}
