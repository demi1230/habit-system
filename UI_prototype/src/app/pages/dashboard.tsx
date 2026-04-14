import { BottomNav } from '../components/bottom-nav';
import { useHabits, logCompletion, trackEvent, getTagById, type Habit } from '../store';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Delete, Check, Clock, MapPin, Zap } from 'lucide-react';
import { getHabitColor, CTA_DARK } from '../lib/habit-colors';
import imgProfile1 from "figma:asset/e26e9fe797c0ed6d681176a232f8c863a5c32ba4.png";
import imgProfile2 from "figma:asset/9ac9c858bbb4631dccd112b2c0479cf4e738c6ac.png";
import imgProfile3 from "figma:asset/28c5d348b2b940f2c4855e0f432355bcc547b5e2.png";
import svgPaths from "../../imports/Frame2150-1/svg-spd1vtracf";

const PROFILE_IMGS = [imgProfile1, null, imgProfile2, imgProfile3, null];
const MN_DAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

// ── Logged entry ────────────────────────────────────────────────
interface LogEntry { value: number; status: 'partial' | 'done' }

function calcProgress(habit: Habit, loggedValue: number): number {
  if (habit.type === 'binary') return loggedValue > 0 ? 100 : 0;
  return Math.min((loggedValue / (habit.targetValue || 1)) * 100, 100);
}

function calcStatus(habit: Habit, value: number): 'none' | 'partial' | 'done' {
  if (habit.type === 'binary') return value > 0 ? 'done' : 'none';
  const target = habit.targetValue || 1;
  if (value >= target) return 'done';
  if (value > 0) return 'partial';
  return 'none';
}

// ── Motivation tips ─────────────────────────────────────────────
const TIPS = [
  { emoji: '🌱', text: 'Дадлыг бий болгоход хамгийн чухал нь тогтмол байдал. Өнөөдрийг алдалтгүй дуусга.' },
  { emoji: '⚡', text: '"2 минутын дүрэм": Хийхэд хэцүү санагдвал ердөө 2 минутаас эхэл.' },
  { emoji: '🧠', text: 'Цэгцтэй орчин, тодорхой дохио нь дадлыг автоматаар гүйцэтгэхэд тусална.' },
  { emoji: '🎯', text: 'Дадлыг "хийх ёстой" биш "хэн би бэ"-ийн нэг хэсэг гэж бод.' },
  { emoji: '🔗', text: 'Шинэ дадлаа одоо байгаа дадалтайгаа холбо. Жишээ: "Кофе уусны дараа..."' },
];

