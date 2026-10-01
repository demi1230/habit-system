import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import type { HabitWithCueContext } from '@/api/types';
import { HabitIconSlot } from './habit-icon-slot';
import { getHabitColor } from '@/lib/habit-colors';
import { TYPOGRAPHY, SHADOW, AppPlusIcon } from '@/shared/design';
import { svgPaths } from '@/lib/svg-paths';

export type DashboardHabit = Pick<HabitWithCueContext, 'id' | 'title' | 'color' | 'iconValue' | 'currentStreak' | 'strengthScore' | 'targetValue' | 'measurementUnit'>;
interface LogEntry { value: number; status: 'partial' | 'done'; logId?: string }

const PASTEL_CARD_INK = 'var(--pastel-card-ink)';
const PASTEL_CARD_MUTED = 'var(--pastel-card-muted)';
const PASTEL_CARD_SUBTLE = 'var(--pastel-card-subtle)';
const PASTEL_CARD_PILL_BG = 'var(--pastel-card-pill-bg)';
const PASTEL_CARD_ICON_BG = 'var(--pastel-card-icon-bg)';
const PASTEL_CARD_ACTION_BG = 'var(--pastel-card-action-bg)';

function HabitTag({ value, icon, onClick }: { value: string | number; icon: 'dumbbell' | 'flame'; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: PASTEL_CARD_PILL_BG, border: `1px solid ${PASTEL_CARD_SUBTLE}`, height: 30, cursor: onClick ? 'pointer' : undefined }}>
      <svg
        width="16"
        height="16"
        viewBox={icon === 'dumbbell' ? '0 0 26 25.0006' : '0 0 23 24'}
        fill="none"
        style={{ flexShrink: 0 }}>
        <path
          d={icon === 'dumbbell' ? svgPaths.p2eaaee80 : svgPaths.p29fc8c00}
          fill={PASTEL_CARD_INK}
          fillRule={icon === 'flame' ? 'evenodd' : undefined}
          clipRule={icon === 'flame' ? 'evenodd' : undefined}
        />
      </svg>
      <span style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: PASTEL_CARD_INK }}>
        {typeof value === 'number' ? Math.min(100, Math.max(0, value)) : value}
      </span>
    </div>
  );
}

function isBinaryHabit(habit: DashboardHabit) {
  return habit.targetValue === 1 && (habit.measurementUnit === 'удаа' || habit.measurementUnit === 'times' || habit.measurementUnit === 'boolean');
}

function calcProgress(habit: DashboardHabit, loggedValue: number): number {
  if (isBinaryHabit(habit)) return loggedValue > 0 ? 100 : 0;
  return Math.min((loggedValue / (habit.targetValue || 1)) * 100, 100);
}

function StatusBadge({ habit, entry, onTap, color, disabled }: {
  habit: DashboardHabit;
  entry?: LogEntry;
  onTap: () => void;
  color: ReturnType<typeof getHabitColor>;
  disabled?: boolean;
}) {
  const target = habit.targetValue || 1;
  const status = entry?.status ?? 'none';
  const val    = entry?.value ?? 0;

  const fmtVal = Number.isInteger(val) ? val : Math.round(val * 100) / 100;
  const fmtTarget = Number.isInteger(target) ? target : Math.round(target * 100) / 100;
  const countLabel = !isBinaryHabit(habit) && target
    ? `${fmtVal}/${fmtTarget} ${habit.measurementUnit || ''}`
    : status === 'done' ? '1/1 удаа' : '0/1 удаа';

  return (
    <button type="button" disabled={disabled || status === 'done'} aria-label={`${habit.title}: ${status === 'done' ? 'Хийсэн' : 'Бүртгэх'}`} className="flex flex-col items-center gap-1.5 shrink-0"
      style={{ width: 72, opacity: disabled ? 0.35 : 1 }}
      onClick={e => { e.stopPropagation(); if (!disabled) onTap(); }}>
      <span style={{ ...TYPOGRAPHY.micro, whiteSpace: 'nowrap', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 72, color: PASTEL_CARD_MUTED }}>
        {countLabel}
      </span>

      {status === 'done' ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color.accent }}>
          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
        </motion.div>
      ) : status === 'partial' ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-10 h-10 relative flex items-center justify-center cursor-pointer">
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--surface-strong)" strokeWidth="3.5" />
            <motion.circle
              cx="20" cy="20" r="16" fill="none"
              stroke={color.accent} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={100.5}
              initial={{ strokeDashoffset: 100.5 }}
              animate={{ strokeDashoffset: 100.5 * (1 - (entry ? calcProgress(habit, entry.value) / 100 : 0)) }}
              transition={{ duration: 0.4 }}
            />
          </svg>
          <AppPlusIcon className="absolute w-3.5 h-3.5" style={{ color: color.accent }} />
        </motion.div>
      ) : (
        <motion.span whileTap={{ scale: 0.86 }}
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: PASTEL_CARD_ACTION_BG, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
          <AppPlusIcon className="w-4 h-4" style={{ color: color.accent }} />
        </motion.span>
      )}
    </button>
  );
}

