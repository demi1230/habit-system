import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateTimezoneDto } from './dto/update-timezone.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already registered.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive a JWT access token' })
  @ApiResponse({ status: 200, description: 'Returns JWT access token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Patch('users/:userId/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change own password' })
  @ApiResponse({ status: 204, description: 'Password updated successfully.' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  changePassword(
    @Param('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Patch('users/:userId/location')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Update current coarse location (used for location-gated reminders)',
  })
  @ApiResponse({ status: 204, description: 'Location updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateLocation(
    @Param('userId') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    const lat = dto.lat ?? null;
    const lng = dto.lng ?? null;
    return this.authService.updateLocation(userId, lat, lng);
  }

  @Patch('users/:userId/timezone')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user timezone used for local reminder scheduling',
  })
  @ApiResponse({ status: 204, description: 'Timezone updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateTimezone(
    @Param('userId') userId: string,
    @Body() dto: UpdateTimezoneDto,
  ) {
    return this.authService.updateTimezone(userId, dto);
  }
}
