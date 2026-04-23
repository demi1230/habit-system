import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { ARTICLE_CATALOG } from '../features/learning/content/articles';
import { useLogArticleInteraction } from '../features/learning/hooks/useRecommendations';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';

const CATEGORY_LABELS = {
  habit_building: 'Дадал эхлүүлэх',
  cues: 'Өдөөгч ба орчин',
  consistency: 'Тогтвортой байдал',
  motivation: 'Урам ба эсэргүүцэл',
  advanced: 'Ахисан түвшин',
} as const;

export function ArticleDetailPage() {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const { userId } = useAuth();
  const { mutate: logArticleInteraction } = useLogArticleInteraction(userId || '');

  const article = articleId && ARTICLE_CATALOG[articleId as keyof typeof ARTICLE_CATALOG];

  const handleReturn = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/learn');
  };

  useEffect(() => {
    if (articleId && userId) {
      logArticleInteraction({
        articleId,
        interactionType: 'OPENED',
        sourceType: 'LEARNING_PAGE',
      });
    }
  }, [articleId, userId, logArticleInteraction]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold text-foreground">Өгүүлэл олдсонгүй</p>
          <button onClick={handleReturn} className={buttonStyles({ variant: 'link', size: 'inline' })}>
            Өмнөх хуудас руу буцах
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    if (articleId && userId) {
      logArticleInteraction({
        articleId,
        interactionType: 'COMPLETED',
        sourceType: 'LEARNING_PAGE',
      });
    }

    handleReturn();
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid var(--surface-border-faint)' }}>
        <div className="flex items-center gap-3 px-5 pb-3 pt-13">
          <button onClick={handleReturn} className={buttonStyles({ variant: 'nav', size: 'icon' })}>
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <p style={TYPOGRAPHY.navTitle} className="flex-1 text-foreground">
            Өгүүлэл
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6">
        <div className="mb-6">
          <h1
            style={{ ...TYPOGRAPHY.pageTitle, fontSize: 24, fontWeight: 550, lineHeight: 1.2 }}
            className="mb-3 text-foreground">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" style={{ color: 'var(--text-faint)' }} />
              <span style={{ ...TYPOGRAPHY.bodySm, color: 'var(--text-soft)' }}>{article.readTimeMinutes} мин уншина</span>
            </div>

            <div
              className="rounded-full"
              style={{
                ...TYPOGRAPHY.caption,
                padding: '4px 10px',
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--text-soft)',
              }}>
              {CATEGORY_LABELS[article.category]}
            </div>
          </div>
        </div>

        <p
          style={{
            ...TYPOGRAPHY.body,
            lineHeight: 1.6,
            borderBottom: '1px solid var(--surface-border-faint)',
            color: 'var(--text-soft)',
          }}
          className="mb-8 pb-6">
          {article.shortDescription}
        </p>

        <div className="space-y-8">
          {article.body.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}>
              <h2 style={TYPOGRAPHY.pageTitle} className="mb-3 text-foreground">
                {section.title}
              </h2>
              <p style={{ ...TYPOGRAPHY.body, lineHeight: 1.7, color: 'var(--text-soft)' }} className="whitespace-pre-wrap">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {article.relatedArticleIds && article.relatedArticleIds.length > 0 && (
          <div className="mt-10 pt-8" style={{ borderTop: '1px solid var(--surface-border-faint)' }}>
            <p style={TYPOGRAPHY.sectionTitle} className="mb-4 text-foreground">
              Холбоотой өгүүлэл
            </p>

            <div className="space-y-3">
              {article.relatedArticleIds.map((relatedId) => {
                const relatedArticle = ARTICLE_CATALOG[relatedId as keyof typeof ARTICLE_CATALOG];
                if (!relatedArticle) return null;

                return (
                  <button
                    key={relatedId}
                    onClick={() => navigate(`/learn/articles/${relatedId}`)}
                    className="w-full rounded-[18px] px-4 py-3 text-left transition-all hover:opacity-95"
                    style={{
                      border: '1px solid var(--surface-border-faint)',
                      backgroundColor: 'var(--surface-muted)',
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500, color: 'var(--text-strong)' }}
                          className="break-words">
                          {relatedArticle.title}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span style={{ ...TYPOGRAPHY.caption, color: 'var(--text-soft)' }}>{relatedArticle.readTimeMinutes} мин</span>
                        <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-faint)' }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 pt-8"
          style={{ borderTop: '1px solid var(--surface-border-faint)' }}>
          <button onClick={handleComplete} className={`w-full ${buttonStyles({ variant: 'default', size: 'lg' })}`}>
            Уншиж дууслаа
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
