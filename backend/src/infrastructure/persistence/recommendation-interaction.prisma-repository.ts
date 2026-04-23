/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { RecommendationInteractionEntity } from '../../domain/entities/recommendation-interaction.entity';
import {
  IRecommendationInteractionRepository,
  CreateRecommendationInteractionData,
} from '../../domain/repositories/recommendation-interaction.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationInteractionPrismaRepository implements IRecommendationInteractionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateRecommendationInteractionData,
  ): Promise<RecommendationInteractionEntity> {
    const interaction = await this.prisma.recommendationInteraction.create({
      data: {
        userId: data.userId,
        recommendationId: data.recommendationId,
        interactionType: data.interactionType,
        occurredAt: data.occurredAt,
      },
    });
    return this.mapToEntity(interaction);
  }

  async findByRecommendation(
    recommendationId: string,
  ): Promise<RecommendationInteractionEntity[]> {
    const interactions = await this.prisma.recommendationInteraction.findMany({
      where: { recommendationId },
      orderBy: { occurredAt: 'desc' },
    });
    return interactions.map((i) => this.mapToEntity(i));
  }

  async findByUserAndRecommendation(
    userId: string,
    recommendationId: string,
  ): Promise<RecommendationInteractionEntity[]> {
    const interactions = await this.prisma.recommendationInteraction.findMany({
      where: {
        userId,
        recommendationId,
      },
      orderBy: { occurredAt: 'desc' },
    });
    return interactions.map((i) => this.mapToEntity(i));
  }

  private mapToEntity(prismaInteraction: any): RecommendationInteractionEntity {
    return {
      id: prismaInteraction.id,
      userId: prismaInteraction.userId,
      recommendationId: prismaInteraction.recommendationId,
      interactionType: prismaInteraction.interactionType,
      occurredAt: prismaInteraction.occurredAt,
      createdAt: prismaInteraction.createdAt,
    };
  }
}
