import { LEARNING_TOPICS } from './learning-topics';
import type { Article } from './articles';

const CATEGORY_BASE_BG: Record<Article['category'], string> = {
  habit_building: '#EDE8FB',
  cues: '#DDF5E7',
  consistency: '#FFF0E1',
  motivation: '#FCE4EC',
  advanced: '#E8F4FF',
};

export function getCategoryBg(category: Article['category']) {
  return `color-mix(in srgb, ${CATEGORY_BASE_BG[category]} 44%, var(--card))`;
}

export const CATEGORY_ORDER = LEARNING_TOPICS.filter((topic) => topic.id !== 'all').flatMap(
  (topic) => topic.categories,
);
