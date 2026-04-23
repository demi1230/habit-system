import { TYPOGRAPHY } from '@/shared/design';
import { ArticleCard } from './ArticleCard';
import { LEARNING_TOPICS } from '../content/learning-topics';
import { CATEGORY_ORDER, getCategoryBg } from '../content/article-display';
import type { Article } from '../content/articles';
import type { LearningTopic } from '../content/learning-topics';

interface Props {
  articles: Article[];
  activeTopic: LearningTopic;
  onOpen: (articleId: string) => void;
}

export function LearningLibrarySection({ articles, activeTopic, onOpen }: Props) {
  const filtered =
    activeTopic.categories.length === 0
      ? articles
      : articles.filter((a) => activeTopic.categories.includes(a.category));

  // Group by category
  const groupMap = new Map<Article['category'], Article[]>();
  for (const article of filtered) {
    const group = groupMap.get(article.category) ?? [];
    group.push(article);
    groupMap.set(article.category, group);
  }

  return (
    <div className="flex flex-col gap-6">
      {CATEGORY_ORDER.map((cat) => {
        const group = groupMap.get(cat);
        if (!group || group.length === 0) return null;
        const label = LEARNING_TOPICS.find((t) => t.categories.includes(cat))?.label ?? cat;
        return (
          <div key={cat}>
            <p
              style={{ ...TYPOGRAPHY.groupLabel, marginBottom: 10 }}
              className="text-muted-foreground"
            >
              {label}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {group.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  bg={getCategoryBg(article.category)}
                  onClick={() => onOpen(article.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
