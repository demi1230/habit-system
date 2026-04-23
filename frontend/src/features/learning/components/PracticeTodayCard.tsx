import { Zap } from 'lucide-react';
import { TYPOGRAPHY, SHADOW } from '@/shared/design';
import { getPracticeTip } from '../content/learning-practice-copy';
import type { RecommendationItem } from '../model/recommendation.types';

interface Props {
  recommendations: RecommendationItem[];
}

export function PracticeTodayCard({ recommendations }: Props) {
  const topCode = recommendations[0]?.recommendationCode ?? '';
  const tip = getPracticeTip(topCode);

  return (
    <div className="rounded-[20px] px-4 py-4 bg-card" style={{ boxShadow: SHADOW.card }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4" style={{ color: '#E8A87C' }} />
        <span style={TYPOGRAPHY.sectionTitle} className="text-foreground">
          Өнөөдөр туршиж үзэх
        </span>
      </div>
      <p
        style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, lineHeight: 1.65 }}
        className="text-foreground"
      >
        {tip.action}
      </p>
      <p
        style={{ ...TYPOGRAPHY.caption, lineHeight: 1.55, marginTop: 6 }}
        className="text-muted-foreground"
      >
        {tip.detail}
      </p>
    </div>
  );
}
