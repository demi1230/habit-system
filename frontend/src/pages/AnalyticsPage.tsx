import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Flame, Calendar, Target, Clock } from 'lucide-react';
import { getHabitColor } from '@/lib/habit-colors';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import type { Habit, HabitLog, HabitStrengthSignals } from '@/api/types';

const GOAL_TAG_MAP: Record<string, { emoji: string }> = {
  mindfulness: { emoji: '🧘' }, fitness: { emoji: '💪' }, health: { emoji: '❤️' },
  learning: { emoji: '📚' }, creativity: { emoji: '🎨' }, productivity: { emoji: '⚡' },
  social: { emoji: '🤝' }, finance: { emoji: '💰' },
};

const WEEKDAY_LABELS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-indexed
}

function MonthCalendar({ logs, accent }: { logs: HabitLog[]; accent: string }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = month.getFullYear();
  const m = month.getMonth();
  const daysCount = getDaysInMonth(year, m);
  const firstDay = getFirstDayOfMonth(year, m);

  const logDates = useMemo(() => {
    const s = new Set<string>();
    for (const l of logs) if (l.status === 'DONE') s.add(l.completedAt.split('T')[0]);
    return s;
  }, [logs]);

  const today = now.toISOString().split('T')[0];
  const monthLabel = month.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long' });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOffset(o => o - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <ChevronLeft className="w-4 h-4" style={{ color: '#474747' }} />
        </motion.button>
        <p style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }} className="text-foreground">{monthLabel}</p>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOffset(o => Math.min(o + 1, 0))}
          disabled={offset >= 0}
          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30"
          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <ChevronRight className="w-4 h-4" style={{ color: '#474747' }} />
        </motion.button>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7,1fr)' }}>
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center"
            style={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.3)', paddingBottom: 2 }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysCount }, (_, i) => {
          const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
          const done = logDates.has(dateStr);
          const isToday = dateStr === today;
          return (
            <div key={dateStr} className="flex items-center justify-center"
              style={{
                aspectRatio: '1', borderRadius: 10,
                backgroundColor: done ? accent + '22' : 'transparent',
                border: isToday ? `1.5px solid ${accent}` : 'none',
              }}>
              <span style={{
                fontSize: 11, fontWeight: done || isToday ? 700 : 400,
                color: done ? accent : isToday ? accent : 'rgba(0,0,0,0.45)',
              }}>{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressRingLarge({ value, size = 140, strokeWidth = 10, color }: {
  value: number; size?: number; strokeWidth?: number; color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(0,0,0,0.07)" strokeWidth={strokeWidth} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }} />
      </svg>
      <div className="absolute text-center">
        <span style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: '-1px' }}>{value}</span>
        <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }}>%</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="rounded-[16px] p-3.5 bg-card" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <div className="w-8 h-8 rounded-[12px] flex items-center justify-center mb-2"
        style={{ backgroundColor: color + '18' }}>
        {icon}
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }} className="text-foreground">{value}</p>
      <p style={{ fontSize: 11, marginTop: 2, fontWeight: 500 }} className="text-muted-foreground">{label}</p>
    </div>
  );
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [strength, setStrength] = useState<HabitStrengthSignals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    habitsApi.list(userId).then(h => {
      setHabits(h);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, [userId]);

  const selected = habits[selectedIdx] ?? null;

  useEffect(() => {
    if (!userId || !selected) return;
    Promise.all([
      habitsApi.listLogs(userId, selected.id),
      habitsApi.getStrengthSignals(userId, selected.id).catch(() => null),
    ]).then(([l, s]) => { setLogs(l); setStrength(s); });
  }, [userId, selected?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-7 h-7 rounded-full border-2 border-t-transparent border-primary" />
      </div>
    );
  }

  const goalTag = selected?.motivationProfile?.goalTag;
  const color = getHabitColor(goalTag ?? 'lavender');
  const tagInfo = goalTag ? GOAL_TAG_MAP[goalTag] : null;

  const doneLogs = logs.filter(l => l.status === 'DONE');
  const completionRate = logs.length > 0 ? Math.round((doneLogs.length / logs.length) * 100) : 0;

  // streak calculation
  let streak = 0;
  const sortedDates = [...new Set(doneLogs.map(l => l.completedAt.split('T')[0]))].sort().reverse();
  const today = new Date();
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (sortedDates[i] === expected.toISOString().split('T')[0]) streak++;
    else break;
  }

  const avgPerDay = doneLogs.length > 0
    ? (doneLogs.reduce((s, l) => s + (l.actualValue ?? 1), 0) / Math.max(1, new Set(doneLogs.map(l => l.completedAt.split('T')[0])).size)).toFixed(1)
    : '0';

  const advice = completionRate >= 80 ? '🏆 Маш сайн! Тогтмол байдал нь маш өндөр.' :
    completionRate >= 50 ? '💪 Сайн явж байна. Дохиогоо тогтмолжуулж, тогтвортой болгоорой.' :
    selected ? '🌱 Жижиг алхамаас эхэлж, дадлаа бэхжүүлээрэй.' : '';

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 px-5 pt-13 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4.5 h-4.5 text-primary" />
            <p style={{ fontSize: 17, fontWeight: 700 }} className="text-foreground">Шинжилгээ</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        {/* HABIT SELECTOR */}
        {habits.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {habits.map((h, i) => {
              const active = i === selectedIdx;
              const c = getHabitColor(h.motivationProfile?.goalTag ?? 'lavender');
              const t = h.motivationProfile?.goalTag ? GOAL_TAG_MAP[h.motivationProfile.goalTag] : null;
              return (
                <motion.button key={h.id} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIdx(i)}
                  className="flex flex-col items-center gap-1 shrink-0"
                  style={{ minWidth: 60 }}>
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: active ? c.card : 'rgba(0,0,0,0.05)',
                      border: active ? `2px solid ${c.accent}` : '2px solid transparent',
                    }}>
                    <span style={{ fontSize: 20 }}>{t?.emoji || '✨'}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: active ? 700 : 400, maxWidth: 60,
                    color: active ? c.accent : 'rgba(0,0,0,0.45)',
                  }} className="truncate text-center">{h.title}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {!selected ? (
          <div className="text-center py-20">
            <p style={{ fontSize: 48 }}>📊</p>
            <p className="text-muted-foreground mt-4" style={{ fontSize: 14 }}>Дадал нэмээгүй байна</p>
          </div>
        ) : (
          <>
            {/* CALENDAR */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] p-4 bg-card"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <MonthCalendar logs={logs} accent={color.accent} />
            </motion.div>

            {/* PROGRESS RING */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
              className="rounded-[20px] p-5 bg-card flex flex-col items-center"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <ProgressRingLarge value={completionRate} color={color.accent} />
              <p className="mt-3 text-foreground" style={{ fontSize: 14, fontWeight: 700 }}>Гүйцэтгэлийн хувь</p>
              <p className="mt-1 text-muted-foreground" style={{ fontSize: 12 }}>
                {doneLogs.length} / {logs.length} бүртгэл амжилттай
              </p>
            </motion.div>

            {/* ADVICE */}
            {advice && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
                className="rounded-[16px] px-4 py-3.5"
                style={{ backgroundColor: color.btn + 'aa', border: `1px solid ${color.accent}20` }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, fontWeight: 500 }} className="text-foreground">{advice}</p>
              </motion.div>
            )}

            {/* STATS GRID */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}
              className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Flame className="w-4 h-4" style={{ color: '#EF4444' }} />}
                label="Дараалал (streak)" value={`${streak} өдөр`} color="#EF4444" />
              <StatCard
                icon={<Calendar className="w-4 h-4" style={{ color: color.accent }} />}
                label="Нийт бүртгэл" value={`${doneLogs.length}`} color={color.accent} />
              <StatCard
                icon={<Target className="w-4 h-4" style={{ color: '#8B7EC8' }} />}
                label="Өдрийн дундаж" value={avgPerDay} color="#8B7EC8" />
              <StatCard
                icon={<Clock className="w-4 h-4" style={{ color: '#E8A87C' }} />}
                label="Хүч" value={`${strength ? Math.round(strength.doneRate * 100) : 0}/100`} color="#E8A87C" />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
