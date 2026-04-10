import { Injectable } from '@nestjs/common';
import { SrbaiAssessmentEntity } from '../../domain/entities/srbai-assessment.entity';
import {
  ISrbaiAssessmentRepository,
  CreateSrbaiAssessmentData,
} from '../../domain/repositories/srbai-assessment.repository';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Infrastructure adapter — Prisma implementation of ISrbaiAssessmentRepository.
 */
@Injectable()
export class SrbaiAssessmentPrismaRepository implements ISrbaiAssessmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateSrbaiAssessmentData,
  ): Promise<SrbaiAssessmentEntity> {
    const result = await this.prisma.srbaiAssessment.create({
      data: {
        userId: data.userId,
        habitId: data.habitId,
        item1: data.item1,
        item2: data.item2,
        item3: data.item3,
        item4: data.item4,
        rawAverage: data.rawAverage,
        normalizedScore100: data.normalizedScore100,
        assessedAt: data.assessedAt,
      },
    });
    return result as unknown as SrbaiAssessmentEntity;
  }

  async findLatestByHabitId(
    habitId: string,
  ): Promise<SrbaiAssessmentEntity | null> {
    const result = await this.prisma.srbaiAssessment.findFirst({
      where: { habitId },
      orderBy: { assessedAt: 'desc' },
    });
    return result as unknown as SrbaiAssessmentEntity | null;
  }

  async findAllByHabitId(habitId: string): Promise<SrbaiAssessmentEntity[]> {
    const results = await this.prisma.srbaiAssessment.findMany({
      where: { habitId },
      orderBy: { assessedAt: 'desc' },
    });
    return results as unknown as SrbaiAssessmentEntity[];
  }
}
