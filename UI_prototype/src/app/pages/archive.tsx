import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { BottomNav } from '../components/bottom-nav';
import { defaultHabits, getTagById } from '../store';
import { RotateCcw, Trophy } from 'lucide-react';
import { useT } from '../i18n';

export function ArchivePage() {
  const navigate = useNavigate();
  const t = useT();
  const archivedHabits = defaultHabits.filter((h) => h.archived);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h2 className="mb-1">{t('archive.title')}</h2>
        <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
          {t('archive.subtitle')}
        </p>
      </div>

      <div className="px-5">
        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 rounded-2xl p-4 mb-5 flex items-start gap-3"
        >
          <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p style={{ fontSize: '14px' }}>{t('archive.whatsHere')}</p>
            <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
              {t('archive.desc')}
            </p>
          </div>
        </motion.div>

        {archivedHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <p className="text-4xl mb-3" style={{ fontSize: '48px' }}>🗄️</p>
            <h3 className="text-muted-foreground">{t('archive.noHabits')}</h3>
            <p className="text-muted-foreground mt-1" style={{ fontSize: '14px' }}>
              {t('archive.noHabitsDesc')}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {archivedHabits.map((habit, i) => {
              const tag = getTagById(habit.goalTag);
              const catIcon = tag?.emoji || '✨';
              const catColor = tag?.color || '#6B9B8A';

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl p-4 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${catColor}20` }}
                    >
                      <span style={{ fontSize: '20px' }}>{catIcon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4>{habit.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full" style={{ fontSize: '11px' }}>
                          ✅ {t('archive.stabilized')}
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                          {habit.streak} {t('detail.days')} · {habit.completionRate}%
                        </span>
                      </div>
                    </div>
                    <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}