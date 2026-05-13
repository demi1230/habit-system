import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { TYPOGRAPHY, SHADOW } from '@/shared/design';
import type { Article } from '../content/articles';


interface Props {
  article: Article;
  bg: string;
  onClick: () => void;
}

export function ArticleCard({ article, bg, onClick }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col justify-between rounded-3xl p-4 text-left w-full min-h-[108px]"
      style={{
        backgroundColor: 'var(--card)',
        boxShadow: SHADOW.card,
        border: `1.5px solid ${bg}40`,
      }}
    >
      <p style={{ ...TYPOGRAPHY.caption, lineHeight: 1.4, color: 'var(--foreground)' }}>
        {article.title}
      </p>
      <div className="flex items-center justify-between mt-3">
        <span style={{ ...TYPOGRAPHY.micro, color: 'var(--muted-foreground)' }}>
          {article.readTimeMinutes} мин
        </span>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
      </div>
    </motion.button>
  );
}
