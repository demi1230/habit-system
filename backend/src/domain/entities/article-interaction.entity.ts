import { ArticleInteractionType, SourceType } from '../enums/domain.enums';

/**
 * Domain entity — ArticleInteraction
 * Logs user interactions with learning articles.
 */
export interface ArticleInteractionEntity {
  id: string;
  userId: string;
  habitId?: string | null;
  articleId: string;
  sourceType: SourceType;
  sourceId?: string | null;
  interactionType: ArticleInteractionType;
  occurredAt: Date;
  createdAt: Date;
}
