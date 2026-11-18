import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Archive, Clock, MapPin,
  Bell, BellOff, Check, ChevronRight,
  Pencil, Heart, Calendar, Target, Search, FileText,
} from 'lucide-react';
import { getHabitColor, CTA_DARK } from '@/lib/habit-colors';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import type { Habit, HabitLog } from '@/api/types';
import { MonthCalendar } from '@/components/month-calendar';
import { WeekdayStrip } from '@/components/weekday-strip';
import { HabitIconSlot } from '@/components/habit-icon-slot';
import { countCompletedDays, getLatestLogsByDay } from '@/lib/habit-log-days';
import { parseRoutineCue } from '@/lib/routine-cue';
import { isBinaryHabit } from '@/lib/habit-status';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}-р сарын ${d.getDate()}`;
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── UI Building Blocks ────────────────────────────────────────────────────────

function SectionCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`rounded-[20px] overflow-hidden bg-card ${className}`} style={{ boxShadow: SHADOW.card }}>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export function HabitDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();
  const backTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!userId || !id) return;
    try {
      const [h, l] = await Promise.all([
        habitsApi.getHabit(userId, id),
        habitsApi.listLogs(userId, id),
      ]);
      setHabit(h); setLogs(l);
    } catch (err) { console.error('Failed to load habit:', err); }
    finally { setLoading(false); }
  }, [userId, id]);

  useEffect(() => { void fetchAll(); }, [fetchAll, location.key]);

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
        <div className="text-center flex flex-col items-center">
          <div
            className="mb-5 w-[52px] h-[52px] rounded-[18px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}>
            <Search className="w-[26px] h-[26px]" strokeWidth={2} style={{ color: 'var(--text-muted-soft)' }} />
          </div>
          <p style={{ ...TYPOGRAPHY.cardTitle, fontWeight: 500 }} className="text-foreground">Дадал олдсонгүй</p>
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
  const binary = isBinaryHabit(habit);

  const scheduledDays = habit.scheduleDays.map(s => s.weekday);
  const daysLabel =
    scheduledDays.length === 7 ? 'Өдөр бүр' :
    scheduledDays.length === 5 && !scheduledDays.includes('SATURDAY') && !scheduledDays.includes('SUNDAY')
      ? 'Ажлын өдрүүд' : `Долоо хоногт ${scheduledDays.length} өдөр`;


  const timeCues = habit.cues.filter(c => c.isActive && (c.startTime || c.endTime));
  const locationCue = habit.cues.find(c => c.isActive && c.coarseLocation);
  const routineCue = habit.cues.find(c => c.isActive && c.precedingRoutine);

  const handleArchive = async () => {
    if (!userId || !id) return;
    try {
      await habitsApi.updateHabit(userId, id, { status: 'ARCHIVED' });
      navigate('/dashboard');
    } catch (err) { console.error('Archive failed:', err); }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-5 pt-13 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(backTo)}
            className={buttonStyles({ variant: 'nav', size: 'icon' })}
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <div className="flex items-center justify-center gap-2 mx-3 flex-1 min-w-0">
            <HabitIconSlot iconValue={habit.iconValue} emojiSizePx={20} circlePx={20} />
            <p style={TYPOGRAPHY.navTitle} className="truncate text-foreground">{habit.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(`/habit/${id}/edit`, { state: { from: backTo } })}
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

        {/* ── Analytics shortcut ── */}
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/analytics?habitId=${habit.id}`)}
          className="w-full flex items-center gap-3 rounded-[20px] px-4 py-3.5 bg-card text-left"
          style={{ boxShadow: SHADOW.card }}
        >
          <div className="flex-1 min-w-0">
            <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 600 }} className="text-foreground">Дадлын ахиц харах</p>
            <p style={TYPOGRAPHY.micro} className="text-muted-foreground">Шинжилгээ, статистик, календар</p>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-disabled)' }} />
        </motion.button>

        {/* ── 2. HABIT SENTENCE ── */}
        <div className="rounded-[20px] bg-card px-4 py-4" style={{ boxShadow: SHADOW.card }}>
          <p style={{ ...TYPOGRAPHY.sectionTitle, lineHeight: 1.75 }} className="text-foreground">
            {habit.precedingRoutine ? (() => {
              const { activity, timing } = parseRoutineCue(habit.precedingRoutine!);
              return (
                <>
                  <span style={{ }}>{activity} </span>
                  <span style={{ fontWeight: 500 }}>{timing} </span>
                </>
              );
            })() : null}
            <span style={{ ...TYPOGRAPHY.sectionTitle }}>{habit.title}</span>
            <span style={{ fontWeight: 500 }}> дадлыг хийнэ.</span>
          </p>
          {habit.motivationProfile?.reason && (
            <p style={{ ...TYPOGRAPHY.body, lineHeight: 1.65, marginTop: 8 }} className="text-foreground">
              <span style={{ fontWeight: 500 }}>Ингэснээр би: </span>
              <span style={{ ...TYPOGRAPHY.sectionTitle, }}>{habit.motivationProfile.reason}</span>
            </p>
          )}
        </div>

        {/* ── 5. Зорилт ба хуваарь ── */}
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
          <div className="px-4 pt-2 pb-3">
            <div className="mb-2">
              <WeekdayStrip
                selectedDays={scheduledDays}
                accentBg={color.btn}
                accentRing={color.accent}
              />
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
            <div className="pt-2 px-4 pb-4 flex flex-wrap gap-2">
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
                    style={{ backgroundColor: color.btn, ...TYPOGRAPHY.micro, fontWeight: 700, color: '#202325' }}>
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

        {/* ── 7. Дохио ба сануулга ── */}
        <SectionCard delay={0.15}>
          <SectionLabel icon={<Bell className="w-4 h-4" style={{ color: color.accent }} />} label="Дохио ба сануулга" />
          <Row
            left={
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  {habit.reminderEnabled
                    ? <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                    : <BellOff className="w-3.5 h-3.5" style={{ color: 'rgba(0,0,0,0.35)' }} />}
                </div>
                <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Сануулга</span>
              </div>
            }
            right={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">{habit.reminderEnabled ? 'Идэвхтэй' : 'Идэвхгүй'}</span>}
            divider={!!(timeCues.length || locationCue || routineCue)}
          />
          {timeCues.map((tc, idx) => (
            <Row
              key={tc.id}
              left={
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: color.btn + '22' }}>
                    <Clock className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Цагийн хүрээ</span>
                </div>
              }
              right={<span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">{[tc.startTime?.slice(0,5), tc.endTime?.slice(0,5)].filter(Boolean).join(' – ')}</span>}
              divider={idx < timeCues.length - 1 || !!(locationCue || routineCue)}
            />
          ))}
          {locationCue && (
            <Row
              left={
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: color.btn + '22' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Байршил</span>
                </div>
              }
              right={
                <span
                  style={TYPOGRAPHY.bodySm}
                  className="text-muted-foreground inline-block max-w-[180px] truncate align-middle"
                  title={locationCue.coarseLocation ?? undefined}
                >
                  {locationCue.coarseLocation}
                </span>
              }
              divider={!!routineCue}
            />
          )}
          {routineCue && (
            <Row
              left={
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: color.btn + '22' }}>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Өмнөх хэрэглүүр</span>
                </div>
              }
              right={
                <span
                  style={TYPOGRAPHY.bodySm}
                  className="text-muted-foreground inline-block max-w-[180px] truncate align-middle"
                  title={routineCue.precedingRoutine ?? undefined}
                >
                  {routineCue.precedingRoutine}
                </span>
              }
              divider={false}
            />
          )}
        </SectionCard>

        {/* ── 8. Гүйцэтгэлийн түүх / хуанли ── */}
        <SectionCard delay={0.18} className="calendar-panel">
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
              <div className="px-4 py-3 flex flex-col gap-0">
                {Array.from(latestLogsByDay.entries())
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .slice(0, 6)
                  .map(([, log], i, arr) => (
                  <div key={log.id}>
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: log.status === 'DONE' ? color.accent : 'rgba(0,0,0,0.18)' }} />
                      <div className="flex-1 min-w-0">
                        {binary ? (
                          <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">
                            {log.status === 'DONE' ? 'Хийсэн' : 'Хийгдээгүй'}
                          </span>
                        ) : (
                          <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600 }} className="text-foreground">
                            {log.actualValue ?? 0}
                            <span style={{ fontWeight: 400, marginLeft: 4 }} className="text-muted-foreground">{habit.measurementUnit}</span>
                            {log.actualValue != null && habit.targetValue > 0 && (
                              <span style={{ ...TYPOGRAPHY.caption, fontWeight: 400, marginLeft: 4 }} className="text-muted-foreground">
                                / {habit.targetValue}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <span style={{ ...TYPOGRAPHY.micro, whiteSpace: 'nowrap' }} className="text-muted-foreground">
                        {formatDate(log.completedAt)} · {formatTime(log.completedAt)}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.05)', marginLeft: 20 }} />
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center px-4 py-8 flex flex-col items-center">
              <FileText className="w-8 h-8 mb-3 shrink-0" strokeWidth={2} style={{ color: 'var(--text-muted-soft)' }} />
              <p style={{ ...TYPOGRAPHY.bodySm }} className="text-muted-foreground">Бүртгэл байхгүй байна</p>
            </div>
          )}
        </SectionCard>

        {/* ── 9. Тохиргоо ── */}
        <SectionCard delay={0.21}>
          <SectionLabel icon={<Archive className="w-4 h-4" style={{ color: '#474747' }} />} label="Тохиргоо" />
          <Row
            left={<span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Нийт гүйцэтгэсэн</span>}
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
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--surface-subtle)' }}>
                      <Archive className="w-7 h-7" style={{ color: 'var(--text-muted-soft)' }} />
                    </div>
                  </div>
                  <p style={{ ...TYPOGRAPHY.pageTitle, fontWeight: 500 }} className="text-foreground">Дадлаа архивлах уу?</p>
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
    </div>
  );
}
