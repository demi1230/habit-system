// Strongly-typed recommendation codes — must match backend enum values
export type RecommendationCode =
  | 'REDUCE_TARGET'
  | 'SIMPLIFY_HABIT'
  | 'REVIEW_REMINDER_DEPENDENCE'
  | 'ADJUST_CUE'
  | 'INCREASE_SUPPORT'
  | 'BUILD_CONSISTENCY'
  | 'CELEBRATE_CONSISTENCY';

// Matches the API response shape + backend entity
export interface RecommendationItem {
  id: string;
  recommendationCode: string;
  articleIds?: string[];
}
