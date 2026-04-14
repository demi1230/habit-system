import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Edit3, Archive, Clock, MapPin,
  Heart, Bell, BellOff, Check, X, ChevronRight,
  Shield, TrendingUp, Flame, Minus, Plus,
} from 'lucide-react';
import {
  useHabit, archiveHabit, logCompletion, getTagById,
  getHabitStrength, updateHabit,
} from '../store';
import { getHabitColor, CTA_DARK } from '../lib/habit-colors';

// ── Helpers ───────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const DAYS_MAP: Record<string, string> = {
  Mon: 'Да', Tue: 'Мя', Wed: 'Лх', Thu: 'Пү', Fri: 'Ба', Sat: 'Бя', Sun: 'Ня',
};
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
}

function getLast28Days() {
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 27 + i);
    return d.toISOString().split('T')[0];
  });
}

// ── Sub-components ────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      color: 'rgba(0,0,0,0.35)', marginBottom: 8, paddingLeft: 2,
    }}>
      {children}
    </p>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="rounded-[20px] overflow-hidden bg-card"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)', ...style }}>
      {children}
    </div>
  );
}

function CardRow({
  icon, label, value, divider = true, accent,
}: {
  icon?: React.ReactNode; label: string; value?: React.ReactNode;
  divider?: boolean; accent?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {icon && (
          <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: accent ? accent + '22' : 'rgba(0,0,0,0.06)' }}>
            {icon}
          </div>
        )}
        <span style={{ fontSize: 13, fontWeight: 500, color: '#202325', flex: 1 }}>{label}</span>
        {value && <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', fontWeight: 400 }}>{value}</span>}
      </div>
      {divider && <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />}
    </>
  );
}

function StrengthBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between mb-1.5">
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Quick Log Widget ──────────────────────────────────────────
function QuickLogWidget({
  habit, onLogged, color,
}: {
  habit: NonNullable<ReturnType<typeof useHabit>>;
  onLogged: () => void;
  color: ReturnType<typeof getHabitColor>;
}) {
  const todayLog = habit.completions.find(c => c.date === TODAY);
  const isAlreadyDone = todayLog?.completed;

  const [value, setValue] = useState(
    todayLog?.value ?? (habit.targetValue ?? 1)
  );

  const target  = habit.targetValue ?? 1;
  const minVal  = habit.minValue ?? 1;
  const pct     = Math.min((value / target) * 100, 100);
  const status  = value >= target ? 'done' : value > 0 ? 'partial' : 'none';

  const statusLabel =
    status === 'done'    ? 'Зорилт биелэв ✓' :
    status === 'partial' ? `${value}/${target} ${habit.unit ?? ''}` :
    `Зорилт: ${target} ${habit.unit ?? ''}`;

  const statusColor =
    status === 'done' ? color.accent : status === 'partial' ? color.ring : 'rgba(0,0,0,0.35)';

  const handleLog = () => {
    if (habit.type === 'binary') {
      logCompletion(habit.id, 'done', { value: 1, trigger_source: 'manual' });
    } else {
      if (status === 'none') return;
      logCompletion(habit.id, status, { value, trigger_source: 'manual' });
    }
    onLogged();
  };

  // Binary habit
  if (habit.type === 'binary') {
    return (
      <div className="px-4 py-4">
        {isAlreadyDone ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 justify-center py-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color.btn }}>
              <Check className="w-5 h-5" style={{ color: color.accent }} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: color.accent }}>
              Өнөөдөр дууссан
            </span>
          </motion.div>
        ) : (
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleLog}
            className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2"
            style={{ backgroundColor: CTA_DARK.bg, boxShadow: CTA_DARK.shadow }}>
            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Өнөөдөр хийлээ</span>
          </motion.button>
        )}
      </div>
    );
  }

  // Measurable habit
  return (
    <div className="px-4 pt-3 pb-4">
      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
        <motion.div
          animate={{ width: `${pct}%` }} transition={{ duration: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: status === 'done' ? color.accent : color.ring }}
        />
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3 mb-3">
        <motion.button whileTap={{ scale: 0.86 }}
          onClick={() => setValue(v => Math.max(0, +(v - (target >= 10 ? 1 : 0.5)).toFixed(1)))}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
          <Minus className="w-4 h-4" style={{ color: '#474747' }} />
        </motion.button>

        <div className="flex-1 text-center">
          <span style={{ fontSize: 32, fontWeight: 700, color: statusColor, letterSpacing: '-1px', transition: 'color 0.2s' }}>
            {value}
          </span>
          <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', marginLeft: 4 }}>{habit.unit}</span>
        </div>

        <motion.button whileTap={{ scale: 0.86 }}
          onClick={() => setValue(v => +(v + (target >= 10 ? 1 : 0.5)).toFixed(1))}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: color.btn }}>
          <Plus className="w-4 h-4" style={{ color: color.accent }} />
        </motion.button>
      </div>

      {/* Status label */}
      <p className="text-center mb-3" style={{ fontSize: 12, color: statusColor, fontWeight: 600, minHeight: 16, transition: 'color 0.2s' }}>
        {statusLabel}
      </p>

      {/* Log button */}
      <motion.button whileTap={{ scale: 0.96 }} onClick={handleLog}
        disabled={status === 'none'}
        className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-opacity"
        style={{
          backgroundColor: status !== 'none' ? CTA_DARK.bg : 'rgba(0,0,0,0.08)',
          boxShadow: status !== 'none' ? CTA_DARK.shadow : 'none',
          opacity: status === 'none' ? 0.5 : 1,
        }}>
        <Check className="w-4 h-4" style={{ color: status !== 'none' ? '#fff' : '#9ca3af' }} strokeWidth={2.5} />
        <span style={{ fontSize: 14, fontWeight: 600, color: status !== 'none' ? '#fff' : '#9ca3af' }}>
          {isAlreadyDone ? 'Дахин бүртгэх' : 'Бүртгэх'}
        </span>
      </motion.button>
    </div>
  );
}

