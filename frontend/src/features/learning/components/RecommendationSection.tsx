import { TYPOGRAPHY, SHADOW } from '@/shared/design';
import { RecommendationCard } from './RecommendationCard';
import type { RecommendationItem } from '../model/recommendation.types';

interface Props {
  recommendations: RecommendationItem[];
  onNavigate: (articleId: string, recId: string) => void;
}

export function RecommendationSection({ recommendations, onNavigate }: Props) {
  if (recommendations.length === 0) return null;

  return (
    <div>
      <p style={{ ...TYPOGRAPHY.sectionTitle, marginBottom: 12 }} className="text-foreground">
        Таны зөвлөмж
      </p>
      <div className="rounded-[20px] bg-card overflow-hidden" style={{ boxShadow: SHADOW.card }}>
        {recommendations.map((rec, i) => (
          <div key={rec.id}>
            {i > 0 && (
              <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.055)', marginInline: 16 }} />
            )}
            <div className="px-4 py-4">
              <RecommendationCard rec={rec} onNavigate={onNavigate} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
