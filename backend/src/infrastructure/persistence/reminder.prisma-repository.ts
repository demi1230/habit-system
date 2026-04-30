import { Injectable } from '@nestjs/common';
import { ReminderEntity } from '../../domain/entities/reminder.entity';
import {
  IReminderRepository,
  CreateReminderData,
  UpdateReminderData,
} from '../../domain/repositories/reminder.repository';
import { ReminderStatus } from '../../domain/enums/domain.enums';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

/**
 * Infrastructure adapter — Prisma implementation of IReminderRepository.
 */
@Injectable()
export class ReminderPrismaRepository implements IReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReminderData): Promise<ReminderEntity> {
    const result = await this.prisma.reminder.create({
      data: {
        userId: data.userId,
        habitId: data.habitId,
        linkedCueId: data.linkedCueId ?? null,
        decisionReason: data.decisionReason,
        status: 'PENDING',
        scheduledFor: data.scheduledFor,
        evaluatedAt: data.evaluatedAt,
        effectiveUntil: data.effectiveUntil ?? null,
        cooldownKey: data.cooldownKey ?? null,
        explanation: (data.explanation ??
          Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
    return result as unknown as ReminderEntity;
  }

  async findById(id: string): Promise<ReminderEntity | null> {
    const result = await this.prisma.reminder.findUnique({ where: { id } });
    return result as unknown as ReminderEntity | null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<ReminderEntity | null> {
    const result = await this.prisma.reminder.findFirst({
      where: { id, userId },
    });
    return result as unknown as ReminderEntity | null;
  }

  async findAllByUserId(userId: string): Promise<ReminderEntity[]> {
    const results = await this.prisma.reminder.findMany({
      where: { userId },
      orderBy: { scheduledFor: 'desc' },
    });
    return results as unknown as ReminderEntity[];
  }

  async update(id: string, data: UpdateReminderData): Promise<ReminderEntity> {
    const result = await this.prisma.reminder.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.sentAt !== undefined && { sentAt: data.sentAt }),
        ...(data.deliveredAt !== undefined && {
          deliveredAt: data.deliveredAt,
        }),
      },
    });
    return result as unknown as ReminderEntity;
  }

  /**
   * Habit-scoped cooldown dedup: returns a PENDING or SENT reminder for the
   * habit whose `effectiveUntil` is still in the future, or null if the
   * cooldown window has passed → safe to create a new reminder.
   *
   * This is timezone-agnostic by design (we compare absolute UTC instants
   * against `effectiveUntil`, never bucket strings).
   */
  async findActiveByHabitId(
    habitId: string,
    now: Date,
  ): Promise<ReminderEntity | null> {
    const result = await this.prisma.reminder.findFirst({
      where: {
        habitId,
        status: { in: [ReminderStatus.PENDING, ReminderStatus.SENT] },
        effectiveUntil: { gt: now },
      },
      orderBy: { scheduledFor: 'desc' },
    });
    return result as unknown as ReminderEntity | null;
  }

  async findDuePendingSnoozeFollowUps(now: Date): Promise<ReminderEntity[]> {
    const results = await this.prisma.reminder.findMany({
      where: {
        status: ReminderStatus.PENDING,
        scheduledFor: { lte: now },
        cooldownKey: { contains: ':snooze:' },
      },
    });
    return results as unknown as ReminderEntity[];
  }
}
