import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from '../components/bottom-nav';
import { useHabits, getTagById, getHabitStrength, type Habit } from '../store';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getHabitColor, ALL_COLOR, CTA_DARK } from '../lib/habit-colors';

const MN_DAYS_SHORT = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const MN_MONTHS = [
  '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
];

// ── Month Calendar ─────────────────────────────────────────────
function MonthCalendar({ habits, accentColor }: { habits: Habit[]; accentColor: string }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const today = new Date();

  const completedDates = new Set<string>();
  for (const h of habits) {
    for (const c of h.completions) {
      if (c.completed || c.partial) completedDates.add(c.date);
    }
  }

  const cells: { day: number; curr: boolean; dateStr: string }[] = [];
  for (let i = 0; i < startDow; i++) {
    cells.push({ day: prevDays - startDow + i + 1, curr: false, dateStr: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, curr: true, dateStr });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - startDow + 1, curr: false, dateStr: '' });
  }

  return (
    <div className="bg-card rounded-[24px] px-4 py-4 mx-5"
      style={{ boxShadow: '0px 1px 6px rgba(0,0,0,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: '#474747' }} />
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
          {MN_MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: '#474747' }} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {MN_DAYS_SHORT.map(d => (
          <div key={d} className="text-center py-1">
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.35)' }}>{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          const isToday = cell.curr &&
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === cell.day;
          const isDone = cell.curr && !!cell.dateStr && completedDates.has(cell.dateStr);
          return (
            <div key={i} className="flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isDone ? accentColor : isToday ? '#303437' : 'transparent',
                }}
              >
                <span style={{
                  fontSize: '13px',
                  fontWeight: isDone || isToday ? 600 : 400,
                  color: isDone || isToday ? '#fff' : cell.curr ? 'var(--foreground)' : 'rgba(0,0,0,0.2)',
                }}>
                  {cell.day}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Progress Ring ──────────────────────────────────────────────
function ProgressRingLarge({ pct, ringColor, softColor }: {
  pct: number; ringColor: string; softColor: string;
}) {
  const size = 120, stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={softColor} strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={ringColor} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: '20px' }}>🦾</span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)' }}>{pct}%</span>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)', marginTop: 6, fontWeight: 500 }}>
        дадлын хүч
      </p>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ value, unit, label, accentColor }: {
  value: number | string; unit: string; label: string; accentColor?: string;
}) {
  return (
    <div className="bg-card rounded-[20px] p-4 flex-1"
      style={{ boxShadow: '0px 1px 6px rgba(0,0,0,0.07)' }}>
      <div className="flex items-end gap-1 mb-0.5">
        <span style={{
          fontSize: '22px', fontWeight: 700,
          color: accentColor ?? 'var(--foreground)',
        }}>
          {value}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.38)', paddingBottom: 2 }}>{unit}</span>
      </div>
      <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>{label}</p>
    </div>
  );
}

