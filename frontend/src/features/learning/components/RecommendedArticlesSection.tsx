import { TYPOGRAPHY } from '@/shared/design';
import { ArticleCard } from './ArticleCard';
import { getCategoryBg } from '../content/article-display';
import type { Article } from '../content/articles';

interface Props {
  articles: Article[];
  onOpen: (articleId: string) => void;
}

export function RecommendedArticlesSection({ articles, onOpen }: Props) {
  if (articles.length === 0) return null;

  return (
    <div>
      <p style={{ ...TYPOGRAPHY.sectionTitle, marginBottom: 6 }} className="text-foreground">
        Танд санал болгож буй
      </p>
      <p style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }} className="text-muted-foreground">
        Таны одоогийн явц, тогтмол байдалтай холбоотой нийтлэлүүдийг эхэнд нь гаргалаа.
      </p>
      <div className="grid grid-cols-2 gap-2.5 mt-4">
        {articles.map((article) => (
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
}
