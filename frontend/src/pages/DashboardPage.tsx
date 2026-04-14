import { BottomNav } from '@/components/bottom-nav';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Delete, Check, Clock, MapPin } from 'lucide-react';
import { getHabitColor, CTA_DARK } from '@/lib/habit-colors';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import type { HabitWithCueContext, HabitLog } from '@/api/types';

const MN_DAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

const GOAL_TAG_MAP: Record<string, { emoji: string; name: string }> = {
  mindfulness: { emoji: '🧘', name: 'Анхаарал' },
  fitness: { emoji: '💪', name: 'Фитнес' },
  health: { emoji: '❤️', name: 'Эрүүл мэнд' },
  learning: { emoji: '📚', name: 'Суралцах' },
  creativity: { emoji: '🎨', name: 'Бүтээлч байдал' },
  productivity: { emoji: '⚡', name: 'Бүтээмж' },
  social: { emoji: '🤝', name: 'Харилцаа' },
  finance: { emoji: '💰', name: 'Санхүү' },
};

function getTagInfo(goalTag: string | null | undefined) {
  if (!goalTag) return { emoji: '✨', name: '' };
  return GOAL_TAG_MAP[goalTag] || { emoji: '✨', name: goalTag };
}

// ── Logged entry ────────────────────────────────────────────────
interface LogEntry { value: number; status: 'partial' | 'done' }

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
function QuickLogSheet({ habit, onClose, onLog }: {
  habit: HabitWithCueContext;
  onClose: () => void;
  onLog: (value: number) => void;
}) {
  const [input, setInput] = useState('');
  const color    = getHabitColor(habit.motivationProfile?.goalTag);
  const numValue = parseFloat(input) || 0;
  const target   = habit.targetValue || 1;
  const min      = habit.minimumTarget ?? 1;
  const status   = calcStatus(habit, numValue);
  const pct      = calcProgress(habit, numValue);
  const tag      = getTagInfo(habit.motivationProfile?.goalTag);

  const handleKey = (key: string) => {
    if (key === 'AC') { setInput(''); return; }
    if (key === '⌫')  { setInput(p => p.slice(0, -1)); return; }
    if (key === '.' && input.includes('.')) return;
    if (key === '.' && input === '') { setInput('0.'); return; }
    if (input.length >= 6) return;
    setInput(p => p === '0' && key !== '.' ? key : p + key);
  };

  const canConfirm = numValue > 0 && status !== 'none';

  const statusLabel =
    status === 'done'    ? '✓ Зорилт биелэв!' :
    status === 'partial' ? `${numValue}/${target} ${habit.measurementUnit || ''}` :
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
              <span style={{ fontSize: 18 }}>{tag.emoji}</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }} className="text-foreground">{habit.title}</p>
              <p style={{ fontSize: 11 }} className="text-muted-foreground">Хурдан бүртгэл</p>
            </div>
          </div>

          {/* Number display */}
          <div className="px-6 pb-2 text-center">
            <div className="flex items-end justify-center gap-2">
              <span style={{
                fontSize: 56, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1,
                color: status === 'done' ? color.accent : status === 'partial' ? color.ring : undefined,
                transition: 'color 0.2s',
              }} className="text-foreground">
                {input || '0'}
              </span>
              {habit.measurementUnit && (
                <span style={{ fontSize: 18, paddingBottom: 10, fontWeight: 500 }} className="text-muted-foreground">
                  {habit.measurementUnit}
                </span>
              )}
            </div>

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
                  <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.32)' }}>min {min}</span>
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