// ── Quick Log Number Pad ───────────────────────────────────────
function QuickLogSheet({ habit, onClose, onLog }: {
  habit: Habit;
  onClose: () => void;
  onLog: (value: number) => void;
}) {
  const [input, setInput] = useState('');
  const color    = getHabitColor(habit);
  const numValue = parseFloat(input) || 0;
  const target   = habit.targetValue || 1;
  const min      = habit.minValue ?? 1;
  const status   = calcStatus(habit, numValue);
  const pct      = calcProgress(habit, numValue);

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
    status === 'partial' ? `${numValue}/${target} ${habit.unit || ''}` :
    `Зорилт: ${target} ${habit.unit || ''}`;

  const statusColor =
    status === 'done' ? color.accent : status === 'partial' ? color.ring : 'rgba(0,0,0,0.35)';

  const keys = [
    ['1','2','3','AC'],
    ['4','5','6','⌫'],
    ['7','8','9',''],
    ['','0','.','✓'],
  ];

  const tag = getTagById(habit.goalTag);

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
        <div className="w-full max-w-[430px] rounded-t-[28px] overflow-hidden"
          style={{ backgroundColor: '#FAFBFF', boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-9 h-[3px] rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
          </div>

          {/* Habit header */}
          <div className="flex items-center gap-3 px-5 pb-4">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: color.btn }}>
              <span style={{ fontSize: 18 }}>{tag?.emoji || '✨'}</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#202325' }}>{habit.title}</p>
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>Хурдан бүртгэл</p>
            </div>
          </div>

          {/* Number display */}
          <div className="px-6 pb-2 text-center">
            <div className="flex items-end justify-center gap-2">
              <span style={{
                fontSize: 56, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1,
                color: status === 'done' ? color.accent : status === 'partial' ? color.ring : '#202325',
                transition: 'color 0.2s',
              }}>
                {input || '0'}
              </span>
              {habit.unit && (
                <span style={{ fontSize: 18, color: 'rgba(0,0,0,0.38)', paddingBottom: 10, fontWeight: 500 }}>
                  {habit.unit}
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
                {habit.minValue && habit.minValue < target && (
                  <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.32)' }}>min {habit.minValue}</span>
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
                      className="flex-1 h-[54px] rounded-[18px] flex items-center justify-center"
                      style={{
                        backgroundColor: isConfirm
                          ? (active ? color.btn : 'rgba(0,0,0,0.05)')
                          : isAC ? 'rgba(0,0,0,0.05)'
                          : '#fff',
                        boxShadow: isConfirm || isAC || isBS ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
                        fontSize: isConfirm ? 22 : 19,
                        fontWeight: 600,
                        color: isConfirm
                          ? (active ? color.accent : 'rgba(0,0,0,0.22)')
                          : isAC ? '#D94F6E'
                          : '#202325',
                      }}
                    >
                      {isBS ? <Delete className="w-5 h-5" style={{ color: '#6b7280' }} /> : key}
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
          <span style={{ fontSize: 11, fontWeight: 500, color: day.isToday ? '#303437' : 'rgba(0,0,0,0.3)' }}>
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
              color: day.isToday ? '#fff' : '#9ca3af',
            }}>
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
        ? <Clock className="w-2.5 h-2.5" style={{ color: 'rgba(0,0,0,0.45)' }} />
        : <MapPin className="w-2.5 h-2.5" style={{ color: 'rgba(0,0,0,0.45)' }} />}
      <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>{text}</span>
    </div>
  );
}

// ── Log Button (right side of card) ────────────────────────────
function LogButton({ habit, entry, onTap, color }: {
  habit: Habit;
  entry?: LogEntry;
  onTap: () => void;
  color: ReturnType<typeof getHabitColor>;
}) {
  const status = entry?.status ?? 'none';
  const r = 14;    // circle radius
  const circumference = 2 * Math.PI * r;
  const pct = entry ? calcProgress(habit, entry.value) / 100 : 0;

  if (status === 'done') {
    return (
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: color.accent }}
        onClick={e => { e.stopPropagation(); }}
      >
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M1.5 6L5.5 10L14.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    );
  }

  if (status === 'partial') {
    return (
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="w-10 h-10 relative flex items-center justify-center shrink-0 cursor-pointer"
        onClick={e => { e.stopPropagation(); onTap(); }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="3" />
          <motion.circle
            cx="20" cy="20" r={r} fill="none"
            stroke={color.accent} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 0.45 }}
          />
        </svg>
        <Plus className="w-3.5 h-3.5 relative z-10" style={{ color: color.accent }} strokeWidth={2.5} />
      </motion.div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.84 }}
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: color.btn, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
      onClick={e => { e.stopPropagation(); onTap(); }}
    >
      <Plus className="w-4 h-4" style={{ color: color.accent }} strokeWidth={2.5} />
    </motion.button>
  );
}

// ── Habit Strength Bar ──────────────────────────────────────────
function StrengthDots({ rate, color }: { rate: number; color: string }) {
  const total = 5;
  const filled = Math.round(rate * total);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="w-[5px] h-[5px] rounded-full transition-colors"
          style={{ backgroundColor: i < filled ? color : 'rgba(0,0,0,0.12)' }} />
      ))}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ habit, entry, onTap, color }: {
  habit: Habit;
  entry?: LogEntry;
  onTap: () => void;
  color: ReturnType<typeof getHabitColor>;
}) {
  const target = habit.targetValue || 1;
  const status = entry?.status ?? 'none';
  const val    = entry?.value ?? 0;

  const countLabel = habit.type === 'measurable' && target
    ? `${val}/${target} ${habit.unit || ''}`
    : status === 'done' ? '1/1 удаа' : '0/1 удаа';

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0"
      onClick={e => { e.stopPropagation(); onTap(); }}>
      <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {countLabel}
      </span>

      {status === 'done' ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-10 h-10 relative flex items-center justify-center">
          <svg width="40" height="39" viewBox="0 0 43 42" fill="none" className="absolute inset-0 w-full h-full">
            <path d={svgPaths.p3c807200} fill="#dee061" />
          </svg>
          <svg width="14" height="12" viewBox="0 0 17 15" fill="none" className="relative z-10">
            <path d={svgPaths.pd256a80} fill="#000" />
          </svg>
        </motion.div>
      ) : status === 'partial' ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-10 h-10 relative flex items-center justify-center cursor-pointer"
          onClick={e => { e.stopPropagation(); onTap(); }}>
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
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
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d={svgPaths.p3ed50f00} fill="#474747" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}

