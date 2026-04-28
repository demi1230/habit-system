import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  CreateUserData,
} from '../../domain/repositories/user.repository';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Infrastructure adapter — Prisma implementation of IUserRepository.
 */
@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({ where: { email } });
    return result as UserEntity | null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.prisma.user.findUnique({ where: { id } });
    return result as UserEntity | null;
  }

  async create(
    data: CreateUserData,
  ): Promise<Pick<UserEntity, 'id' | 'email' | 'displayName' | 'createdAt'>> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName ?? null,
      },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async updateLocation(userId: string, lat: number | null, lng: number | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentLat: lat, currentLng: lng },
    });
  }
}