// ── Habit Card ──────────────────────────────────────────────────
export function DashboardHabitCard({ habit, index, entry, onBadgeTap, disabled }: {
  habit: DashboardHabit;
  index: number;
  entry?: LogEntry;
  onBadgeTap: () => void;
  disabled?: boolean;
}) {
  const navigate   = useNavigate();
  const color      = getHabitColor(habit.color);
  const status     = entry?.status ?? 'none';
  const pct        = entry ? calcProgress(habit, entry.value) : 0;

  const [chipMsg, setChipMsg] = useState<string | null>(null);
  const chipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flash = (msg: string) => {
    clearTimeout(chipTimer.current);
    setChipMsg(msg);
    chipTimer.current = setTimeout(() => setChipMsg(null), 3000);
  };
  useEffect(() => () => clearTimeout(chipTimer.current), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + index * 0.07, type: 'spring', stiffness: 280, damping: 28 }}
    >
      <div
        className="rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform relative"
        style={{ backgroundColor: color.card, boxShadow: SHADOW.card, border: `1px solid ${PASTEL_CARD_SUBTLE}` }}
        onClick={() => navigate(`/habit/${habit.id}`, { state: { from: '/dashboard' } })}
      >
        {/* Progress fill layer */}
        <motion.div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          animate={{ width: `${pct}%` }}
          initial={{ width: '0%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: pct > 0
              ? `linear-gradient(135deg, ${color.accent}88 0%, ${color.accent}66 100%)`
              : 'transparent',
            boxShadow: pct > 0 ? `inset -1px 0 0 ${color.accent}22` : 'none',
          }}
        />

        {/* Card content */}
        <div className="relative z-10 flex items-center justify-between px-4 py-4 gap-3">
          {/* Icon */}
          <div className="shrink-0">
            <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: PASTEL_CARD_ICON_BG,
                opacity: status === 'done' ? 0.55 : 1, transition: 'opacity 0.3s',
              }}>
              <HabitIconSlot iconValue={habit.iconValue} emojiSizePx={26} circlePx={26} />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 min-w-0 gap-2">
            <p style={{
              ...TYPOGRAPHY.cardTitle, fontSize: 13, fontWeight: 600, lineHeight: 1.35,
              color: PASTEL_CARD_INK,
              textDecoration: status === 'done' ? 'line-through' : 'none',
              opacity: status === 'done' ? 0.5 : 1,
              transition: 'opacity 0.3s',
            }}>
              {habit.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {habit.currentStreak > 0 && (
                <HabitTag
                  icon="flame"
                  value={`${habit.currentStreak} өдөр`}
                  onClick={e => { e.stopPropagation(); flash(`Та ${habit.currentStreak} өдөр тасралтгүй "${habit.title}" дадлаа хийсэн байна.`); }}
                />
              )}
              <HabitTag
                icon="dumbbell"
                value={habit.strengthScore}
                onClick={e => { e.stopPropagation(); flash(`"${habit.title}" дадлын хүч ${habit.strengthScore} оноо байна.`); }}
              />
            </div>
          </div>

          {/* Badge */}
          <StatusBadge
            habit={habit}
            entry={entry}
            onTap={onBadgeTap}
            color={color}
            disabled={disabled}
          />
        </div>

        {/* Chip message strip */}
        <AnimatePresence>
          {chipMsg && (
            <motion.div
              key="chip-msg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 px-4 pb-3">
                <p style={{ ...TYPOGRAPHY.micro, color: PASTEL_CARD_MUTED, flex: 1, lineHeight: 1.45 }}>{chipMsg}</p>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/analytics?habitId=${habit.id}`); }}
                  style={{ ...TYPOGRAPHY.micro, fontWeight: 700, color: PASTEL_CARD_INK, whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Ахиц харах →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Swipeable Habit Card ────────────────────────────────────────
