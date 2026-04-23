import { motion } from 'motion/react';
import { getRecommendationCopy } from '../content/recommendation-copy';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';
import { RecommendationWhyToggle } from './RecommendationWhyToggle';

// Re-exported from model for backwards compatibility
export type { RecommendationItem } from '../model/recommendation.types';
import type { RecommendationItem } from '../model/recommendation.types';

interface Props {
  rec: RecommendationItem;
  onNavigate: (articleId: string, recId: string) => void;
}

/**
 * Renders a single recommendation item.
 * Layout (card shell, list dividers) is handled by RecommendationSection.
 */
export function RecommendationCard({ rec, onNavigate }: Props) {
  const copy = getRecommendationCopy(rec.recommendationCode);

  return (
    <div>
      <p style={TYPOGRAPHY.sectionTitle} className="text-foreground mb-1.5">
        {copy.title}
      </p>
      <p style={{ ...TYPOGRAPHY.caption, lineHeight: 1.6 }} className="text-muted-foreground">
        {copy.message}
      </p>
      <RecommendationWhyToggle whyLabel={copy.whyLabel} whyText={copy.whyText} />
      {rec.articleIds && rec.articleIds.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate(rec.articleIds![0], rec.id)}
          className={`mt-3.5 ${buttonStyles({ variant: 'default', size: 'sm' })}`}
          style={TYPOGRAPHY.micro}
        >
          {copy.ctaLabel}
        </motion.button>
      )}
    </div>
  );
}
