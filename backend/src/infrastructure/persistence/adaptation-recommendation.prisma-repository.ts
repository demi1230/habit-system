/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { AdaptationRecommendationEntity } from '../../domain/entities/adaptation-recommendation.entity';
import {
  IAdaptationRecommendationRepository,
  CreateAdaptationRecommendationData,
  UpdateAdaptationRecommendationData,
} from '../../domain/repositories/adaptation-recommendation.repository';
import {
  RecommendationCode,
  RecommendationStatus,
} from '../../domain/enums/domain.enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdaptationRecommendationPrismaRepository implements IAdaptationRecommendationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateAdaptationRecommendationData,
  ): Promise<AdaptationRecommendationEntity> {
    const recommendation = await this.prisma.adaptationRecommendation.create({
      data: {
        userId: data.userId,
        habitId: data.habitId,
        recommendationCode: data.recommendationCode,
        reasonCode: data.reasonCode,
        title: data.title,
        message: data.message,
        priority: data.priority,
        articleIds: data.articleIds,
        metadata: data.metadata as any,
        generatedAt: data.generatedAt,
        expiresAt: data.expiresAt,
      },
    });
    return this.mapToEntity(recommendation);
  }

  async findById(id: string): Promise<AdaptationRecommendationEntity | null> {
    const recommendation =
      await this.prisma.adaptationRecommendation.findUnique({
        where: { id },
      });
    return recommendation ? this.mapToEntity(recommendation) : null;
  }

  async findActiveByUserAndHabit(
    userId: string,
    habitId: string,
  ): Promise<AdaptationRecommendationEntity[]> {
    const recommendations = await this.prisma.adaptationRecommendation.findMany(
      {
        where: {
          userId,
          habitId,
          status: RecommendationStatus.ACTIVE,
        },
        orderBy: { generatedAt: 'desc' },
      },
    );
    return recommendations.map((r) => this.mapToEntity(r));
  }

  async findActiveByUser(
    userId: string,
  ): Promise<AdaptationRecommendationEntity[]> {
    const recommendations = await this.prisma.adaptationRecommendation.findMany(
      {
        where: {
          userId,
          status: RecommendationStatus.ACTIVE,
        },
        orderBy: { generatedAt: 'desc' },
      },
    );
    return recommendations.map((r) => this.mapToEntity(r));
  }

  async findByUserHabitAndCode(
    userId: string,
    habitId: string,
    code: RecommendationCode,
  ): Promise<AdaptationRecommendationEntity | null> {
    const recommendation = await this.prisma.adaptationRecommendation.findFirst(
      {
        where: {
          userId,
          habitId,
          recommendationCode: code,
          status: RecommendationStatus.ACTIVE,
        },
      },
    );
    return recommendation ? this.mapToEntity(recommendation) : null;
  }

  async update(
    id: string,
    data: UpdateAdaptationRecommendationData,
  ): Promise<AdaptationRecommendationEntity> {
    const recommendation = await this.prisma.adaptationRecommendation.update({
      where: { id },
      data: {
        status: data.status,
        articleIds: data.articleIds,
        expiresAt: data.expiresAt,
      },
    });
    return this.mapToEntity(recommendation);
  }

  async expireActiveByHabit(habitId: string): Promise<number> {
    const result = await this.prisma.adaptationRecommendation.updateMany({
      where: {
        habitId,
        status: RecommendationStatus.ACTIVE,
      },
      data: {
        status: RecommendationStatus.EXPIRED,
      },
    });
    return result.count;
  }

  private mapToEntity(
    prismaRecommendation: any,
  ): AdaptationRecommendationEntity {
    return {
      id: prismaRecommendation.id,
      userId: prismaRecommendation.userId,
      habitId: prismaRecommendation.habitId,
      recommendationCode: prismaRecommendation.recommendationCode,
      reasonCode: prismaRecommendation.reasonCode,
      title: prismaRecommendation.title,
      message: prismaRecommendation.message,
      priority: prismaRecommendation.priority,
      status: prismaRecommendation.status,
      articleIds: prismaRecommendation.articleIds,
      metadata: prismaRecommendation.metadata,
      generatedAt: prismaRecommendation.generatedAt,
      expiresAt: prismaRecommendation.expiresAt,
      createdAt: prismaRecommendation.createdAt,
      updatedAt: prismaRecommendation.updatedAt,
    };
  }
}
