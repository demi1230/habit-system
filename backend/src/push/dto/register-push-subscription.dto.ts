import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isAllowedPushEndpoint } from '../push-endpoint';

@ValidatorConstraint({ name: 'pushServiceEndpoint' })
class PushServiceEndpointConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isAllowedPushEndpoint(value);
  }

  defaultMessage(): string {
    return 'endpoint must be an HTTPS URL of a browser push service';
  }
}

export class RegisterPushSubscriptionDto {
  @ApiProperty({
    example: 'https://fcm.googleapis.com/fcm/send/abc123',
    description:
      'PushSubscription.endpoint from the browser. Only HTTPS endpoints of browser push services (FCM, Mozilla, WNS, Apple) are accepted.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @Validate(PushServiceEndpointConstraint)
  endpoint!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  p256dh!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  auth!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string;
}