// ── Analytics Page ─────────────────────────────────────────────
export function AnalyticsPage() {
  const navigate = useNavigate();
  const allHabits = useHabits();
  const activeHabits = useMemo(() => allHabits.filter(h => !h.archived), [allHabits]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedHabit = selectedId ? activeHabits.find(h => h.id === selectedId) ?? null : null;

  const targetHabits = selectedHabit ? [selectedHabit] : activeHabits;
  const color = selectedHabit ? getHabitColor(selectedHabit) : ALL_COLOR;

  // ── Computed stats ──
  const avgStrength = targetHabits.length > 0
    ? Math.round(targetHabits.reduce((s, h) => s + getHabitStrength(h).total, 0) / targetHabits.length)
    : 0;
  const bestStreak = Math.max(...targetHabits.map(h => h.streak), 0);
  const allTimeMaxStreak = Math.max(...activeHabits.map(h =>
    Math.max(h.streak, ...h.completions.map(() => 0))
  ), bestStreak);
  const totalSessions = targetHabits.reduce((s, h) => s + h.completions.length, 0);
  const avgPerDay = totalSessions > 0 ? Math.max(1, Math.round(totalSessions / 30)) : 0;

  const ADVICE = [
    'Өнөөдөл дадал яг болж байна шүү, үргэлжлүүлээд байгаарай',
    'Жижиг алхам ч гэсэн урагшлал. Үргэлжлүүл!',
    'Тогтмол байдал чадвараас чухал. Та шалгарлаа!',
  ];
  const advice = ADVICE[Math.floor(Date.now() / 86400000) % ADVICE.length];

  const reflections = targetHabits
    .flatMap(h => h.completions.filter(c => c.reflection).map(c => ({
      habit: h.title, feeling: c.reflection!.feeling, note: c.reflection?.note, date: c.date,
    })))
    .slice(0, 3);

  return (
    <div className="min-h-screen pb-36 overflow-x-hidden bg-background">

      {/* ── Habit Selector Row ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="pt-14 pb-3 sticky top-0 z-20 bg-background"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
      >
        <div
          className="flex items-center gap-3 overflow-x-auto px-5 py-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* "Бүгд" — all habits */}
          <button
            className="flex flex-col items-center gap-1 shrink-0"
            onClick={() => setSelectedId(null)}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: selectedId === null ? '#303437' : 'rgba(0,0,0,0.07)',
                boxShadow: selectedId === null ? '0 0 0 3px var(--background), 0 0 0 5px #303437' : '0 2px 8px rgba(0,0,0,0.09)',
              }}
            >
              <span style={{ fontSize: '22px' }}>🏆</span>
            </div>
            <span style={{
              fontSize: '10px',
              color: selectedId === null ? '#303437' : 'rgba(0,0,0,0.4)',
              fontWeight: selectedId === null ? 700 : 400,
            }}>
              Бүгд
            </span>
          </button>

          {/* Individual habits */}
          {activeHabits.map(h => {
            const tag = getTagById(h.goalTag);
            const hClr = getHabitColor(h);
            const isSelected = selectedId === h.id;
            return (
              <motion.button
                key={h.id}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-1 shrink-0"
                onClick={() => setSelectedId(isSelected ? null : h.id)}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: hClr.btn,
                    boxShadow: isSelected
                      ? `0 0 0 3px var(--background), 0 0 0 5px ${hClr.ring}`
                      : '0 2px 8px rgba(0,0,0,0.09)',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{tag?.emoji || '✨'}</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  color: isSelected ? hClr.accent : 'rgba(0,0,0,0.4)',
                  fontWeight: isSelected ? 700 : 400,
                  maxWidth: 52, textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {h.title.split(' ')[0]}
                </span>
              </motion.button>
            );
          })}

          {/* Add new */}
          <button
            className="flex flex-col items-center gap-1 shrink-0"
            onClick={() => navigate('/create')}
          >
            
          </button>
        </div>
      </motion.div>

      {/* ── Selected habit label ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId ?? 'all'}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
          className="px-5 py-3"
        >
          <div className="flex items-center gap-2">
            {selectedHabit && (
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.accent }} />
            )}
            <p style={{
              fontSize: '14px', fontWeight: 500,
              color: selectedHabit ? color.accent : 'rgba(0,0,0,0.5)',
              fontStyle: selectedHabit ? 'normal' : 'italic',
            }}>
              {selectedHabit ? selectedHabit.title : 'Бүх дадлын тойм'}
            </p>
          </div>
          {selectedHabit && (
            <div className="h-0.5 mt-1 rounded-full w-32" style={{ backgroundColor: color.accent + '60' }} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Animated content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId ?? 'all'}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
          className="flex flex-col gap-4"
        >
          {/* Monthly Calendar */}
          <MonthCalendar habits={targetHabits} accentColor={color.ring} />

          {/* Progress Ring */}
          <div className="mx-5">
            <div className="bg-card rounded-[24px] p-5 flex flex-col items-center"
              style={{ boxShadow: '0px 1px 6px rgba(0,0,0,0.07)' }}>
              <ProgressRingLarge
                pct={avgStrength}
                ringColor={color.ring}
                softColor={color.soft ?? 'rgba(0,0,0,0.07)'}
              />
            </div>
          </div>

          {/* Advice */}
          <div className="mx-5">
            <div className="bg-card rounded-[24px] p-4"
              style={{ boxShadow: '0px 1px 6px rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }} className="mb-1">
                Зөвлөгөө
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.55)', lineHeight: 1.55 }}>
                {advice}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mx-5">
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={bestStreak}     unit="өдөр" label="Одоогийн streak"  accentColor={color.accent} />
              <StatCard value={allTimeMaxStreak} unit="өдөр" label="Шилдэг streak" accentColor={color.accent} />
              <StatCard value={totalSessions}  unit="удаа"  label="Нийт хийсэн" />
              <StatCard value={avgPerDay}       unit="удаа"  label="Өдрийн дундаж" />
            </div>
          </div>

          {/* Reflections */}
          {reflections.length > 0 && (
            <div className="mx-5 mb-4">
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }} className="mb-3">
                Эргэцүүлэл
              </p>
              <div className="flex flex-col gap-2">
                {reflections.map((r, i) => (
                  <div key={i} className="bg-card rounded-[20px] p-4 flex items-center justify-between"
                    style={{ boxShadow: '0px 1px 6px rgba(0,0,0,0.07)' }}>
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        {selectedId && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.accent }} />
                        )}
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{r.habit}</p>
                      </div>
                      <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>
                        {r.note || r.feeling}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>
                      {r.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
