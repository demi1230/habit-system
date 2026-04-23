import { motion } from 'motion/react';
import { Clock, ChevronRight } from 'lucide-react';
import { TYPOGRAPHY, SHADOW } from '@/shared/design';
import type { Article } from '../content/articles';

interface Props {
  articles: Article[];
  onOpen: (articleId: string) => void;
}

export function ContinueReadingSection({ articles, onOpen }: Props) {
  if (articles.length === 0) return null;

  return (
    <div>
      <p style={{ ...TYPOGRAPHY.sectionTitle, marginBottom: 12 }} className="text-foreground">
        Үргэлжлүүлэн унших
      </p>
      <div className="flex flex-col gap-2">
        {articles.map((article) => (
          <motion.button
            key={article.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen(article.id)}
            className="w-full rounded-[18px] px-4 py-3.5 bg-card text-left flex items-center gap-3"
            style={{ boxShadow: SHADOW.card }}
          >
            <div className="flex-1 min-w-0">
              <p
                style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }}
                className="text-foreground truncate"
              >
                {article.title}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span style={TYPOGRAPHY.micro} className="text-muted-foreground">
                  {article.readTimeMinutes} мин
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(0,0,0,0.3)' }} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
