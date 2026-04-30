import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';
import type { HabitLog } from '@/api/types';
import type { Weekday } from '@/api/types';
import { getLatestLogsByDay } from '@/lib/habit-log-days';
import { toLocalDateStr } from '@/lib/dates';

// ── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

function withAlpha(color: string, alpha: number) {
  if (color.startsWith('#')) {
    const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return `${color}${hex}`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

const JS_TO_WD: Record<number, Weekday> = {
  0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
  4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
};

const WEEKDAY_LABELS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

function toMnMonthLabel(date: Date): string {
  return `${date.getFullYear()} оны ${date.getMonth() + 1}-р сар`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function MonthCalendar({
  logs,
  accent,
  scheduleDays,
  startDate,
}: {
  logs: HabitLog[];
  accent: string;
  scheduleDays?: string[];
  startDate?: string;
}) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = month.getFullYear();
  const m = month.getMonth();
  const daysCount = getDaysInMonth(year, m);
  const firstDay = getFirstDayOfMonth(year, m);

  const scheduledWdSet = useMemo(
    () => (scheduleDays && scheduleDays.length > 0 ? new Set(scheduleDays) : null),
    [scheduleDays],
  );

  const logDates = useMemo(() => {
    const s = new Set<string>();
    for (const [dateKey, log] of getLatestLogsByDay(logs)) {
      if (log.status === 'DONE') s.add(dateKey);
    }
    return s;
  }, [logs]);

  const today = toLocalDateStr(now);
  const startDateStr = startDate ? toLocalDateStr(new Date(startDate)) : null;
  const monthLabel = toMnMonthLabel(month);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOffset(o => o - 1)}
          className={buttonStyles({ variant: 'nav', size: 'iconSm' })}
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <p
          style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500 }}
          className="text-foreground"
        >
          {monthLabel}
        </p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOffset(o => Math.min(o + 1, 0))}
          disabled={offset >= 0}
          className={buttonStyles({ variant: 'nav', size: 'iconSm' })}
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </motion.button>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7,1fr)' }}>
        {WEEKDAY_LABELS.map(d => (
          <div
            key={d}
            className="text-center"
            style={{ ...TYPOGRAPHY.micro, color: 'var(--text-placeholder)', paddingBottom: 2 }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysCount }, (_, i) => {
          const date = new Date(year, m, i + 1);
          const dateStr = toLocalDateStr(date);
          const wd = JS_TO_WD[date.getDay()];
          const isScheduled = scheduledWdSet ? scheduledWdSet.has(wd) : true;
          const done = logDates.has(dateStr);
          const isToday = dateStr === today;
          const isFuture = dateStr > today;
          const isBeforeStart = startDateStr ? dateStr < startDateStr : false;

          const isMissed = isScheduled && !done && !isFuture && !isToday && !isBeforeStart;
          const isFutureScheduled = isScheduled && !done && isFuture && !isBeforeStart;

          let bg = 'transparent';
          let border = 'none';
          let textColor = isScheduled ? 'var(--text-soft)' : 'var(--text-disabled)';
          let fontWeight: number = isScheduled ? 500 : 400;

          if (done) {
            bg = withAlpha(accent, 0.14);
            textColor = accent;
            fontWeight = 700;
          } else if (isMissed) {
            bg = 'var(--surface-muted)';
            textColor = 'var(--text-placeholder)';
          } else if (isFutureScheduled) {
            bg = 'var(--surface-subtle)';
            textColor = 'var(--text-placeholder)';
          } else if (!isScheduled || isBeforeStart) {
            bg = 'transparent';
            textColor = 'var(--text-disabled)';
            fontWeight = 400;
          }

          if (isToday) {
            border = `1.5px solid ${isScheduled ? accent : 'var(--text-disabled)'}`;
            if (!done) textColor = isScheduled ? accent : 'var(--text-placeholder)';
          }

          return (
            <div
              key={dateStr}
              className="flex items-center justify-center"
              style={{ aspectRatio: '1', borderRadius: 10, backgroundColor: bg, border }}
            >
              <span style={{ fontSize: 11, fontWeight, color: textColor }}>{i + 1}</span>
            </div>
          );
        })}
      </div>

      {scheduledWdSet && (
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: withAlpha(accent, 0.14),
                border: `1px solid ${withAlpha(accent, 0.33)}`,
              }}
            />
            <span style={TYPOGRAPHY.micro} className="text-muted-foreground">Биэлсэн</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--surface-border-soft)' }}
            />
            <span style={TYPOGRAPHY.micro} className="text-muted-foreground">Дутуу</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'transparent' }} />
            <span style={{ ...TYPOGRAPHY.micro, color: 'var(--text-placeholder)' }}>Амралт</span>
          </div>
        </div>
      )}
    </div>
  );
}
