import { BottomNav } from '@/components/bottom-nav';
import { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Delete, Check, Flame, Zap, Pencil, Undo2 } from 'lucide-react';
import { getHabitColor, CTA_DARK } from '@/lib/habit-colors';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import { feedbackApi } from '@/api/feedback';
import type { HabitWithCueContext, DifficultyRating } from '@/api/types';

const MN_DAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

/** Local ISO string (YYYY-MM-DDTHH:mm:ss) — avoids UTC shift from toISOString */
function toLocalISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ── Logged entry ────────────────────────────────────────────────
interface LogEntry { value: number; status: 'partial' | 'done'; logId?: string }

function isBinaryHabit(habit: HabitWithCueContext) {
  return habit.targetValue === 1 && (habit.measurementUnit === 'удаа' || habit.measurementUnit === 'times' || habit.measurementUnit === 'boolean');
}

function calcProgress(habit: HabitWithCueContext, loggedValue: number): number {
  if (isBinaryHabit(habit)) return loggedValue > 0 ? 100 : 0;
  return Math.min((loggedValue / (habit.targetValue || 1)) * 100, 100);
}

function calcStatus(habit: HabitWithCueContext, value: number): 'none' | 'partial' | 'done' {
  if (isBinaryHabit(habit)) return value > 0 ? 'done' : 'none';
  const target = habit.targetValue || 1;
  if (value >= target) return 'done';
  if (value > 0) return 'partial';
  return 'none';
}