// ── 28-day History Grid ───────────────────────────────────────
function HistoryGrid({
  habit, color,
}: {
  habit: NonNullable<ReturnType<typeof useHabit>>;
  color: ReturnType<typeof getHabitColor>;
}) {
  const days = useMemo(() => getLast28Days(), []);
  const logMap = useMemo(() => {
    const m: Record<string, { completed: boolean; partial: boolean }> = {};
    for (const c of habit.completions) m[c.date] = { completed: c.completed, partial: c.partial };
    return m;
  }, [habit.completions]);

  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
      {/* Day headers */}
      {['Да','Мя','Лх','Пү','Ба','Бя','Ня'].map(d => (
        <div key={d} className="text-center" style={{ fontSize: 10, color: 'rgba(0,0,0,0.32)', fontWeight: 600, paddingBottom: 2 }}>
          {d}
        </div>
      ))}
      {/* Dots */}
      {days.map(dateStr => {
        const log = logMap[dateStr];
        const isScheduled = habit.days.includes(
          ALL_DAYS[new Date(dateStr).getDay() === 0 ? 6 : new Date(dateStr).getDay() - 1]
        );
        const isToday = dateStr === TODAY;
        const bg =
          log?.completed  ? color.accent :
          log?.partial    ? color.ring + 'aa' :
          !isScheduled    ? 'transparent' :
          'rgba(0,0,0,0.07)';

        return (
          <div key={dateStr} className="relative flex items-center justify-center"
            style={{ aspectRatio: '1', borderRadius: 8,
              backgroundColor: bg,
              border: isToday ? `1.5px solid ${color.accent}` : 'none',
            }}>
            {log?.partial && !log?.completed && (
              <span style={{ fontSize: 8, color: color.accent, fontWeight: 700 }}>~</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function HabitDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const habit    = useHabit(id);

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [logKey, setLogKey] = useState(0); // force re-mount of log widget after save

  if (!habit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p style={{ fontSize: 48 }}>🔍</p>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#202325', marginTop: 12 }}>Дадал олдсонгүй</p>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.42)', marginTop: 6 }}>
            Энэ дадал устгагдсан байж болзошгүй
          </p>
          <button onClick={() => navigate('/dashboard')}
            className="mt-6 px-8 py-3 rounded-full"
            style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, fontSize: 14, fontWeight: 600, boxShadow: CTA_DARK.shadow }}>
            Нүүр хуудас руу
          </button>
        </div>
      </div>
    );
  }

  const color    = getHabitColor(habit);
  const tag      = getTagById(habit.goalTag);
  const strength = getHabitStrength(habit);

  // ── Today ─────────────────────────────────────────────────
  const todayLog = habit.completions.find(c => c.date === TODAY);
  const todayStatus =
    todayLog?.completed ? 'done' :
    todayLog?.partial   ? 'partial' :
    todayLog            ? 'logged' : 'none';

  const todayStatusLabel =
    todayStatus === 'done'    ? 'Дууссан ✓' :
    todayStatus === 'partial' ? `Хагасдсан · ${todayLog?.value} ${habit.unit ?? ''}` :
    'Бүртгэгдээгүй';

  const todayStatusColor =
    todayStatus === 'done'    ? color.accent :
    todayStatus === 'partial' ? color.ring :
    'rgba(0,0,0,0.38)';

  // ── XP ────────────────────────────────────────────────────
  const xp = habit.completions.filter(c => c.completed).length * 15
           + habit.completions.filter(c => c.partial).length * 5;

  // ── Days label ────────────────────────────────────────────
  const daysLabel =
    habit.days.length === 7 ? 'Өдөр бүр' :
    habit.days.length === 5 && !habit.days.includes('Sat') && !habit.days.includes('Sun')
      ? 'Ажлын өдрүүд' :
    `Долоо хоногт ${habit.days.length} өдөр`;

  return (
    <div className="min-h-screen bg-background pb-16">

      {/* ══ 1. HEADER ══════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-background"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-5 pt-13 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>

          <p style={{ fontSize: 15, fontWeight: 700, color: '#202325' }} className="truncate mx-3 flex-1 text-center">
            {habit.title}
          </p>

          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(`/edit/${habit.id}`)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <Edit3 className="w-4 h-4" style={{ color: '#474747' }} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowArchiveConfirm(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <Archive className="w-4 h-4" style={{ color: '#474747' }} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 pt-5">

        {/* ══ HERO BAND ══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] p-5 relative overflow-hidden"
          style={{ backgroundColor: color.card, boxShadow: '0 2px 16px rgba(0,0,0,0.09)' }}>

          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }} />
          <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />

          <div className="relative flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}>
              <span style={{ fontSize: 28 }}>{tag?.emoji || '✨'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 17, fontWeight: 700, color: '#202325', lineHeight: 1.3 }}>{habit.title}</p>
              {tag && (
                <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.6)', fontSize: 11, color: '#202325', fontWeight: 600 }}>
                  {tag.emoji} {tag.name}
                </span>
              )}
            </div>
          </div>

          {/* Stat pills */}
          <div className="relative flex gap-2.5">
            {[
              { label: 'Streak', value: `${habit.streak}`, suffix: ' өдөр' },
              { label: 'Хүч', value: `${strength.total}`, suffix: '/100' },
              { label: 'Гүйцэтгэл', value: `${Math.round(habit.completionRate)}`, suffix: '%' },
              { label: 'XP', value: `${xp}`, suffix: '' },
            ].map(item => (
              <div key={item.label} className="flex-1 rounded-[14px] py-2 px-2 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#202325', letterSpacing: '-0.3px' }}>
                  {item.value}<span style={{ fontSize: 10, fontWeight: 500, opacity: 0.6 }}>{item.suffix}</span>
                </p>
                <p style={{ fontSize: 9, color: 'rgba(0,0,0,0.45)', marginTop: 1, fontWeight: 600 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ 2. TODAY STATUS ════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <SectionLabel>ӨНӨӨДӨР</SectionLabel>
          <Card>
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', fontWeight: 500, marginBottom: 3 }}>
                  {new Date().toLocaleDateString('mn-MN', { month: 'long', day: 'numeric', weekday: 'short' })}
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: todayStatusColor, transition: 'color 0.3s' }}>
                  {todayStatusLabel}
                </p>
                {habit.reminderEnabled && habit.reminderWindow && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Bell className="w-3 h-3" style={{ color: color.accent }} />
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.42)' }}>{habit.reminderWindow}</span>
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: todayStatus === 'done' ? color.accent : todayStatus === 'partial' ? color.btn : 'rgba(0,0,0,0.07)',
                  transition: 'background-color 0.3s',
                }}>
                {todayStatus === 'done'
                  ? <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                  : todayStatus === 'partial'
                  ? <span style={{ fontSize: 18, color: color.accent }}>~</span>
                  : <span style={{ fontSize: 18 }}>○</span>
                }
              </div>
            </div>

            {/* Target reference */}
            {habit.type === 'measurable' && habit.targetValue && (
              <>
                <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.42)' }}>Зорилт</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#202325' }}>
                    {habit.targetValue} {habit.unit}
                    {habit.minValue ? ` · хамгийн бага ${habit.minValue}` : ''}
                  </span>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* ══ 3. WHY CARD ════════════════════════════════════════ */}
        {habit.personalReason && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
            <SectionLabel>ЯАГААД ЧУХАЛ ВЭ</SectionLabel>
            <div className="rounded-[20px] px-4 py-4"
              style={{ backgroundColor: color.btn + 'bb', border: `1px solid ${color.accent}20`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Heart className="w-3.5 h-3.5" style={{ color: color.accent }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: color.accent, letterSpacing: '0.04em' }}>
                  МИНИЙ ШАЛТГААН
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#202325', lineHeight: 1.65 }}>
                {habit.personalReason}
              </p>
              {habit.identityStatement && (
                <p className="mt-2.5 italic" style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', lineHeight: 1.55 }}>
                  "{habit.identityStatement}"
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ══ 4. CUE SUMMARY ════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <SectionLabel>ДОХИО БА ХУВААРЬ</SectionLabel>
          <Card>
            {/* Days strip */}
            <div className="px-4 py-3">
              <div className="flex gap-1.5">
                {ALL_DAYS.map(day => {
                  const active = habit.days.includes(day);
                  return (
                    <div key={day} className="flex-1 py-1.5 rounded-[10px] flex items-center justify-center"
                      style={{
                        backgroundColor: active ? color.btn : 'rgba(0,0,0,0.04)',
                        fontSize: 11, fontWeight: active ? 700 : 400,
                        color: active ? '#202325' : 'rgba(0,0,0,0.3)',
                      }}>
                      {DAYS_MAP[day]}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2" style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', fontWeight: 500 }}>
                {daysLabel} · {habit.startDate} -аас
              </p>
            </div>

            {(habit.timeWindow || habit.location || habit.precedingRoutine) && (
              <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />
            )}

            {habit.timeWindow && (
              <CardRow
                icon={<Clock className="w-3.5 h-3.5" style={{ color: color.accent }} />}
                label="Цагийн хүрээ" value={habit.timeWindow}
                accent={color.btn}
                divider={!!(habit.location || habit.precedingRoutine)}
              />
            )}
            {habit.location && (
              <CardRow
                icon={<MapPin className="w-3.5 h-3.5" style={{ color: color.accent }} />}
                label="Байршил" value={habit.location}
                accent={color.btn}
                divider={!!habit.precedingRoutine}
              />
            )}
            {habit.precedingRoutine && (
              <CardRow
                icon={<ChevronRight className="w-3.5 h-3.5" style={{ color: color.accent }} />}
                label="Өмнөх хэрэглүүр"
                value={habit.precedingRoutine}
                accent={color.btn}
                divider={false}
              />
            )}
          </Card>
        </motion.div>

        {/* ══ 5. QUICK LOG ══════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <SectionLabel>ХУРДАН БҮРТГЭЛ</SectionLabel>
          <Card>
            <QuickLogWidget
              key={logKey}
              habit={habit}
              color={color}
              onLogged={() => setLogKey(k => k + 1)}
            />
          </Card>
        </motion.div>

        {/* ══ 6. STRENGTH ═══════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <SectionLabel>ДАДЛЫН ХҮЧ</SectionLabel>
          <Card>
            {/* Score header */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: color.accent }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#202325' }}>Нийт хүч</span>
              </div>
              <div className="flex items-end gap-1">
                <span style={{ fontSize: 26, fontWeight: 800, color: color.accent, letterSpacing: '-1px' }}>
                  {strength.total}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.35)', paddingBottom: 3 }}>/100</span>
              </div>
            </div>

            {/* Bars */}
            <div className="px-4 py-4">
              <StrengthBar label="Тогтмол байдал" value={strength.consistency} color={color.accent} />
              <StrengthBar label="Бие даасан байдал" value={strength.independence} color={color.ring} />
              <StrengthBar label="Тогтвортой байдал" value={strength.stability} color={color.ring + 'aa'} />
            </div>

            {/* Interpretation */}
            <div className="px-4 pb-4">
              <div className="rounded-[14px] px-3.5 py-2.5"
                style={{ backgroundColor: color.btn + '88' }}>
                <p style={{ fontSize: 12, color: '#202325', lineHeight: 1.6 }}>
                  {strength.total >= 70
                    ? '💪 Маш сайн — дадал нь бие даасан болж байна.'
                    : strength.total >= 40
                    ? '🌱 Хөгжиж байна — тогтмол байдал нэмэгдэж байна.'
                    : '🔰 Эхлэлийн шатанд — өдөр бүр хийх нь чухал.'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ══ 7. HISTORY ════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}>
          <SectionLabel>ГҮЙЦЭТГЭЛИЙН ТҮҮХ</SectionLabel>
          <Card>
            {/* 28-day grid */}
            <div className="px-4 pt-4 pb-3">
              <HistoryGrid habit={habit} color={color} />
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.accent }} />
                  <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)' }}>Дууссан</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.ring + 'aa' }} />
                  <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)' }}>Хагасдсан</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)' }}>Хийгдээгүй</span>
                </div>
              </div>
            </div>

            {/* Recent log list */}
            {habit.completions.length > 0 && (
              <>
                <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)' }} />
                <div className="px-4 py-3 flex flex-col gap-2.5">
                  {habit.completions.slice(0, 6).map((log, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: log.completed ? color.btn : log.partial ? color.ring + '22' : 'rgba(0,0,0,0.06)',
                        }}>
                        {log.completed
                          ? <Check className="w-3.5 h-3.5" style={{ color: color.accent }} strokeWidth={2.5} />
                          : log.partial
                          ? <span style={{ fontSize: 12, color: color.ring, fontWeight: 700 }}>~</span>
                          : <X className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.3)' }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <span style={{ fontSize: 13, color: '#202325', fontWeight: 500 }}>
                          {log.completed ? 'Дууссан' : log.partial ? 'Хагасдсан' : 'Хийгдээгүй'}
                        </span>
                        {habit.type === 'measurable' && (
                          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.42)', marginLeft: 6 }}>
                            {log.value} {habit.unit}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {log.reflection?.feeling && (
                          <span className="px-2 py-0.5 rounded-full"
                            style={{ fontSize: 10, backgroundColor: color.btn, color: color.accent, fontWeight: 600 }}>
                            {log.reflection.feeling}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>
                          {formatDate(log.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {habit.completions.length === 0 && (
              <div className="text-center px-4 py-8">
                <p style={{ fontSize: 32 }}>📝</p>
                <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.42)', marginTop: 8 }}>
                  Бүртгэл байхгүй байна
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ══ 8. SETTINGS ═══════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <SectionLabel>ТОХИРГОО</SectionLabel>
          <Card>
            {/* Edit */}
            <motion.button whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/edit/${habit.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: color.btn }}>
                <Edit3 className="w-3.5 h-3.5" style={{ color: color.accent }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#202325', flex: 1 }}>Дадал засах</span>
              <ChevronRight className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.25)' }} />
            </motion.button>

            <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />

            {/* Reminder toggle */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: color.btn }}>
                {habit.reminderEnabled
                  ? <Bell className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  : <BellOff className="w-3.5 h-3.5" style={{ color: 'rgba(0,0,0,0.35)' }} />}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#202325', flex: 1 }}>Сануулга</span>
              <motion.button
                onClick={() => updateHabit(habit.id, { reminderEnabled: !habit.reminderEnabled })}
                className="relative rounded-full shrink-0"
                style={{
                  width: 44, height: 26,
                  backgroundColor: habit.reminderEnabled ? color.accent : 'rgba(0,0,0,0.15)',
                  transition: 'background-color 0.2s',
                }}>
                <motion.div
                  animate={{ x: habit.reminderEnabled ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-[3px] w-5 h-5 rounded-full bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                />
              </motion.button>
            </div>

            {/* Streak / Stats */}
            <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: color.btn }}>
                <Flame className="w-3.5 h-3.5" style={{ color: color.accent }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#202325', flex: 1 }}>Streak</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#202325' }}>{habit.streak} өдөр</span>
            </div>

            <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: color.btn }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: color.accent }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#202325', flex: 1 }}>Нийт бүртгэл</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#202325' }}>{habit.completions.length} удаа</span>
            </div>

            <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />

            {/* Archive */}
            <motion.button whileTap={{ scale: 0.98 }}
              onClick={() => setShowArchiveConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239,68,68,0.10)' }}>
                <Archive className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#EF4444', flex: 1 }}>Архивлах</span>
            </motion.button>
          </Card>
        </motion.div>

      </div>{/* /content */}

      {/* ══ ARCHIVE CONFIRM SHEET ══════════════════════════════ */}
      <AnimatePresence>
        {showArchiveConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
              onClick={() => setShowArchiveConfirm(false)} />
            <motion.div
              initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            >
              <div className="w-full max-w-[430px] bg-card rounded-t-[28px] px-6 pb-10 pt-5"
                style={{ boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}>
                <div className="w-9 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
                <div className="text-center mb-6">
                  <p style={{ fontSize: 40 }}>🎉</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#202325', marginTop: 12 }}>
                    Дадлаа архивлах уу?
                  </p>
                  <p className="mt-2" style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', lineHeight: 1.6 }}>
                    Архивласан дадал хяналтын самбараас нуугдана,<br/>харин гүйцэтгэлийн түүх хадгалагдана.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowArchiveConfirm(false); archiveHabit(habit.id); navigate('/archive'); }}
                    className="w-full py-3.5 rounded-full"
                    style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, fontSize: 15, fontWeight: 600, boxShadow: CTA_DARK.shadow }}>
                    Тийм, архивлах
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => setShowArchiveConfirm(false)}
                    className="w-full py-3 rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#474747', fontSize: 14, fontWeight: 500 }}>
                    Үргэлжлүүлэх
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
