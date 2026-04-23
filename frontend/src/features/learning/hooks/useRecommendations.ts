import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api/client';

/**
 * Get active recommendations for the current user
 */
export function useRecommendations(userId: string | undefined, habitId?: string) {
  return useQuery({
    queryKey: ['recommendations', userId, habitId],
    queryFn: async () => {
      if (!userId) return [];
      const params = habitId ? `?habitId=${habitId}` : '';
      const data = await api.get<unknown[]>(
        `/users/${userId}/recommendations${params}`,
      );
      return data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Refresh recommendations for a specific habit
 */
export function useRefreshRecommendations(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: string) => {
      return api.post<unknown>(
        `/users/${userId}/recommendations/refresh?habitId=${habitId}`,
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recommendations', userId],
      });
    },
  });
}

/**
 * Log a recommendation interaction
 */
export function useLogRecommendationInteraction(userId: string) {
  return useMutation({
    mutationFn: async (params: {
      recommendationId: string;
      interactionType: 'SHOWN' | 'CLICKED' | 'DISMISSED' | 'APPLIED';
    }) => {
      return api.post<unknown>(
        `/users/${userId}/recommendations/${params.recommendationId}/interactions`,
        { interactionType: params.interactionType },
      );
    },
  });
}

/**
 * Dismiss a recommendation
 */
export function useDismissRecommendation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recommendationId: string) => {
      return api.post<unknown>(
        `/users/${userId}/recommendations/${recommendationId}/dismiss`,
        {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recommendations', userId],
      });
    },
  });
}

/**
 * Log an article interaction
 */
export function useLogArticleInteraction(userId: string) {
  return useMutation({
    mutationFn: async (params: {
      articleId: string;
      interactionType: 'OPENED' | 'COMPLETED' | 'BOOKMARKED' | 'UNBOOKMARKED';
      sourceType: 'LEARNING_PAGE' | 'RECOMMENDATION' | 'HABIT_DETAIL' | 'ANALYTICS_PAGE';
      sourceId?: string;
      habitId?: string;
    }) => {
      return api.post<unknown>(
        `/users/${userId}/articles/${params.articleId}/interactions`,
        {
          articleId: params.articleId,
          interactionType: params.interactionType,
          sourceType: params.sourceType,
          sourceId: params.sourceId,
          habitId: params.habitId,
        },
      );
    },
  });
}

/**
 * Get article interaction history
 */
export function useArticleInteractionHistory(userId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['articleInteractions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await api.get<unknown[]>(
        `/users/${userId}/articles/interactions?limit=${limit}`,
      );
      return data || [];
    },
    enabled: !!userId,
  });
}