// ── Quick Log Number Pad ───────────────────────────────────────
function QuickLogSheet({ habit, onClose, onLog, currentValue = 0 }: {
  habit: HabitWithCueContext;
  onClose: () => void;
  onLog: (value: number) => void;
  currentValue?: number;
}) {
  const [input, setInput] = useState('');
  const color    = getHabitColor(habit.color);
  const addValue = parseFloat(input) || 0;
  const numValue = currentValue + addValue;
  const target   = habit.targetValue || 1;
  const min      = habit.minimumTarget ?? 1;
  const status   = calcStatus(habit, numValue);
  const pct      = calcProgress(habit, numValue);
  const habitIcon = habit.iconValue || '✨';

  const handleKey = (key: string) => {
    if (key === 'AC') { setInput(''); return; }
    if (key === '⌫')  { setInput(p => p.slice(0, -1)); return; }
    if (key === '.' && input.includes('.')) return;
    if (key === '.' && input === '') { setInput('0.'); return; }
    if (input.length >= 6) return;
    setInput(p => p === '0' && key !== '.' ? key : p + key);
  };

  const canConfirm = addValue > 0;

  const statusLabel =
    status === 'done'    ? '✓ Зорилт биелэв!' :
    numValue > 0 ? `${numValue}/${target} ${habit.measurementUnit || ''}` :
    `Зорилт: ${target} ${habit.measurementUnit || ''}`;

  const statusColor =
    status === 'done' ? color.accent : status === 'partial' ? color.ring : 'rgba(0,0,0,0.35)';

  const keys = [
    ['1','2','3','AC'],
    ['4','5','6','⌫'],
    ['7','8','9',''],
    ['','0','.','✓'],
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/25 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      >
        <div className="w-full max-w-[430px] rounded-t-[28px] overflow-hidden bg-card"
          style={{ boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-9 h-[3px] rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
          </div>

          {/* Habit header */}
          <div className="flex items-center gap-3 px-5 pb-4">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: color.btn }}>
              <span style={{ fontSize: 18 }}>{habitIcon}</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }} className="text-foreground">{habit.title}</p>
              <p style={{ fontSize: 11 }} className="text-muted-foreground">
                {currentValue > 0 ? `Одоогийн: ${currentValue} ${habit.measurementUnit || ''} · Нэмэх` : 'Хурдан бүртгэл'}
              </p>
            </div>
          </div>

          {/* Number display */}
          <div className="px-6 pb-2 text-center">
            <div className="flex items-end justify-center gap-2">
              <span style={{
                fontSize: 56, fontWeight: 600, letterSpacing: '-2px', lineHeight: 1,
                color: status === 'done' ? color.accent : status === 'partial' ? color.ring : undefined,
                transition: 'color 0.2s',
              }} className="text-foreground">
                {currentValue > 0 && addValue > 0 ? numValue : (input || '0')}
              </span>
              {habit.measurementUnit && (
                <span style={{ fontSize: 18, paddingBottom: 10, fontWeight: 500 }} className="text-muted-foreground">
                  {habit.measurementUnit}
                </span>
              )}
            </div>
            {currentValue > 0 && addValue > 0 && (
              <p style={{ fontSize: 12, marginTop: 4 }} className="text-muted-foreground">
                {currentValue} + {addValue}
              </p>
            )}

            {/* Progress */}
            <div className="mt-3 mx-6">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
                <motion.div
                  animate={{ width: `${pct}%` }} transition={{ duration: 0.15 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: status === 'done' ? color.accent : color.ring }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                {min > 0 && min < target && (
                  <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.32)' }}>min {min}</span>
                )}
                <span style={{ fontSize: 11, color: statusColor, fontWeight: 600, marginLeft: 'auto' }}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Numpad */}
          <div className="px-4 pt-1 pb-2">
            {keys.map((row, ri) => (
              <div key={ri} className="flex gap-2.5 mb-2.5">
                {row.map((key, ki) => {
                  if (key === '') return <div key={ki} className="flex-1" />;
                  const isConfirm = key === '✓';
                  const isAC      = key === 'AC';
                  const isBS      = key === '⌫';
                  const active    = isConfirm && canConfirm;
                  return (
                    <motion.button
                      key={ki} whileTap={{ scale: 0.88 }}
                      onClick={() => isConfirm ? (canConfirm && (onLog(numValue), onClose())) : handleKey(key)}
                      disabled={isConfirm && !canConfirm}
                      className="flex-1 h-[54px] rounded-[18px] flex items-center justify-center bg-card"
                      style={{
                        backgroundColor: isConfirm
                          ? (active ? color.btn : 'rgba(0,0,0,0.05)')
                          : isAC ? 'rgba(0,0,0,0.05)'
                          : undefined,
                        boxShadow: isConfirm || isAC || isBS ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
                        fontSize: isConfirm ? 22 : 19,
                        fontWeight: 600,
                        color: isConfirm
                          ? (active ? color.accent : 'rgba(0,0,0,0.22)')
                          : isAC ? '#D94F6E'
                          : undefined,
                      }}
                    >
                      {isBS ? <Delete className="w-5 h-5 text-muted-foreground" /> : key}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ height: 'max(20px, env(safe-area-inset-bottom))' }} />
        </div>
      </motion.div>
    </>
  );
}

// ── Post-completion Feedback Sheet ─────────────────────────────
const DIFFICULTY_OPTIONS: { value: DifficultyRating; emoji: string; label: string }[] = [
  { value: 'very_easy', emoji: '😎', label: 'Амархан' },
  { value: 'easy',      emoji: '🙂', label: 'Хөнгөн' },
  { value: 'moderate',  emoji: '😐', label: 'Дунд' },
  { value: 'hard',      emoji: '😤', label: 'Хэцүү' },
  { value: 'very_hard', emoji: '🥵', label: 'Маш хэцүү' },
];

function FeedbackSheet({ habit, logId, userId, onClose }: {
  habit: HabitWithCueContext;
  logId: string;
  userId: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<DifficultyRating | null>(null);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const color = getHabitColor(habit.color);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await feedbackApi.submitDifficulty(userId, habit.id, logId, selected);
      if (reflection.trim()) {
        await feedbackApi.submitReflection(userId, habit.id, logId, reflection.trim());
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={onClose} />
      <motion.div
        initial={{ y: 320, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 320, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[24px] px-5 pt-5 pb-6"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>{habit.iconValue || '✨'}</span>
            <p style={{ fontSize: 14, fontWeight: 600 }} className="text-foreground">Хэр хэцүү байсан бэ?</p>
          </div>
          <button onClick={onClose} style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', fontWeight: 500 }}>
            Алгасах
          </button>
        </div>

        {/* Difficulty emoji row */}
        <div className="flex gap-2 mb-4">
          {DIFFICULTY_OPTIONS.map(opt => {
            const active = selected === opt.value;
            return (
              <motion.button key={opt.value} whileTap={{ scale: 0.9 }}
                onClick={() => setSelected(opt.value)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all"
                style={{
                  backgroundColor: active ? color.accent + '18' : 'rgba(0,0,0,0.04)',
                  border: active ? `1.5px solid ${color.accent}` : '1.5px solid transparent',
                }}>
                <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                <span style={{ fontSize: 9.5, fontWeight: active ? 600 : 400, color: active ? color.accent : 'rgba(0,0,0,0.45)' }}>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Reflection text (optional) */}
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value.slice(0, 200))}
          placeholder="Тэмдэглэл бичих... (заавал биш)"
          className="w-full rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none"
          style={{ fontSize: 13, backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', outline: 'none', minHeight: 60, maxHeight: 80 }}
          rows={2}
        />

        {/* Submit button */}
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!selected || submitting}
          className="w-full mt-4 rounded-2xl py-3 flex items-center justify-center transition-all"
          style={{
            backgroundColor: selected ? color.accent : 'rgba(0,0,0,0.08)',
            color: selected ? '#fff' : 'rgba(0,0,0,0.3)',
            fontSize: 14, fontWeight: 600,
            opacity: submitting ? 0.6 : 1,
          }}>
          {submitting ? 'Илгээж байна...' : 'Хадгалах'}
        </motion.button>

        <div style={{ height: 'max(8px, env(safe-area-inset-bottom))' }} />
      </motion.div>
    </>
  );
}

// ── helpers ─────────────────────────────────────────────────────
/** Get Monday of the week that contains `d`. */
function getMondayOf(d: Date) {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

/** Build 7 day objects starting from a Monday. */
function buildWeek(monday: Date, today: Date, selectedDate: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: MN_DAYS[i],
      date: d.getDate(),
      fullDate: d,
      isToday: d.toDateString() === today.toDateString(),
      isSelected: d.toDateString() === selectedDate.toDateString(),
    };
  });
}

const MN_MONTHS = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

const MN_WEEKDAYS_LONG = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

/** "Даваа, 4-р сарын 18" */
function formatMnDate(d: Date) {
  return `${MN_WEEKDAYS_LONG[d.getDay()]}, ${MN_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "4-р сарын 18" */
function formatMnShort(d: Date) {
  return `${MN_MONTHS[d.getMonth()]}ын ${d.getDate()}`;
}

// ── Week Strip (scrollable) ─────────────────────────────────────
const INITIAL_WEEKS = 11;   // 5 past + current + 5 future
const CENTER_INDEX  = 5;    // index of the current week

function WeekStrip({ selectedDate, onSelectDate }: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const today     = useMemo(() => new Date(), []);
  const todayMon  = useMemo(() => getMondayOf(today), [today]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didMount  = useRef(false);

  // weeks = array of Mondays; centre is the current week
  const [weeks, setWeeks] = useState<Date[]>(() =>
    Array.from({ length: INITIAL_WEEKS }, (_, i) => {
      const m = new Date(todayMon);
      m.setDate(m.getDate() + (i - CENTER_INDEX) * 7);
      return m;
    }),
  );

  // scroll to current week on mount (no animation)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.offsetWidth;
    el.scrollLeft = CENTER_INDEX * pageW;
    didMount.current = true;
  }, []);

  // infinite prepend / append on scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !didMount.current) return;
    const pageW = el.offsetWidth;
    if (pageW === 0) return;

    // near the left edge → prepend 4 weeks
    if (el.scrollLeft < pageW * 1.5) {
      setWeeks(prev => {
        const first = prev[0];
        const add = Array.from({ length: 4 }, (_, i) => {
          const m = new Date(first);
          m.setDate(m.getDate() - (4 - i) * 7);
          return m;
        });
        // preserve scroll position
        requestAnimationFrame(() => { el.scrollLeft += 4 * pageW; });
        return [...add, ...prev];
      });
    }

    // near the right edge → append 4 weeks
    if (el.scrollLeft > (el.scrollWidth - pageW * 2.5)) {
      setWeeks(prev => {
        const last = prev[prev.length - 1];
        const add = Array.from({ length: 4 }, (_, i) => {
          const m = new Date(last);
          m.setDate(m.getDate() + (i + 1) * 7);
          return m;
        });
        return [...prev, ...add];
      });
    }
  }, []);

  // month label from the first visible Monday
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const yr = todayMon.getFullYear();
    const thisYr = today.getFullYear();
    return yr === thisYr
      ? MN_MONTHS[todayMon.getMonth()]
      : `${yr} ${MN_MONTHS[todayMon.getMonth()]}`;
  });
  const updateMonth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageW = el.offsetWidth;
    const idx = Math.round(el.scrollLeft / pageW);
    const mon = weeks[idx];
    if (mon) {
      const yr = mon.getFullYear();
      const thisYr = today.getFullYear();
      const label = yr === thisYr
        ? MN_MONTHS[mon.getMonth()]
        : `${yr} ${MN_MONTHS[mon.getMonth()]}`;
      setVisibleMonth(prev => prev === label ? prev : label);
    }
  }, [weeks, today]);

  return (
    <div>
      {/* Month label */}
      {visibleMonth && (
        <p className="text-muted-foreground px-5 mb-2"
          style={{ fontSize: 11, fontWeight: 600 }}>
          {visibleMonth}
        </p>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
        onScroll={() => { handleScroll(); updateMonth(); }}
      >
        {weeks.map((monday) => {
          const days = buildWeek(monday, today, selectedDate);
          return (
            <div key={monday.toISOString()}
              className="flex items-center justify-between px-5 shrink-0 snap-center"
              style={{ width: '100%' }}>
              {days.map((day, di) => (
                <div key={di} className="flex flex-col items-center gap-[5px] cursor-pointer"
                  onClick={() => onSelectDate(day.fullDate)}>
                  <span style={{ fontSize: 11, fontWeight: 500 }}
                    className={day.isSelected ? 'text-foreground' : 'text-muted-foreground/50'}>
                    {day.label}
                  </span>
                  <motion.div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    animate={{
                      backgroundColor: day.isSelected ? '#303437' : 'rgba(0,0,0,0)',
                      boxShadow: day.isSelected ? '0 2px 8px rgba(48,52,55,0.2)' : '0 0 0 rgba(0,0,0,0)',
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <span style={{
                      fontSize: 13, fontWeight: day.isSelected ? 600 : 400,
                      color: day.isSelected ? '#fff' : undefined,
                    }} className={day.isSelected ? '' : 'text-muted-foreground'}>
                      {day.date}
                    </span>
                  </motion.div>
                  {day.isToday && !day.isSelected && (
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#303437', marginTop: -2 }} />
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ habit, entry, onTap, color, disabled }: {
  habit: HabitWithCueContext;
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
    <div className="flex flex-col items-center gap-1.5 shrink-0"
      style={{ width: 72, opacity: disabled ? 0.35 : 1 }}
      onClick={e => { e.stopPropagation(); if (!disabled) onTap(); }}>
      <span style={{ fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 72 }}
        className="text-muted-foreground">
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
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="3.5" />
            <motion.circle
              cx="20" cy="20" r="16" fill="none"
              stroke={color.accent} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={100.5}
              initial={{ strokeDashoffset: 100.5 }}
              animate={{ strokeDashoffset: 100.5 * (1 - (entry ? calcProgress(habit, entry.value) / 100 : 0)) }}
              transition={{ duration: 0.4 }}
            />
          </svg>
          <Plus className="absolute w-3.5 h-3.5" style={{ color: color.accent }} strokeWidth={2.5} />
        </motion.div>
      ) : (
        <motion.button whileTap={{ scale: 0.86 }}
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: color.btn, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          <Plus className="w-4 h-4" style={{ color: color.accent }} strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  );
}

// ── Habit Card ──────────────────────────────────────────────────
function HabitCard({ habit, index, entry, onBadgeTap, disabled }: {
  habit: HabitWithCueContext;
  index: number;
  entry?: LogEntry;
  onBadgeTap: () => void;
  disabled?: boolean;
}) {
  const navigate   = useNavigate();
  const color      = getHabitColor(habit.color);
  const habitIcon  = habit.iconValue || '✨';
  const status     = entry?.status ?? 'none';
  const pct        = entry ? calcProgress(habit, entry.value) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + index * 0.07, type: 'spring', stiffness: 280, damping: 28 }}
    >
      <div
        className="rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform relative"
        style={{ backgroundColor: color.card, boxShadow: '0px 2px 14px rgba(0,0,0,0.08)' }}
        onClick={() => navigate(`/habit/${habit.id}`)}
      >
        {/* Progress fill layer */}
        <motion.div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          animate={{ width: `${pct}%` }}
          initial={{ width: '0%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: pct > 0
              ? `linear-gradient(90deg, ${color.accent}30 0%, ${color.accent}18 ${pct < 100 ? '85%' : '100%'}, transparent 100%)`
              : 'transparent',
          }}
        />

        {/* Right-edge progress line */}
        {pct > 0 && pct < 100 && (
          <motion.div
            className="absolute top-4 bottom-4 w-[2px] rounded-full pointer-events-none"
            animate={{ left: `${pct}%` }}
            initial={{ left: '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: color.accent + '55', transform: 'translateX(-1px)' }}
          />
        )}

        {/* Card content */}
        <div className="relative z-10 flex items-center justify-between px-4 py-4 gap-3">
          {/* Icon */}
          <div className="shrink-0">
            <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(0,0,0,0.10)', fontSize: 26,
                opacity: status === 'done' ? 0.55 : 1, transition: 'opacity 0.3s',
              }}>
              {habitIcon}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 min-w-0 gap-2">
            <p style={{
              fontSize: 13, fontWeight: 600, lineHeight: 1.35,
              textDecoration: status === 'done' ? 'line-through' : 'none',
              opacity: status === 'done' ? 0.5 : 1,
              transition: 'opacity 0.3s',
            }} className="text-foreground">
              {habit.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {habit.currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                  <Flame className="w-2.5 h-2.5" style={{ color: '#ef6c00' }} />
                  <span style={{ fontSize: 11, fontWeight: 500 }} className="text-muted-foreground">{habit.currentStreak} streak</span>
                </div>
              )}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                <Zap className="w-2.5 h-2.5" style={{ color: color.accent }} />
                <span style={{ fontSize: 11, fontWeight: 500 }} className="text-muted-foreground">{habit.strengthScore}/100</span>
              </div>
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
      </div>
    </motion.div>
  );
}

// ── Swipeable Habit Card ────────────────────────────────────────
function SwipeableHabitCard({ habit, index, entry, onBadgeTap, onEdit, onUndo, disabled }: {
  habit: HabitWithCueContext;
  index: number;
  entry?: LogEntry;
  onBadgeTap: () => void;
  onEdit: () => void;
  onUndo: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasLog = !!entry;
  const ACTION_WIDTH = 140;

  return (
    <div className="relative" style={{ touchAction: 'pan-y' }}>
      {/* Action buttons — hidden by default, animate in on swipe */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center gap-3"
        style={{ width: ACTION_WIDTH }}
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl"
          style={{ width: 56, height: 64, backgroundColor: 'rgba(0,0,0,0.05)' }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={open ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
          transition={{ delay: open ? 0.05 : 0, duration: 0.2 }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
            <Pencil className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.45)' }} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(0,0,0,0.4)' }}>Засах</span>
        </motion.button>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setOpen(false); onUndo(); }}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl"
          style={{ width: 56, height: 64, backgroundColor: 'rgba(239,68,68,0.06)' }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={open ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
          transition={{ delay: open ? 0.1 : 0, duration: 0.2 }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}>
            <Undo2 className="w-3 h-3" style={{ color: 'rgba(239,68,68,0.6)' }} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(239,68,68,0.5)' }}>Буцаах</span>
        </motion.button>
      </motion.div>

      {/* Slideable card layer */}
      <motion.div
        drag={hasLog && !disabled ? 'x' : false}
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_e, info) => {
          if (info.offset.x < -50) setOpen(true);
          else setOpen(false);
        }}
        animate={{ x: open ? -ACTION_WIDTH : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <HabitCard
          habit={habit}
          index={index}
          entry={entry}
          onBadgeTap={onBadgeTap}
          disabled={disabled}
        />
      </motion.div>
    </div>
  );
}

// ── Dashboard Page ──────────────────────────────────────────────
export function DashboardPage() {
  const navigate  = useNavigate();
  const { userId, displayName } = useAuth();

  const [habits, setHabits] = useState<HabitWithCueContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [logMap, setLogMap]       = useState<Map<string, LogEntry>>(new Map());
  const [logTarget, setLogTarget] = useState<HabitWithCueContext | null>(null);
  const [editMode, setEditMode]   = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<{ habit: HabitWithCueContext; logId: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  /** Format Date as YYYY-MM-DD for the API */
  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date() && !isToday;

  const loadHabits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const isSameDay = selectedDate.toDateString() === new Date().toDateString();
      const dateParam = isSameDay ? undefined : toDateStr(selectedDate);
      const data = await habitsApi.listToday(userId, dateParam);
      setHabits(data);

      // Fetch existing logs for each habit and populate logMap for the selected date
      const dateKey = toDateStr(selectedDate);
      const newLogMap = new Map<string, LogEntry>();
      await Promise.all(
        data.map(async (habit) => {
          try {
            const logs = await habitsApi.listLogs(userId, habit.id);
            // Find the LAST log for the selected date (latest cumulative value)
            const dayLogs = logs.filter((l) => l.completedAt?.startsWith(dateKey));
            if (dayLogs.length > 0) {
              const lastLog = dayLogs[dayLogs.length - 1];
              const val = lastLog.actualValue ?? 0;
              if (val > 0) {
                const status = calcStatus(habit, val);
                if (status !== 'none') {
                  newLogMap.set(habit.id, { value: val, status, logId: lastLog.id });
                }
              }
            }
          } catch { /* ignore per-habit fetch errors */ }
        }),
      );
      setLogMap(newLogMap);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
  };

  const handleBadgeTap = (habit: HabitWithCueContext) => {
    if (isFuture) return;
    if (logMap.get(habit.id)?.status === 'done') return;
    if (isBinaryHabit(habit)) {
      recordLog(habit, 1);
    } else {
      setLogTarget(habit);   // partial or new — open numpad to add more
    }
  };

  const recordLog = async (habit: HabitWithCueContext, addedValue: number) => {
    if (!userId) return;
    const existing = logMap.get(habit.id);
    const wasDone = existing?.status === 'done';
    const totalValue = Math.round(((existing?.value ?? 0) + addedValue) * 100) / 100;
    const status = calcStatus(habit, totalValue);
    if (status === 'none') return;
    const entry: LogEntry = { value: totalValue, status, logId: existing?.logId };
    setLogMap(prev => new Map(prev).set(habit.id, entry));

    try {
      let logId = existing?.logId;
      if (existing?.logId) {
        // Update existing log instead of creating a duplicate
        await habitsApi.updateLog(userId, habit.id, existing.logId, { actualValue: totalValue });
      } else {
        const logTime = isToday ? new Date() : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
        const result = await habitsApi.createLog(userId, habit.id, {
          actualValue: totalValue,
          completedAt: toLocalISO(logTime),
          triggerSource: 'SELF_INITIATED',
        });
        logId = result.id;
        // Store the logId for edit/undo
        setLogMap(prev => {
          const m = new Map(prev);
          const e = m.get(habit.id);
          if (e) m.set(habit.id, { ...e, logId: result.id });
          return m;
        });
      }
      // Show feedback sheet when newly done
      if (status === 'done' && !wasDone && logId) {
        setFeedbackTarget({ habit, logId });
      }
    } catch (err) {
      console.error('Failed to log:', err);
    }
  };

  const handleEditLog = (habit: HabitWithCueContext) => {
    setEditMode(true);
    setLogTarget(habit);
  };

  const handleUndoLog = async (habit: HabitWithCueContext) => {
    if (!userId) return;
    const entry = logMap.get(habit.id);
    if (!entry?.logId) return;

    // Optimistic UI update
    setLogMap(prev => {
      const m = new Map(prev);
      m.delete(habit.id);
      return m;
    });

    try {
      // Delete ALL logs for this habit on the selected date (cleans up old duplicates too)
      const dateKey = toDateStr(selectedDate);
      const allLogs = await habitsApi.listLogs(userId, habit.id);
      const dayLogs = allLogs.filter((l) => l.completedAt?.startsWith(dateKey));
      await Promise.all(dayLogs.map((l) => habitsApi.deleteLog(userId, habit.id, l.id)));
    } catch (err) {
      console.error('Failed to undo log:', err);
      // Rollback on failure
      setLogMap(prev => new Map(prev).set(habit.id, entry));
    }
  };

  const replaceLog = async (habit: HabitWithCueContext, newValue: number) => {
    if (!userId) return;
    const existing = logMap.get(habit.id);
    const wasDone = existing?.status === 'done';
    const val = Math.round(newValue * 100) / 100;
    const status = calcStatus(habit, val);
    if (status === 'none') return;
    const entry: LogEntry = { value: val, status, logId: existing?.logId };
    setLogMap(prev => new Map(prev).set(habit.id, entry));

    try {
      let logId = existing?.logId;
      if (existing?.logId) {
        await habitsApi.updateLog(userId, habit.id, existing.logId, { actualValue: val });
      } else {
        const logTime = isToday ? new Date() : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
        const result = await habitsApi.createLog(userId, habit.id, {
          actualValue: val,
          completedAt: toLocalISO(logTime),
          triggerSource: 'SELF_INITIATED',
        });
        logId = result.id;
        setLogMap(prev => {
          const m = new Map(prev);
          const e = m.get(habit.id);
          if (e) m.set(habit.id, { ...e, logId: result.id });
          return m;
        });
      }
      // Show feedback sheet when newly done
      if (status === 'done' && !wasDone && logId) {
        setFeedbackTarget({ habit, logId });
      }
    } catch (err) {
      console.error('Failed to update log:', err);
    }
  };

  const today    = new Date();
  const hour     = today.getHours();
  const greeting = hour < 5 ? 'Шөн' : hour < 12 ? 'Хаая морнийн ^^' : hour < 17 ? 'WaasUUP' : 'Хээллөв';
  const dateStr  = formatMnDate(today);

  const doneCount    = [...logMap.values()].filter(e => e.status === 'done').length;
  const totalCount   = habits.length;

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden bg-background">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-14 pb-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }} className="text-muted-foreground">
              {dateStr}
            </p>
            <p style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px' }} className="text-foreground">
              {displayName ? `${displayName}, ${greeting}` : greeting}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/create')}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2"
              style={{ backgroundColor: CTA_DARK.bg, boxShadow: '0 3px 10px rgba(48,52,55,0.25)' }}
            >
              <Plus className="w-4 h-4" style={{ color: '#fff' }} strokeWidth={2.5} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Дадал</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Week Strip */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="px-0 pt-1 pb-4"
      >
        <WeekStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} />
      </motion.div>

      {/* Section label */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <p style={{ fontSize: 12, fontWeight: 400 }} className="text-muted-foreground">
          {isToday ? 'Өнөөдрийн дадлууд' : `${formatMnShort(selectedDate)}-н дадлууд`}
        </p>
        <p style={{ fontSize: 12 }} className="text-muted-foreground">
          {doneCount}/{totalCount} дадал
        </p>
      </div>

      {/* Habit Cards */}
      <div className="px-5 flex flex-col gap-2.5">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          isToday ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center">
              <span style={{ fontSize: 52 }} className="mb-4">🌱</span>
              <p style={{ fontSize: 16, fontWeight: 600 }} className="text-foreground mb-2">
                Дадал байхгүй байна
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.6 }} className="text-muted-foreground mb-8 max-w-[210px]">
                Анхны дадлаа нэмж, хувийн өөрчлөлтийн аялалаа эхэлцгээе!
              </p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/create')}
                className="rounded-full px-6 py-3"
                style={{ backgroundColor: CTA_DARK.bg, fontSize: 14, fontWeight: 600, color: '#fff', boxShadow: CTA_DARK.shadow }}>
                + Дадал нэмэх
              </motion.button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center">
              <span style={{ fontSize: 44 }} className="mb-4">📭</span>
              <p style={{ fontSize: 15, fontWeight: 600 }} className="text-foreground mb-1">
                Энэ өдөр дадал байхгүй
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.5 }} className="text-muted-foreground max-w-[200px]">
                Тухайн өдөр хуваарилагдсан дадал олдсонгүй
              </p>
            </motion.div>
          )
        ) : (
          habits.map((habit, i) => (
            <SwipeableHabitCard
              key={habit.id}
              habit={habit}
              index={i}
              entry={logMap.get(habit.id)}
              onBadgeTap={() => handleBadgeTap(habit)}
              onEdit={() => handleEditLog(habit)}
              onUndo={() => handleUndoLog(habit)}
              disabled={isFuture}
            />
          ))
        )}
      </div>

      {/* Quick Log Sheet */}
      <AnimatePresence>
        {logTarget && (
          <QuickLogSheet
            key={`${logTarget.id}-${editMode ? 'edit' : 'add'}`}
            habit={logTarget}
            currentValue={editMode ? 0 : (logMap.get(logTarget.id)?.value ?? 0)}
            onClose={() => { setLogTarget(null); setEditMode(false); }}
            onLog={value => {
              if (editMode) {
                replaceLog(logTarget, value);
              } else {
                recordLog(logTarget, value);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Post-completion Feedback Sheet */}
      <AnimatePresence>
        {feedbackTarget && userId && (
          <FeedbackSheet
            key={feedbackTarget.logId}
            habit={feedbackTarget.habit}
            logId={feedbackTarget.logId}
            userId={userId}
            onClose={() => setFeedbackTarget(null)}
          />
        )}
      </AnimatePresence>

      {!logTarget && !feedbackTarget && <BottomNav />}
    </div>
  );
}
