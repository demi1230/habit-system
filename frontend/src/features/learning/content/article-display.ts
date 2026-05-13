import { LEARNING_TOPICS } from './learning-topics';
import type { Article } from './articles';

export const CATEGORY_ACCENT: Record<Article['category'], string> = {
  habit_building: '#7C70E8',
  cues: '#18A68A',
  consistency: '#D4650A',
  motivation: '#D94F6E',
  advanced: '#3B8FD4',
};

export function getCategoryBg(category: Article['category']) {
  return CATEGORY_ACCENT[category];
}

export const CATEGORY_ORDER = LEARNING_TOPICS.filter((topic) => topic.id !== 'all').flatMap(
  (topic) => topic.categories,
);
