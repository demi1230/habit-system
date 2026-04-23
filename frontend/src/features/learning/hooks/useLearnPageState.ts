import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  useRecommendations,
  useLogArticleInteraction,
  useLogRecommendationInteraction,
} from './useRecommendations';
import { ARTICLE_CATALOG } from '../content/articles';
import type { Article } from '../content/articles';
import type { RecommendationItem } from '../model/recommendation.types';

const STORAGE_KEY = 'learn_recently_viewed';
const MAX_ITEMS = 5;

function readRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecentId(articleId: string): void {
  const prev = readRecentIds().filter((id) => id !== articleId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([articleId, ...prev].slice(0, MAX_ITEMS)));
}

function resolveArticles(ids: string[]): Article[] {
  return ids.map((id) => ARTICLE_CATALOG[id]).filter((a): a is Article => Boolean(a));
}

// ─────────────────────────────────────────────────────────────────────────────

export function useLearnPageState() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const { data: rawRecommendations } = useRecommendations(userId ?? undefined);
  const logArticle = useLogArticleInteraction(userId ?? '');
  const logRec = useLogRecommendationInteraction(userId ?? '');

  const [recentlyViewed, setRecentlyViewed] = useState<Article[]>(() =>
    resolveArticles(readRecentIds()),
  );

  const openArticle = useCallback(
    (
      articleId: string,
      sourceType: 'LEARNING_PAGE' | 'RECOMMENDATION' | 'ANALYTICS_PAGE',
      sourceId?: string,
    ) => {
      logArticle.mutate({ articleId, interactionType: 'OPENED', sourceType, sourceId });
      writeRecentId(articleId);
      setRecentlyViewed(resolveArticles(readRecentIds()));
      navigate(`/learn/articles/${articleId}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, userId],
  );

  const handleRecommendationNavigate = useCallback(
    (articleId: string, recId: string) => {
      logRec.mutate({ recommendationId: recId, interactionType: 'CLICKED' });
      openArticle(articleId, 'RECOMMENDATION', recId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openArticle, userId],
  );

  const recommendations: RecommendationItem[] = Array.isArray(rawRecommendations)
    ? (rawRecommendations as RecommendationItem[])
    : [];

  const recommendedArticleIds = Array.from(
    new Set(recommendations.flatMap((recommendation) => recommendation.articleIds ?? [])),
  );
  const recommendedArticles = resolveArticles(recommendedArticleIds);
  const remainingArticles = Object.values(ARTICLE_CATALOG).filter(
    (article) => !recommendedArticleIds.includes(article.id),
  );

  return {
    userId,
    recommendations,
    recommendedArticles,
    remainingArticles,
    recentlyViewed,
    openArticle,
    handleRecommendationNavigate,
  };
}
