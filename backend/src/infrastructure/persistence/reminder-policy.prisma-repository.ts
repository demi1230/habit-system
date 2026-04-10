import { Injectable } from '@nestjs/common';
import { ReminderPolicyEntity } from '../../domain/entities/reminder-policy.entity';
import {
  IReminderPolicyRepository,
  UpsertReminderPolicyData,
} from '../../domain/repositories/reminder-policy.repository';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Infrastructure adapter — Prisma implementation of IReminderPolicyRepository.
 */
@Injectable()
export class ReminderPolicyPrismaRepository implements IReminderPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Untyped accessor — ReminderPolicy model is not yet in the generated client. Remove cast after `prisma generate`. */
  private get db(): any {
    return this.prisma as any;
  }

  async upsert(data: UpsertReminderPolicyData): Promise<ReminderPolicyEntity> {
    const result = await this.db.reminderPolicy.upsert({
      where: { habitId: data.habitId },
      create: {
        habitId: data.habitId,
        mode: data.mode,
        cooldownMinutes: data.cooldownMinutes,
        maxPerDay: data.maxPerDay,
        narrowingLevel: data.narrowingLevel,
        effectiveFrom: data.effectiveFrom,
      },
      update: {
        mode: data.mode,
        cooldownMinutes: data.cooldownMinutes,
        maxPerDay: data.maxPerDay,
        narrowingLevel: data.narrowingLevel,
        effectiveFrom: data.effectiveFrom,
      },
    });
    return result as unknown as ReminderPolicyEntity;
  }

  async findByHabitId(habitId: string): Promise<ReminderPolicyEntity | null> {
    const result = await this.db.reminderPolicy.findUnique({
      where: { habitId },
    });
    return result as unknown as ReminderPolicyEntity | null;
  }
}
