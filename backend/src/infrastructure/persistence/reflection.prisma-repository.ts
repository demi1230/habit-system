import { Injectable } from '@nestjs/common';
import { ReflectionEntity } from '../../domain/entities/reflection.entity';
import {
  IReflectionRepository,
  CreateReflectionData,
} from '../../domain/repositories/reflection.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReflectionPrismaRepository implements IReflectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReflectionData): Promise<ReflectionEntity> {
    const result = await (this.prisma as any).reflection.create({
      data: {
        userId: data.userId,
        habitId: data.habitId,
        logId: data.logId,
        text: data.text,
        occurredAt: data.occurredAt,
      },
    });
    return result as ReflectionEntity;
  }

  async findAllByHabitId(habitId: string): Promise<ReflectionEntity[]> {
    const results = await (this.prisma as any).reflection.findMany({
      where: { habitId },
      orderBy: { occurredAt: 'desc' },
    });
    return results as ReflectionEntity[];
  }
}
