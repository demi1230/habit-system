import { Injectable } from '@nestjs/common';
import { ReminderActionEntity } from '../../domain/entities/reminder-action.entity';
import {
  IReminderActionRepository,
  CreateReminderActionData,
} from '../../domain/repositories/reminder-action.repository';
import { ReminderActionType } from '../../domain/enums/domain.enums';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

/**
 * Infrastructure adapter — Prisma implementation of IReminderActionRepository.
 */
@Injectable()
export class ReminderActionPrismaRepository implements IReminderActionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReminderActionData): Promise<ReminderActionEntity> {
    const result = await this.prisma.reminderAction.create({
      data: {
        reminderId: data.reminderId,
        userId: data.userId,
        actionType: data.actionType,
        actedAt: data.actedAt,
        snoozedUntil: data.snoozedUntil ?? null,
        // Prisma 7 requires `Prisma.JsonNull` for nullable Json fields rather
        // than a raw `null`, which would otherwise be a type error.
        metadata: (data.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
    return result as unknown as ReminderActionEntity;
  }

  async findAllByReminderId(
    reminderId: string,
  ): Promise<ReminderActionEntity[]> {
    const results = await this.prisma.reminderAction.findMany({
      where: { reminderId },
      orderBy: { actedAt: 'asc' },
    });
    return results as unknown as ReminderActionEntity[];
  }

  async hasDoneAction(reminderId: string): Promise<boolean> {
    const count = await this.prisma.reminderAction.count({
      where: { reminderId, actionType: ReminderActionType.DONE },
    });
    return count > 0;
  }
}