// ── Habit Tag Pill ─────────────────────────────────────────────
function HabitTag({ value, icon }: { value: string | number; icon: 'dumbbell' | 'flame' }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.09)', height: 30 }}>
      <svg width="16" height="16" viewBox={icon === 'dumbbell' ? '0 0 26 25.0006' : '0 0 23 24'} fill="none" style={{ flexShrink: 0 }}>
        <path
          d={icon === 'dumbbell' ? svgPaths.p2eaaee80 : svgPaths.p29fc8c00}
          fill="#303437"
          fillRule={icon === 'flame' ? 'evenodd' : undefined}
          clipRule={icon === 'flame' ? 'evenodd' : undefined}
        />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#303437' }}>{typeof value === 'number' ? Math.min(100, Math.max(0, value)) : value}</span>
    </div>
  );
}

// ── Habit Card ──────────────────────────────────────────────────
function HabitCard({ habit, index, entry, onBadgeTap }: {
  habit: Habit;
  index: number;
  entry?: LogEntry;
  onBadgeTap: () => void;
}) {
  const navigate   = useNavigate();
  const color      = getHabitColor(habit);
  const tag        = getTagById(habit.goalTag);
  const profileImg = PROFILE_IMGS[index % PROFILE_IMGS.length];
  const status     = entry?.status ?? 'none';
  const pct        = entry ? calcProgress(habit, entry.value) : 0;

  const chunkCount  = habit.chunks?.length ?? (habit.targetValue ?? 1);
  const targetLabel = habit.type === 'measurable' && habit.targetValue ? habit.targetValue : chunkCount;

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
        {/* ── Progress fill layer ── */}
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

        {/* ── Right-edge progress line ── */}
        {pct > 0 && pct < 100 && (
          <motion.div
            className="absolute top-4 bottom-4 w-[2px] rounded-full pointer-events-none"
            animate={{ left: `${pct}%` }}
            initial={{ left: '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: color.accent + '55', transform: 'translateX(-1px)' }}
          />
        )}

        {/* ── Card content ── */}
        <div className="relative z-10 flex items-center justify-between px-4 py-4 gap-3">
          {/* Icon */}
          <div className="shrink-0">
            {profileImg ? (
              <img src={profileImg} alt="" className="object-cover"
                style={{ width: 50, height: 50, borderRadius: index === 1 ? 25 : 16,
                  opacity: status === 'done' ? 0.55 : 1, transition: 'opacity 0.3s' }} />
            ) : (
              <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.10)', fontSize: 26,
                  opacity: status === 'done' ? 0.55 : 1, transition: 'opacity 0.3s' }}>
                {tag?.emoji || '✨'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 min-w-0 gap-2">
            <p style={{
              fontSize: 13, fontWeight: 600, color: '#202325', lineHeight: 1.35,
              textDecoration: status === 'done' ? 'line-through' : 'none',
              opacity: status === 'done' ? 0.5 : 1,
              transition: 'opacity 0.3s',
            }}>
              {habit.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <HabitTag value={Math.round((habit.completionRate ?? 0) * 100)} icon="dumbbell" />
              <HabitTag value={habit.streak} icon="flame" />
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

// ── Motivation Tip Card ─────────────────────────────────────────
function TipCard() {
  const tip = useMemo(() => TIPS[Math.floor(Date.now() / 86400000) % TIPS.length], []);
  return (
    null
  );
}

// ── Today Progress Ring ─────────────────────────────────────────
function TodayProgressCard({ done, partial, total }: { done: number; partial: number; total: number }) {
  const pct = total > 0 ? Math.round(((done + partial * 0.5) / total) * 100) : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const emoji = pct === 100 ? '🎉' : pct >= 50 ? '💪' : pct > 0 ? '🌱' : '☀️';
  const label = pct === 100 ? 'Бүгдийг гүйцэтгэлэ!' : pct >= 50 ? 'Сайн яваа байна' : 'Өглөөний идэвх';

  return (
    null
  );
}

// ── Dashboard Page ──────────────────────────────────────────────
export function DashboardPage() {
  const navigate  = useNavigate();
  const allHabits = useHabits();
  const habits    = useMemo(() => allHabits.filter(h => !h.archived), [allHabits]);

  const [logMap, setLogMap]       = useState<Map<string, LogEntry>>(new Map());
  const [logTarget, setLogTarget] = useState<Habit | null>(null);

  const handleBadgeTap = (habit: Habit) => {
    if (logMap.get(habit.id)?.status === 'done') return;
    if (habit.type === 'binary') {
      recordLog(habit, 1);
    } else {
      setLogTarget(habit);
    }
  };

  const recordLog = (habit: Habit, value: number) => {
    const status = calcStatus(habit, value);
    if (status === 'none') return;
    const entry: LogEntry = { value, status };
    setLogMap(prev => new Map(prev).set(habit.id, entry));
    logCompletion(habit.id, status, { value, trigger_source: 'quick-dashboard' });
    trackEvent('ui_event', `quick_${status}`, habit.id);
  };

  const today    = new Date();
  const hour     = today.getHours();
  const greeting = hour < 5 ? 'Шөнийн мэнд' : hour < 12 ? 'Өглөөний мэнд' : hour < 17 ? 'Өдрийн мэнд' : 'Оройн мэнд';
  const dateStr  = today.toLocaleDateString('mn-MN', { month: 'long', day: 'numeric', weekday: 'long' });

  const doneCount    = [...logMap.values()].filter(e => e.status === 'done').length;
  const partialCount = [...logMap.values()].filter(e => e.status === 'partial').length;
  const totalCount   = habits.length;

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden bg-background">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-14 pb-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', fontWeight: 500, marginBottom: 2 }}>
              {dateStr}
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#202325', letterSpacing: '-0.3px' }}>
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

      {/* ── Today Progress Card ── */}
      {totalCount > 0 && (
        <TodayProgressCard done={doneCount} partial={partialCount} total={totalCount} />
      )}

      {/* ── Week Strip ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
        className="px-0 pt-5 pb-4"
      >
        <WeekStrip />
      </motion.div>

      {/* ── Section label ── */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <p style={{ fontSize: 13, fontWeight: 700, color: '#202325' }}>
          Өнөөдрийн дадлууд
        </p>
        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)' }}>
          {totalCount} дадал
        </p>
      </div>

      {/* ── Habit Cards ── */}
      <div className="px-5 flex flex-col gap-2.5">
        {habits.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <span style={{ fontSize: 52 }} className="mb-4">🌱</span>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#202325' }} className="mb-2">
              Дадал байхгүй байна
            </p>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.42)', lineHeight: 1.6 }} className="mb-8 max-w-[210px]">
              Анхны дадлаа нэмж, хувийн өөрчлөлтийн аялалаа эхэлцгээе!
            </p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/create')}
              className="rounded-full px-6 py-3"
              style={{ backgroundColor: CTA_DARK.bg, fontSize: 14, fontWeight: 600, color: '#fff', boxShadow: CTA_DARK.shadow }}>
              + Дадал нэмэх
            </motion.button>
          </motion.div>
        ) : (
          <>
            {habits.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                index={i}
                entry={logMap.get(habit.id)}
                onBadgeTap={() => handleBadgeTap(habit)}
              />
            ))}

            {/* Guidance card */}
            <div className="mt-1">
              <TipCard />
            </div>
          </>
        )}
      </div>

      {/* ── Quick Log Sheet ── */}
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