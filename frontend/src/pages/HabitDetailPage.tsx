import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Archive, Clock, MapPin,
  Bell, BellOff, Check, X, ChevronRight,
  Delete, Pencil, Heart, Calendar, Target, BarChart3,
} from 'lucide-react';
import { getHabitColor, CTA_DARK } from '@/lib/habit-colors';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import type { Habit, HabitLog, Weekday } from '@/api/types';
import { MonthCalendar, toLocalDateStr } from '@/components/month-calendar';
import { countCompletedDays, getLatestLogsByDay, toLocalISO } from '@/lib/habit-log-days';

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_MAP: Record<string, string> = {
  MONDAY: 'Да', TUESDAY: 'Мя', WEDNESDAY: 'Лх', THURSDAY: 'Пү',
  FRIDAY: 'Ба', SATURDAY: 'Бя', SUNDAY: 'Ня',
};
const ALL_DAYS: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
function isBinaryHabit(h: Habit) {
  return h.targetValue === 1 && ['удаа', 'times', 'boolean'].includes(h.measurementUnit);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── UI Building Blocks ────────────────────────────────────────────────────────

function SectionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-[20px] overflow-hidden bg-card" style={{ boxShadow: SHADOW.card }}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3.5 pb-3"
      style={{ borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
      {icon}
      <span style={TYPOGRAPHY.sectionTitle} className="text-foreground">{label}</span>
    </div>
  );
}

function Row({ left, right, divider = true }: { left: React.ReactNode; right: React.ReactNode; divider?: boolean }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="flex-1 min-w-0">{left}</span>
        <span>{right}</span>
      </div>
      {divider && <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />}
    </>
  );
}

// ── Dashboard-style Quick Log Sheet ──────────────────────────────────────────

function calcProgress(habit: Habit, loggedValue: number): number {
  if (isBinaryHabit(habit)) return loggedValue > 0 ? 100 : 0;
  return Math.min((loggedValue / (habit.targetValue || 1)) * 100, 100);
}

function calcStatus(habit: Habit, value: number): 'none' | 'partial' | 'done' {
  if (isBinaryHabit(habit)) return value > 0 ? 'done' : 'none';
  const target = habit.targetValue || 1;
  if (value >= target) return 'done';
  if (value > 0) return 'partial';
  return 'none';
}

