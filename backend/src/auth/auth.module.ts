import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { USER_REPOSITORY } from '../domain/repositories/user.repository';
import { UserPrismaRepository } from '../infrastructure/persistence/user.prisma-repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

/**
 * Application module — Auth
 * Provides user registration, login, JWT issuing, and ownership enforcement.
 * Binds IUserRepository port to UserPrismaRepository adapter.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'change-me-in-env',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
