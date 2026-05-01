import { motion } from 'motion/react';
import type { Weekday } from '@/api/types';

export const WEEKDAYS: ReadonlyArray<{ en: Weekday; mn: string }> = [
  { en: 'MONDAY',    mn: 'Да' },
  { en: 'TUESDAY',   mn: 'Мя' },
  { en: 'WEDNESDAY', mn: 'Лх' },
  { en: 'THURSDAY',  mn: 'Пү' },
  { en: 'FRIDAY',    mn: 'Ба' },
  { en: 'SATURDAY',  mn: 'Бя' },
  { en: 'SUNDAY',    mn: 'Ня' },
];

export const WEEKDAY_KEYS: Weekday[] = WEEKDAYS.map(d => d.en);
export const WORKDAY_KEYS: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

interface WeekdayStripProps {
  /** Days that should appear selected. */
  selectedDays: Weekday[];
  /** Background color used for the active chip (typically the pastel `color.btn`). */
  accentBg: string;
  /** Color of the focus ring on active chips (typically the deep `color.accent`). */
  accentRing: string;
  /** When provided, chips become buttons that call this on tap. */
  onToggle?: (day: Weekday) => void;
}

/**
 * Unified Mon–Sun weekday chip strip used by both the habit form (interactive)
 * and the habit detail page (read-only). Pass `onToggle` to enable taps.
 */
export function WeekdayStrip({ selectedDays, accentBg, accentRing, onToggle }: WeekdayStripProps) {
  const interactive = !!onToggle;

  return (
    <div className="flex gap-1.5">
      {WEEKDAYS.map(({ en, mn }) => {
        const active = selectedDays.includes(en);
        const className = 'flex-1 py-2 rounded-[30px] flex items-center justify-center';
        const style: React.CSSProperties = {
          backgroundColor: active ? accentBg : 'var(--surface-muted)',
          boxShadow: active ? `0 0 0 1.5px ${accentRing}50` : 'none',
          fontSize: 11,
          fontWeight: active ? 600 : 400,
          color: active ? '#202325' : 'var(--text-faint)',
        };

        if (interactive) {
          return (
            <motion.button
              key={en}
              whileTap={{ scale: 0.82 }}
              onClick={() => onToggle(en)}
              className={className}
              style={style}
            >
              {mn}
            </motion.button>
          );
        }

        return (
          <div key={en} className={className} style={style}>
            {mn}
          </div>
        );
      })}
    </div>
  );
}