function QuickLogSheet({ habit, onClose, onLog, currentValue = 0, color }: {
  habit: Habit;
  onClose: () => void;
  onLog: (value: number) => void;
  currentValue?: number;
  color: ReturnType<typeof getHabitColor>;
}) {
  const [input, setInput] = useState('');
  const addValue = parseFloat(input) || 0;
  const numValue = currentValue + addValue;
  const target = habit.targetValue || 1;
  const min = habit.minimumTarget ?? 1;
  const status = calcStatus(habit, numValue);
  const pct = calcProgress(habit, numValue);
  const habitIcon = habit.iconValue || '✨';

  const handleKey = (key: string) => {
    if (key === 'AC') { setInput(''); return; }
    if (key === '⌫') { setInput(p => p.slice(0, -1)); return; }
    if (key === '.' && input.includes('.')) return;
    if (key === '.' && input === '') { setInput('0.'); return; }
    if (input.length >= 6) return;
    setInput(p => p === '0' && key !== '.' ? key : p + key);
  };

  const canConfirm = addValue > 0;
  const statusLabel =
    status === 'done' ? '✓ Зорилт биелэв!' :
    numValue > 0 ? `${numValue}/${target} ${habit.measurementUnit || ''}` :
    `Зорилт: ${target} ${habit.measurementUnit || ''}`;
  const statusColor =
    status === 'done' ? color.accent : status === 'partial' ? color.ring : 'var(--text-placeholder)';

  const keys = [
    ['1', '2', '3', 'AC'],
    ['4', '5', '6', '⌫'],
    ['7', '8', '9', ''],
    ['', '0', '.', '✓'],
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/25 z-40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] rounded-t-[28px] overflow-hidden bg-card"
          style={{ boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}>
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-9 h-[3px] rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
          </div>
          <div className="flex items-center gap-3 px-5 pb-4">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: color.btn }}>
              <span style={{ fontSize: 18 }}>{habitIcon}</span>
            </div>
            <div>
              <p style={TYPOGRAPHY.cardTitle} className="text-foreground">{habit.title}</p>
              <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                {currentValue > 0 ? `Одоогийн: ${currentValue} ${habit.measurementUnit || ''} · Нэмэх` : 'Хурдан бүртгэл'}
              </p>
            </div>
          </div>
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
              <p style={{ ...TYPOGRAPHY.caption, marginTop: 4 }} className="text-muted-foreground">
                {currentValue} + {addValue}
              </p>
            )}
            <div className="mt-3 mx-6">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
                <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.15 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: status === 'done' ? color.accent : color.ring }} />
              </div>
              <div className="flex justify-between mt-1.5">
                {min > 0 && min < target && (
                  <span style={{ fontSize: 11, color: 'var(--text-placeholder)' }}>min {min}</span>
                )}
                <span style={{ fontSize: 11, color: statusColor, fontWeight: 600, marginLeft: 'auto' }}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="px-4 pt-1 pb-2">
            {keys.map((row, ri) => (
              <div key={ri} className="flex gap-2.5 mb-2.5">
                {row.map((key, ki) => {
                  if (key === '') return <div key={ki} className="flex-1" />;
                  const isConfirm = key === '✓';
                  const isAC = key === 'AC';
                  const active = isConfirm && canConfirm;
                  return (
                    <motion.button key={ki} whileTap={{ scale: 0.88 }}
                      onClick={() => isConfirm ? (canConfirm && (onLog(numValue), onClose())) : handleKey(key)}
                      disabled={isConfirm && !canConfirm}
                      className={`${buttonStyles({ variant: 'plain', size: 'bare' })} flex-1 h-[54px] rounded-[18px] flex items-center justify-center bg-card`}
                      style={{
                        backgroundColor: isConfirm
                          ? (active ? color.btn : 'var(--surface-subtle)')
                          : isAC ? 'var(--surface-subtle)' : undefined,
                        boxShadow: isConfirm || isAC || key === '⌫' ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
                        fontSize: isConfirm ? 22 : 19, fontWeight: 600,
                        color: isConfirm
                          ? (active ? color.accent : 'var(--text-disabled)')
                          : isAC ? '#D94F6E' : undefined,
                      }}>
                      {key === '⌫' ? <Delete className="w-5 h-5 text-muted-foreground" /> : key}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export function HabitDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    if (!userId || !id) return;
    try {
      const [h, l] = await Promise.all([
        habitsApi.getHabit(userId, id),
        habitsApi.listLogs(userId, id),
      ]);
      setHabit(h); setLogs(l);
    } catch (err) { console.error('Failed to load habit:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [userId, id]);

  // ── Streak calculation ─────────────────────────────────────────────────────
  const latestLogsByDay = useMemo(() => getLatestLogsByDay(logs), [logs]);
  const totalCompletedDays = useMemo(() => countCompletedDays(logs), [logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-7 h-7 rounded-full border-2 border-t-transparent border-primary" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p style={{ fontSize: 48 }}>🔍</p>
          <p style={{ ...TYPOGRAPHY.cardTitle, fontWeight: 500, marginTop: 12 }} className="text-foreground">Дадал олдсонгүй</p>
          <p style={{ ...TYPOGRAPHY.bodySm, marginTop: 6 }} className="text-muted-foreground">Энэ дадал устгагдсан байж болзошгүй</p>
          <button onClick={() => navigate('/dashboard')}
            className={`mt-6 ${buttonStyles({ variant: 'default', size: 'lg' })}`}
            style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, fontSize: 14, fontWeight: 500, boxShadow: CTA_DARK.shadow }}>
            Нүүр хуудас руу
          </button>
        </div>
      </div>
    );
  }

  const color = getHabitColor(habit.color);
  const habitIcon = habit.iconValue || '?';
  const binary = isBinaryHabit(habit);

  const scheduledDays = habit.scheduleDays.map(s => s.weekday);
  const daysLabel =
    scheduledDays.length === 7 ? 'Өдөр бүр' :
    scheduledDays.length === 5 && !scheduledDays.includes('SATURDAY') && !scheduledDays.includes('SUNDAY')
      ? 'Ажлын өдрүүд' : `Долоо хоногт ${scheduledDays.length} өдөр`;

  const todayStr = toLocalDateStr(new Date());
  const todayLog = latestLogsByDay.get(todayStr);
  const todayVal = todayLog?.actualValue ?? 0;

  const timeCue = habit.cues.find(c => c.startTime || c.endTime);
  const locationCue = habit.cues.find(c => c.coarseLocation);
  const routineCue = habit.cues.find(c => c.precedingRoutine);

  const handleArchive = async () => {
    if (!userId || !id) return;
    try {
      await habitsApi.updateHabit(userId, id, { status: 'ARCHIVED' });
      navigate('/dashboard');
    } catch (err) { console.error('Archive failed:', err); }
  };

  const handleNumericLog = async (value: number) => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      if (todayLog) {
        await habitsApi.updateLog(userId, habit.id, todayLog.id, {
          actualValue: value,
        });
      } else {
        await habitsApi.createLog(userId, habit.id, {
          actualValue: value,
          completedAt: toLocalISO(new Date()),
          triggerSource: 'SELF_INITIATED',
        });
      }
      await fetchAll();
    } catch (err) { console.error('Log failed:', err); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-5 pt-13 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className={buttonStyles({ variant: 'nav', size: 'icon' })}
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <p style={TYPOGRAPHY.navTitle} className="truncate mx-3 flex-1 text-center text-foreground">{habit.title}</p>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(`/habit/${id}/edit`)}
              className={buttonStyles({ variant: 'nav', size: 'icon' })}
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <Pencil className="w-4 h-4" style={{ color: '#474747' }} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowArchiveConfirm(true)}
              className={buttonStyles({ variant: 'nav', size: 'icon' })}
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <Archive className="w-4 h-4" style={{ color: '#474747' }} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-5">

        {/* ── 1. HERO BAND ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-5 bg-card" style={{ boxShadow: SHADOW.card }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: color.btn }}>
              <span style={{ fontSize: 24 }}>{habitIcon}</span>
            </div>
            <p style={TYPOGRAPHY.cardTitle} className="text-foreground flex-1 min-w-0">{habit.title}</p>
          </div>
        </motion.div>

        {/* ── Analytics shortcut ── */}
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/analytics?habitId=${habit.id}`)}
          className="w-full flex items-center gap-3 rounded-[20px] px-4 py-3.5 bg-card text-left"
          style={{ boxShadow: SHADOW.card }}
        >
          <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: color.btn }}>
            <BarChart3 className="w-4.5 h-4.5" style={{ color: color.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 600 }} className="text-foreground">Дадлын ахиц харах</p>
            <p style={TYPOGRAPHY.micro} className="text-muted-foreground">Шинжилгээ, статистик, календар</p>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-disabled)' }} />
        </motion.button>

        {/* ── 2. HABIT SENTENCE ── */}
        <div className="rounded-[20px] bg-card px-4 py-4" style={{ boxShadow: SHADOW.card }}>
          <p style={{ ...TYPOGRAPHY.sectionTitle, lineHeight: 1.75 }} className="text-foreground">
            {habit.precedingRoutine ? (
              <>
                <span style={{ color: 'var(--text-soft)' }}>{habit.precedingRoutine} </span>
                <span style={{ fontWeight: 500 }}>дараа </span>
              </>
            ) : null}
            <span style={{ ...TYPOGRAPHY.sectionTitle }}>{habit.title}</span>
            <span style={{ fontWeight: 500 }}> дадлыг хийнэ.</span>
          </p>
          {habit.motivationProfile?.reason && (
            <p style={{ ...TYPOGRAPHY.body, lineHeight: 1.65, marginTop: 8 }} className="text-foreground">
              <span style={{ fontWeight: 500 }}>Ингэснээр би: </span>
              <span style={{ ...TYPOGRAPHY.sectionTitle, color: color.accent }}>{habit.motivationProfile.reason}</span>
            </p>
          )}
        </div>

        {/* ── 5. ЗОРИЛТ БА ХУВААРЬ ── */}
        <SectionCard delay={0.09}>
          <SectionLabel icon={<Target className="w-4 h-4" style={{ color: color.accent }} />} label="Зорилт ба хуваарь" />
          {!binary && (
            <Row
              left={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">Зорилт</span>}
              right={<span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600 }} className="text-foreground">{habit.targetValue} {habit.measurementUnit}</span>}
            />
          )}
          {!binary && habit.minimumTarget > 1 && (
            <Row
              left={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">Хамгийн бага</span>}
              right={<span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600 }} className="text-foreground">{habit.minimumTarget} {habit.measurementUnit}</span>}
            />
          )}
          <div className="px-4 pt-1 pb-3">
            <div className="flex gap-1.5 mb-2">
              {ALL_DAYS.map(day => {
                const active = scheduledDays.includes(day);
                return (
                  <div key={day} className="flex-1 py-1.5 rounded-[10px] flex items-center justify-center"
                    style={{
                      backgroundColor: active ? color.btn : 'rgba(0,0,0,0.04)',
                      fontSize: 11, fontWeight: active ? 600 : 400,
                      color: active ? '#202325' : 'rgba(0,0,0,0.3)',
                    }}>{DAYS_MAP[day]}</div>
                );
              })}
            </div>
            <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
              {daysLabel} · {formatDate(habit.startDate)}-аас эхэлсэн
            </p>
          </div>
        </SectionCard>

        {/* ── 6. АЧ ТУС ── */}
        {habit.benefits && habit.benefits.length > 0 && (
          <SectionCard delay={0.12}>
            <SectionLabel icon={<Heart className="w-4 h-4" style={{ color: color.accent }} />} label="Ач тус" />
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {habit.benefits.map(b => (
                <span key={b} className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: color.btn, ...TYPOGRAPHY.caption, color: '#202325' }}>
                  {b}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {habit.steps && habit.steps.length > 0 && (
          <SectionCard delay={0.135}>
            <SectionLabel icon={<Check className="w-4 h-4" style={{ color: color.accent }} />} label="Жижиг алхмууд" />
            <div className="px-4 py-3 flex flex-col gap-2.5">
              {habit.steps.map((step) => (
                <div key={`${step.orderIndex}-${step.title}`} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color.btn, ...TYPOGRAPHY.micro, fontWeight: 700 }}>
                    {step.orderIndex + 1}
                  </div>
                  <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── 7. ДОХИО БА САНУУЛГА ── */}
        <SectionCard delay={0.15}>
          <SectionLabel icon={<Bell className="w-4 h-4" style={{ color: color.accent }} />} label="Дохио ба сануулга" />
          <Row
            left={
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  {habit.reminderEnabled
                    ? <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                    : <BellOff className="w-3.5 h-3.5" style={{ color: 'rgba(0,0,0,0.35)' }} />}
                </div>
                <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Сануулга</span>
              </div>
            }
            right={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">{habit.reminderEnabled ? 'Идэвхтэй' : 'Идэвхгүй'}</span>}
            divider={!!(timeCue || locationCue || routineCue)}
          />
          {timeCue && (
            <Row
              left={
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn + '22' }}>
                    <Clock className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Цагийн хүрээ</span>
                </div>
              }
              right={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">{[timeCue.startTime, timeCue.endTime].filter(Boolean).join(' – ')}</span>}
              divider={!!(locationCue || routineCue)}
            />
          )}
          {locationCue && (
            <Row
              left={
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn + '22' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Байршил</span>
                </div>
              }
              right={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">{locationCue.coarseLocation}</span>}
              divider={!!routineCue}
            />
          )}
          {routineCue && (
            <Row
              left={
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn + '22' }}>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Өмнөх хэрэглүүр</span>
                </div>
              }
              right={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">{routineCue.precedingRoutine}</span>}
              divider={false}
            />
          )}
        </SectionCard>

        {/* ── 8. ГҮЙЦЭТГЭЛИЙН ТҮҮХ / ХУАНЛИ ── */}
        <SectionCard delay={0.18}>
          <SectionLabel icon={<Calendar className="w-4 h-4" style={{ color: color.accent }} />} label="Гүйцэтгэлийн түүх" />
          <div className="px-4 pt-1 pb-3">
            <MonthCalendar
              logs={logs}
              accent={color.accent}
              scheduleDays={habit.scheduleDays.map(s => s.weekday)}
              startDate={habit.startDate}
            />
          </div>
          {logs.length > 0 ? (
            <>
              <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)' }} />
              <div className="px-4 py-3 flex flex-col gap-2.5">
                {logs.slice(0, 6).map(log => (
                  <div key={log.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: log.status === 'DONE' ? color.btn : 'rgba(0,0,0,0.06)' }}>
                      {log.status === 'DONE'
                        ? <Check className="w-3.5 h-3.5" style={{ color: color.accent }} strokeWidth={2.5} />
                        : <X className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.3)' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">{log.status === 'DONE' ? 'Дууссан' : 'Хийгдээгүй'}</span>
                      {!binary && log.actualValue != null && (
                        <span style={{ ...TYPOGRAPHY.caption, marginLeft: 6 }} className="text-muted-foreground">{log.actualValue} {habit.measurementUnit}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span style={{ ...TYPOGRAPHY.micro, whiteSpace: 'nowrap' }} className="text-muted-foreground">{formatDate(log.completedAt)}</span>
                      <span style={{ ...TYPOGRAPHY.micro, whiteSpace: 'nowrap' }} className="text-muted-foreground">{formatTime(log.completedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center px-4 py-8">
              <p style={{ fontSize: 32 }}>📝</p>
              <p style={{ ...TYPOGRAPHY.bodySm, marginTop: 8 }} className="text-muted-foreground">Бүртгэл байхгүй байна</p>
            </div>
          )}
        </SectionCard>

        {/* ── 9. ТОХИРГОО ── */}
        <SectionCard delay={0.21}>
          <SectionLabel icon={<Archive className="w-4 h-4" style={{ color: '#474747' }} />} label="Тохиргоо" />
          <Row
            left={<span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Нийт биелсэн</span>}
            right={<span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600 }} className="text-foreground">{totalCompletedDays} өдөр</span>}
          />
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowArchiveConfirm(true)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${buttonStyles({ variant: 'ghost', size: 'default' })}`}>
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.10)' }}>
              <Archive className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
            </div>
            <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, color: '#EF4444' }}>Архивлах</span>
          </motion.button>
        </SectionCard>
      </div>

      {/* ARCHIVE CONFIRM */}
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
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
              <div className="w-full max-w-[430px] bg-card rounded-t-[28px] px-6 pb-10 pt-5"
                style={{ boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}>
                <div className="w-9 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
                <div className="text-center mb-6">
                  <p style={{ fontSize: 40 }}>🗂️</p>
                  <p style={{ ...TYPOGRAPHY.pageTitle, fontWeight: 500, marginTop: 12 }} className="text-foreground">Дадлаа архивлах уу?</p>
                  <p className="mt-2 text-muted-foreground" style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }}>
                    Архивласан дадал хяналтын самбараас нуугдана,<br />харин гүйцэтгэлийн түүх хадгалагдана.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleArchive}
                    className={`w-full ${buttonStyles({ variant: 'default', size: 'lg' })}`}
                    style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, fontSize: 15, fontWeight: 500, boxShadow: CTA_DARK.shadow }}>
                    Тийм, архивлах
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowArchiveConfirm(false)}
                    className={`w-full ${buttonStyles({ variant: 'secondary', size: 'lg' })}`}
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#474747', fontSize: 14, fontWeight: 500 }}>
                    Болих
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QUICK LOG SHEET (numeric) */}
      <AnimatePresence>
        {showLogSheet && !binary && (
          <QuickLogSheet
            habit={habit}
            color={color}
            currentValue={todayVal}
            onClose={() => setShowLogSheet(false)}
            onLog={handleNumericLog}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