// ── Week Strip ──────────────────────────────────────────────────
function WeekStrip() {
  const today  = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label: MN_DAYS[i], date: d.getDate(), isToday: d.toDateString() === today.toDateString() };
  });

  return (
    <div className="flex items-center justify-between px-5">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-[5px]">
          <span style={{ fontSize: 11, fontWeight: 500 }}
            className={day.isToday ? 'text-foreground' : 'text-muted-foreground/50'}>
            {day.label}
          </span>
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{
              backgroundColor: day.isToday ? '#303437' : 'transparent',
              boxShadow: day.isToday ? '0 2px 8px rgba(48,52,55,0.2)' : 'none',
            }}
          >
            <span style={{
              fontSize: 13, fontWeight: day.isToday ? 700 : 400,
              color: day.isToday ? '#fff' : undefined,
            }} className={day.isToday ? '' : 'text-muted-foreground'}>
              {day.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Cue Chip ────────────────────────────────────────────────────
function CueChip({ icon, text }: { icon: 'time' | 'location'; text: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
      {icon === 'time'
        ? <Clock className="w-2.5 h-2.5 text-muted-foreground" />
        : <MapPin className="w-2.5 h-2.5 text-muted-foreground" />}
      <span style={{ fontSize: 10, fontWeight: 500 }} className="text-muted-foreground">{text}</span>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ habit, entry, onTap, color }: {
  habit: HabitWithCueContext;
  entry?: LogEntry;
  onTap: () => void;
  color: ReturnType<typeof getHabitColor>;
}) {
  const target = habit.targetValue || 1;
  const status = entry?.status ?? 'none';
  const val    = entry?.value ?? 0;

  const countLabel = !isBinaryHabit(habit) && target
    ? `${val}/${target} ${habit.measurementUnit || ''}`
    : status === 'done' ? '1/1 удаа' : '0/1 удаа';

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0"
      onClick={e => { e.stopPropagation(); onTap(); }}>
      <span style={{ fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap' }}
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
          <Check className="absolute w-3.5 h-3.5" style={{ color: color.accent }} />
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
function HabitCard({ habit, index, entry, onBadgeTap }: {
  habit: HabitWithCueContext;
  index: number;
  entry?: LogEntry;
  onBadgeTap: () => void;
}) {
  const navigate   = useNavigate();
  const color      = getHabitColor(habit.motivationProfile?.goalTag);
  const tag        = getTagInfo(habit.motivationProfile?.goalTag);
  const status     = entry?.status ?? 'none';
  const pct        = entry ? calcProgress(habit, entry.value) : 0;

  // Show cue chips from evaluated cue context
  const timeCue = habit.cueContext?.find(c => c.type === 'TIME_WINDOW' && c.isActive);
  const locationCue = habit.cueContext?.find(c => c.type === 'LOCATION' && c.isActive);

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
              {tag.emoji}
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
              {timeCue && <CueChip icon="time" text={timeCue.value} />}
              {locationCue && <CueChip icon="location" text={locationCue.value} />}
            </div>
          </div>

          {/* Badge */}
          <StatusBadge
            habit={habit}
            entry={entry}
            onTap={onBadgeTap}
            color={color}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Dashboard Page ──────────────────────────────────────────────
export function DashboardPage() {
  const navigate  = useNavigate();
  const { userId } = useAuth();

  const [habits, setHabits] = useState<HabitWithCueContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [logMap, setLogMap]       = useState<Map<string, LogEntry>>(new Map());
  const [logTarget, setLogTarget] = useState<HabitWithCueContext | null>(null);

  const loadHabits = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await habitsApi.listToday(userId);
      setHabits(data);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  const handleBadgeTap = (habit: HabitWithCueContext) => {
    if (logMap.get(habit.id)?.status === 'done') return;
    if (isBinaryHabit(habit)) {
      recordLog(habit, 1);
    } else {
      setLogTarget(habit);
    }
  };

  const recordLog = async (habit: HabitWithCueContext, value: number) => {
    if (!userId) return;
    const status = calcStatus(habit, value);
    if (status === 'none') return;
    const entry: LogEntry = { value, status };
    setLogMap(prev => new Map(prev).set(habit.id, entry));

    try {
      await habitsApi.createLog(userId, habit.id, {
        actualValue: value,
        completedAt: new Date().toISOString(),
        triggerSource: 'SELF_INITIATED',
      });
    } catch (err) {
      console.error('Failed to log:', err);
    }
  };

  const today    = new Date();
  const hour     = today.getHours();
  const greeting = hour < 5 ? 'Шөнийн мэнд' : hour < 12 ? 'Өглөөний мэнд' : hour < 17 ? 'Өдрийн мэнд' : 'Оройн мэнд';
  const dateStr  = today.toLocaleDateString('mn-MN', { month: 'long', day: 'numeric', weekday: 'long' });

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
            <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }} className="text-foreground">
              {greeting} 👋
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
        className="px-0 pt-5 pb-4"
      >
        <WeekStrip />
      </motion.div>

      {/* Section label */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <p style={{ fontSize: 13, fontWeight: 700 }} className="text-foreground">
          Өнөөдрийн дадлууд
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <span style={{ fontSize: 52 }} className="mb-4">🌱</span>
            <p style={{ fontSize: 17, fontWeight: 700 }} className="text-foreground mb-2">
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
          habits.map((habit, i) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              index={i}
              entry={logMap.get(habit.id)}
              onBadgeTap={() => handleBadgeTap(habit)}
            />
          ))
        )}
      </div>

      {/* Quick Log Sheet */}
      <AnimatePresence>
        {logTarget && (
          <QuickLogSheet
            key={logTarget.id}
            habit={logTarget}
            onClose={() => setLogTarget(null)}
            onLog={value => { recordLog(logTarget, value); }}
          />
        )}
      </AnimatePresence>

      {!logTarget && <BottomNav />}
    </div>
  );
}
