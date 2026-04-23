import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { getHabitColor, CTA_DARK } from '@/lib/habit-colors';
import { shareAchievement } from '@/lib/share-achievement';
import { svgPaths } from '@/lib/svg-paths';
import { feedbackApi } from '@/api/feedback';
import type { DifficultyRating, HabitWithCueContext } from '@/api/types';
import { getCelebrationCopy, FEEL_CHIPS, DIFFICULTY_OPTIONS } from './copy';
import type { CelebrationContext } from './types';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';

interface Props {
  habit: HabitWithCueContext;
  logId: string;
  userId: string;
  ctx: CelebrationContext;
  onClose: () => void;
}

export function CelebrationFullScreen({ habit, logId, userId, ctx, onClose }: Props) {
  const [selectedFeel, setSelectedFeel] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyRating | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const color = getHabitColor(habit.color);
  const copy = getCelebrationCopy(ctx, habit.title);

  const handleShare = async () => {
    const badgeLabel = 'badgeLabel' in copy ? copy.badgeLabel ?? null : null;
    await shareAchievement({
      title: copy.headline,
      subtitle: copy.subline,
      accentColor: color.accent,
      badgeLabel,
      xpLabel: ctx.streak > 0 ? `${ctx.streak} өдөр дараалсан` : null,
      text: `${copy.headline} ${copy.subline}`,
    });
  };

  const toggleFeel = (id: string) => {
    setSelectedFeel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleClose = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (selectedDifficulty) {
        await feedbackApi.submitDifficulty(userId, habit.id, logId, selectedDifficulty);
      }
      const feels = FEEL_CHIPS.filter(c => selectedFeel.has(c.id)).map(c => c.label).join(', ');
      const combined = [feels, reflectionText.trim()].filter(Boolean).join('. ');
      if (combined) {
        await feedbackApi.submitReflection(userId, habit.id, logId, combined);
      }
    } catch (err) {
      console.error('Celebration feedback failed:', err);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background"
    >
      {/* Skip */}
      <div className="flex justify-end px-5 pt-5 shrink-0">
        <button
          onClick={handleClose}
          className={buttonStyles({ variant: 'nav', size: 'iconSm' })}
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          <X className="w-4 h-4" style={{ color: 'var(--text-muted-soft)' }} strokeWidth={2} />
        </button>
      </div>

      {/* Hero area */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 shrink-0">
        {/* Pulsing rings + icon */}
        <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
          {[0, 0.5, 1.0].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: `1.5px solid ${color.accent}` }}
              animate={{ scale: [1, 2.4], opacity: [0.28, 0] }}
              transition={{ duration: 2.8, delay, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.45, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="w-[90px] h-[90px] rounded-[26px] flex items-center justify-center"
            style={{ backgroundColor: color.btn }}
          >
            <span style={{ fontSize: 44 }}>{habit.iconValue || '✨'}</span>
          </motion.div>
        </div>

        {/* Headline + subline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 24 }}
          className="text-center mt-7"
        >
          <p style={{ ...TYPOGRAPHY.pageTitle, fontSize: 30, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.15 }} className="text-foreground">
            {copy.headline}
          </p>
          <p style={{ ...TYPOGRAPHY.navTitle, marginTop: 8, lineHeight: 1.55 }} className="text-muted-foreground">
            {copy.subline}
          </p>
          <p style={{ ...TYPOGRAPHY.caption, fontSize: 12.5, marginTop: 6, color: color.accent }}>
            {copy.detail}
          </p>
        </motion.div>

        {/* Achievement badge */}
        {'badgeLabel' in copy && copy.badgeLabel && (
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 24 }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-[18px] mt-6"
            style={{
              backgroundColor: color.accent + '15',
              boxShadow: `0 2px 14px ${color.accent}22`,
            }}
          >
            {ctx.milestoneKind === 'streak' ? (
              <svg width="22" height="22" viewBox="0 0 23 24" fill="none" style={{ flexShrink: 0 }}>
                <path d={svgPaths.p29fc8c00} fill={color.accent} fillRule="evenodd" clipRule="evenodd" />
              </svg>
            ) : (
              <span style={{ fontSize: 22 }}>{copy.badgeIcon}</span>
            )}
            <span style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 700, color: color.accent }}>{copy.badgeLabel}</span>
          </motion.div>
        )}

        {/* Streak pill (if not already in badge) */}
        {ctx.streak > 0 && ctx.milestoneKind !== 'streak' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.42 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mt-3"
            style={{ ...TYPOGRAPHY.micro, fontSize: 11.5, fontWeight: 600, backgroundColor: color.accent + '14', color: color.accent }}
          >
            <svg width="13" height="13" viewBox="0 0 23 24" fill="none">
              <path d={svgPaths.p29fc8c00} fill={color.accent} fillRule="evenodd" clipRule="evenodd" />
            </svg>
            {ctx.streak} өдрийн дараалал
          </motion.span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'var(--surface-border-soft)', flexShrink: 0 }} />

      {/* Feedback section */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.48, type: 'spring', stiffness: 240, damping: 26 }}
        className="px-5 pt-5 flex-1"
      >
        {/* Feel chips */}
        <p style={{ ...TYPOGRAPHY.caption, color: 'var(--text-muted-soft)', marginBottom: 10 }}>
          Та яаж мэдрэж байна?
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {FEEL_CHIPS.map(chip => {
            const active = selectedFeel.has(chip.id);
            return (
              <motion.button
                key={chip.id}
                whileTap={{ scale: 0.91 }}
                onClick={() => toggleFeel(chip.id)}
                className={buttonStyles({ variant: 'chip', size: 'default' })}
                style={{
                  ...TYPOGRAPHY.bodySm,
                  fontWeight: active ? 600 : 400,
                  backgroundColor: active ? color.accent + '18' : 'var(--surface-subtle)',
                  color: active ? color.accent : 'var(--text-soft)',
                  border: active ? `1.5px solid ${color.accent}50` : '1.5px solid transparent',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                {chip.label}
              </motion.button>
            );
          })}
        </div>

        {/* Reflection textarea */}
        <textarea
          value={reflectionText}
          onChange={e => setReflectionText(e.target.value.slice(0, 200))}
          placeholder="Тэмдэглэл бичих... (заавал биш)"
          className="w-full rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none mb-5"
          style={{ ...TYPOGRAPHY.bodySm, backgroundColor: 'var(--surface-muted)', border: '1px solid var(--surface-border-soft)', outline: 'none', minHeight: 56, maxHeight: 80 }}
          rows={2}
        />

        {/* Difficulty */}
        <p style={{ ...TYPOGRAPHY.caption, color: 'var(--text-muted-soft)', marginBottom: 10 }}>
          Хэр хэцүү байсан бэ?
        </p>
        <div className="flex gap-2 mb-7">
          {DIFFICULTY_OPTIONS.map(opt => {
            const active = selectedDifficulty === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.88 }}
                onClick={() => setSelectedDifficulty(prev => prev === opt.value ? null : opt.value)}
                className={`flex-1 flex flex-col items-center gap-0.5 ${buttonStyles({ variant: 'chip', size: 'default' })}`}
                style={{
                  backgroundColor: active ? color.accent + '18' : 'var(--surface-subtle)',
                  border: active ? `1.5px solid ${color.accent}` : '1.5px solid transparent',
                  transition: 'background-color 0.15s',
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                <span style={{ ...TYPOGRAPHY.micro, fontSize: 9.5, fontWeight: active ? 600 : 400, color: active ? color.accent : 'var(--text-muted-soft)' }}>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className={`w-full mb-3 ${buttonStyles({ variant: 'secondary', size: 'lg' })}`}
          style={{
            backgroundColor: color.btn,
            color: color.accent,
            ...TYPOGRAPHY.sectionTitle,
            fontSize: 14.5,
            fontWeight: 600,
          }}
        >
          Share achievement
        </motion.button>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleClose}
          disabled={submitting}
          className={`w-full ${buttonStyles({ variant: 'default', size: 'lg' })}`}
          style={{
            backgroundColor: CTA_DARK.bg,
            boxShadow: CTA_DARK.shadow,
            color: CTA_DARK.text,
            ...TYPOGRAPHY.sectionTitle,
            fontSize: 14.5,
            fontWeight: 600,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Хадгалж байна...' : 'Үргэлжлүүлэх'}
        </motion.button>
      </motion.div>

      <div style={{ height: 'max(24px, env(safe-area-inset-bottom))' }} className="shrink-0" />
    </motion.div>
  );
}
