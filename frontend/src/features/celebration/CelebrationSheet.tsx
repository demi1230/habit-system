import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { HabitIconSlot } from '@/components/habit-icon-slot';
import { getHabitColor, CTA_DARK } from '@/lib/habit-colors';
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

export function CelebrationSheet({ habit, logId, userId, ctx, onClose }: Props) {
  const [selectedFeel, setSelectedFeel] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyRating | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const color = getHabitColor(habit.color);
  const copy = getCelebrationCopy(ctx, habit.title);


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
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.30)' }}
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: 380, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 380, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[24px] overflow-hidden"
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.10)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[3px] rounded-full" style={{ backgroundColor: 'var(--surface-strong)' }} />
        </div>

        {/* Hero row */}
        <div className="flex items-center gap-4 px-5 pt-3 pb-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.08 }}
            className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: color.btn }}
          >
            <HabitIconSlot iconValue={habit.iconValue} emojiSizePx={24} circlePx={24} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p style={{ ...TYPOGRAPHY.cardTitle, fontSize: 16.5, fontWeight: 700 }} className="text-foreground">
              {copy.headline}
            </p>
            <p style={{ ...TYPOGRAPHY.caption, fontSize: 12.5, marginTop: 2 }} className="text-muted-foreground">
              {copy.subline}
            </p>
          </div>

          <button
            onClick={handleClose}
            className={`${buttonStyles({ variant: 'nav', size: 'iconSm' })} shrink-0`}
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-muted-soft)' }} strokeWidth={2} />
          </button>
        </div>

        {/* Streak pill — styled like HabitTag on the habit card */}
        {ctx.streak > 0 && (
          <div className="px-5 pb-4">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 rounded-full"
              style={{ backgroundColor: 'var(--surface-subtle)', height: 30 }}
            >
              <svg width="14" height="14" viewBox="0 0 23 24" fill="none" style={{ flexShrink: 0 }}>
                <path d={svgPaths.p29fc8c00} fill="var(--foreground)" fillRule="evenodd" clipRule="evenodd" />
              </svg>
              <span style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: 'var(--foreground)' }}>
                {ctx.streak}
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'var(--surface-border-soft)' }} />

        <div className="px-5 pt-4">
          {/* Benefits */}
          {habit.benefits && habit.benefits.length > 0 && (
            <div className="mb-4">
              <p style={{ ...TYPOGRAPHY.caption, color: 'var(--text-muted-soft)', marginBottom: 8 }}>Ач тус</p>
              <div className="flex flex-wrap gap-2">
                {habit.benefits.map(b => (
                  <span key={b} className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: color.btn, ...TYPOGRAPHY.caption, color: '#202325' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feel chips */}
          <p style={{ ...TYPOGRAPHY.caption, color: 'var(--text-muted-soft)', marginBottom: 10 }}>
            Дадлаа хийсний дараа ямар мэдрэмж төрч байна?
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
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
            className="w-full rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none mb-4"
            style={{ ...TYPOGRAPHY.bodySm, backgroundColor: 'var(--surface-muted)', border: '1px solid var(--surface-border-soft)', outline: 'none', minHeight: 56, maxHeight: 80 }}
            rows={2}
          />

          {/* Difficulty */}
          <p style={{ ...TYPOGRAPHY.caption, color: 'var(--text-muted-soft)', marginBottom: 8 }}>
            Хэр хэцүү байсан бэ?
          </p>
          <div className="flex gap-2 mb-5">
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
                  <span style={{ fontSize: 18 }}>{opt.emoji}</span>
                  <span style={{ ...TYPOGRAPHY.micro, fontSize: 9, fontWeight: active ? 600 : 400, color: active ? color.accent : 'var(--text-muted-soft)' }}>
                    {opt.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
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
        </div>

        <div style={{ height: 'max(8px, env(safe-area-inset-bottom))' }} />
      </motion.div>
    </>
  );
}
