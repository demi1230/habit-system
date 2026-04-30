import { ArticleInteractionEntity } from '../entities/article-interaction.entity';
import { ArticleInteractionType, SourceType } from '../enums/domain.enums';

export const ARTICLE_INTERACTION_REPOSITORY = Symbol(
  'IArticleInteractionRepository',
);

export interface CreateArticleInteractionData {
  userId: string;
  habitId?: string | null;
  articleId: string;
  sourceType: SourceType;
  sourceId?: string | null;
  interactionType: ArticleInteractionType;
  occurredAt: Date;
}

export interface IArticleInteractionRepository {
  create(data: CreateArticleInteractionData): Promise<ArticleInteractionEntity>;
  findByUserAndArticle(
    userId: string,
    articleId: string,
  ): Promise<ArticleInteractionEntity[]>;
  findRecentByUser(
    userId: string,
    limit: number,
  ): Promise<ArticleInteractionEntity[]>;
  findBySourceType(
    userId: string,
    sourceType: SourceType,
    limit?: number,
  ): Promise<ArticleInteractionEntity[]>;
}
