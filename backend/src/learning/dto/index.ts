import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import {
  RecommendationInteractionType,
  ArticleInteractionType,
  SourceType,
} from '../../domain/enums/domain.enums';

export class LogRecommendationInteractionDto {
  @IsEnum(RecommendationInteractionType)
  interactionType!: RecommendationInteractionType;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

export class LogArticleInteractionDto {
  @IsString()
  articleId!: string;

  @IsEnum(SourceType)
  sourceType!: SourceType;

  @IsEnum(ArticleInteractionType)
  interactionType!: ArticleInteractionType;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
