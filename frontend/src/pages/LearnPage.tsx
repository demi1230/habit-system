import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TYPOGRAPHY } from '@/shared/design';
import { LEARNING_TOPICS } from '../features/learning/content/learning-topics';
import { RecommendedArticlesSection } from '../features/learning/components/RecommendedArticlesSection';
import { TopicChips } from '../features/learning/components/TopicChips';
import { LearningLibrarySection } from '../features/learning/components/LearningLibrarySection';
import { useLearnPageState } from '../features/learning/hooks/useLearnPageState';
import { BottomNav } from '@/components/bottom-nav';

export function LearnPage() {
  const { recommendations, recommendedArticles, remainingArticles, openArticle } =
    useLearnPageState();

  const [activeTopic, setActiveTopic] = useState(LEARNING_TOPICS[0]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const articleId = searchParams.get('articleId');
    if (articleId) navigate(`/learn/articles/${articleId}`, { replace: true });
  }, [searchParams, navigate]);

  const hasRecs = recommendations.length > 0;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* <div
        className="sticky top-0 z-20 bg-background"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-2 px-5 pt-13 pb-3">
          <p style={TYPOGRAPHY.pageTitle} className="text-foreground">
            Суралцах
          </p>
        </div>
      </div> */}

      <div className="px-5 pt-12 flex flex-col gap-6">
        {hasRecs && (
          <div>
            <RecommendedArticlesSection
              articles={recommendedArticles}
              onOpen={(id) => openArticle(id, 'RECOMMENDATION')}
            />
          </div>
        )}

        <div>
          <p style={{ ...TYPOGRAPHY.sectionTitle, marginBottom: 12 }} className="text-foreground">
            Бусад нийтлэлүүд
          </p>
          <TopicChips
            topics={LEARNING_TOPICS}
            activeId={activeTopic.id}
            onSelect={(id) =>
              setActiveTopic(LEARNING_TOPICS.find((topic) => topic.id === id) ?? LEARNING_TOPICS[0])
            }
          />
          <div className="mt-4">
            <LearningLibrarySection
              articles={remainingArticles}
              activeTopic={activeTopic}
              onOpen={(id) => openArticle(id, 'LEARNING_PAGE')}
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
