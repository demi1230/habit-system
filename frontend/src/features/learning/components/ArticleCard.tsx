import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { TYPOGRAPHY, SHADOW } from '@/shared/design';
import type { Article } from '../content/articles';

const PASTEL_CARD_INK = 'var(--pastel-card-ink)';
const PASTEL_CARD_MUTED = 'var(--pastel-card-muted)';

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
        backgroundColor: bg,
        boxShadow: SHADOW.card,
        border: '1px solid var(--surface-border-faint)',
      }}
    >
      <p style={{ ...TYPOGRAPHY.caption, lineHeight: 1.4, color: PASTEL_CARD_INK }}>
        {article.title}
      </p>
      <div className="flex items-center justify-between mt-3">
        <span style={{ ...TYPOGRAPHY.micro, color: PASTEL_CARD_MUTED }}>
          {article.readTimeMinutes} мин
        </span>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: PASTEL_CARD_MUTED }} />
      </div>
    </motion.button>
  );
}
