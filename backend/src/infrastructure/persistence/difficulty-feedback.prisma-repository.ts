import { Injectable } from '@nestjs/common';
import { DifficultyFeedbackEntity } from '../../domain/entities/difficulty-feedback.entity';
import {
  IDifficultyFeedbackRepository,
  CreateDifficultyFeedbackData,
} from '../../domain/repositories/difficulty-feedback.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DifficultyFeedbackPrismaRepository
  implements IDifficultyFeedbackRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateDifficultyFeedbackData,
  ): Promise<DifficultyFeedbackEntity> {
    const result = await (this.prisma as any).difficultyFeedback.create({
      data: {
        userId: data.userId,
        habitId: data.habitId,
        logId: data.logId,
        rating: data.rating,
        note: data.note ?? null,
        occurredAt: data.occurredAt,
      },
    });
    return result as DifficultyFeedbackEntity;
  }

  async findAllByHabitId(habitId: string): Promise<DifficultyFeedbackEntity[]> {
    const results = await (this.prisma as any).difficultyFeedback.findMany({
      where: { habitId },
      orderBy: { occurredAt: 'desc' },
    });
    return results as DifficultyFeedbackEntity[];
  }

  async findRecentByHabitId(
    habitId: string,
    limit: number,
  ): Promise<DifficultyFeedbackEntity[]> {
    const results = await (this.prisma as any).difficultyFeedback.findMany({
      where: { habitId },
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
    return results as DifficultyFeedbackEntity[];
  }
}
