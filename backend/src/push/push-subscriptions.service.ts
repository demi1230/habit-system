import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { RegisterPushSubscriptionDto } from './dto/register-push-subscription.dto';

@Injectable()
export class PushSubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(userId: string, dto: RegisterPushSubscriptionDto) {
    await this.authService.ensureUserExists(userId);

    return this.prisma.pushSubscription.upsert({
      where: {
        endpoint: dto.endpoint,
      },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.p256dh,
        auth: dto.auth,
        userAgent: dto.userAgent ?? null,
      },
      update: {
        userId,
        p256dh: dto.p256dh,
        auth: dto.auth,
        userAgent: dto.userAgent ?? null,
      },
    });
  }

  async listByUserId(userId: string) {
    await this.authService.ensureUserExists(userId);
    return this.prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(userId: string, subscriptionId: string) {
    await this.authService.ensureUserExists(userId);

    const existing = await this.prisma.pushSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Push subscription not found');
    }

    await this.prisma.pushSubscription.delete({
      where: {
        id: subscriptionId,
      },
    });
  }

  async deleteByEndpoint(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  }
}
