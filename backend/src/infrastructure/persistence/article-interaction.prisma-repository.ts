import { Injectable } from '@nestjs/common';
import { ArticleInteractionEntity } from '../../domain/entities/article-interaction.entity';
import {
  IArticleInteractionRepository,
  CreateArticleInteractionData,
} from '../../domain/repositories/article-interaction.repository';
import {
  ArticleInteractionType,
  SourceType,
} from '../../domain/enums/domain.enums';
import { PrismaService } from '../prisma/prisma.service';
import type { ArticleInteraction as ArticleInteractionRow } from '../../generated/prisma/client';

@Injectable()
export class ArticleInteractionPrismaRepository implements IArticleInteractionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateArticleInteractionData,
  ): Promise<ArticleInteractionEntity> {
    const interaction = await this.prisma.articleInteraction.create({
      data: {
        userId: data.userId,
        habitId: data.habitId,
        articleId: data.articleId,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        interactionType: data.interactionType,
        occurredAt: data.occurredAt,
      },
    });
    return this.mapToEntity(interaction);
  }

  async findByUserAndArticle(
    userId: string,
    articleId: string,
  ): Promise<ArticleInteractionEntity[]> {
    const interactions = await this.prisma.articleInteraction.findMany({
      where: {
        userId,
        articleId,
      },
      orderBy: { occurredAt: 'desc' },
    });
    return interactions.map((i) => this.mapToEntity(i));
  }

  async findRecentByUser(
    userId: string,
    limit: number,
  ): Promise<ArticleInteractionEntity[]> {
    const interactions = await this.prisma.articleInteraction.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
    return interactions.map((i) => this.mapToEntity(i));
  }

  async findBySourceType(
    userId: string,
    sourceType: SourceType,
    limit?: number,
  ): Promise<ArticleInteractionEntity[]> {
    const interactions = await this.prisma.articleInteraction.findMany({
      where: {
        userId,
        sourceType,
      },
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
    return interactions.map((i) => this.mapToEntity(i));
  }

  private mapToEntity(row: ArticleInteractionRow): ArticleInteractionEntity {
    return {
      id: row.id,
      userId: row.userId,
      habitId: row.habitId,
      articleId: row.articleId,
      sourceType: row.sourceType as SourceType,
      sourceId: row.sourceId,
      interactionType: row.interactionType as ArticleInteractionType,
      occurredAt: row.occurredAt,
      createdAt: row.createdAt,
    };
  }
}
