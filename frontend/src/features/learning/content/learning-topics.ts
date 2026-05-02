import type { Article } from '../content/articles';

export interface LearningTopic {
  id: string;
  label: string;
  /** Empty means "show all categories" */
  categories: Article['category'][];
}

export const LEARNING_TOPICS: LearningTopic[] = [
  { id: 'all', label: 'Бүгд', categories: [] },
  { id: 'habit_building', label: 'Дадал эхлүүлэх', categories: ['habit_building'] },
  { id: 'cues', label: 'Өдөөгч ба орчин', categories: ['cues'] },
  { id: 'consistency', label: 'Тогтвортой байдал', categories: ['consistency'] },
  { id: 'motivation', label: 'Урам ба эсэргүүцэл', categories: ['motivation'] },
  { id: 'advanced', label: 'Онол ба систем', categories: ['advanced'] },
];
