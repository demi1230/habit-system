import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Archive, Clock, MapPin,
  Heart, Bell, BellOff, Check, X, ChevronRight,
  Shield, TrendingUp, Minus, Plus,
} from 'lucide-react';
import { getHabitColor, CTA_DARK } from '@/lib/habit-colors';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import type { Habit, HabitLog, HabitStrengthSignals, ProgressSummary, Weekday } from '@/api/types';

const TODAY = new Date().toISOString().split('T')[0];
const DAYS_MAP: Record<string, string> = {
  MONDAY: 'Ð”Ð°', TUESDAY: 'ÐœÑ', WEDNESDAY: 'Ð›Ñ…', THURSDAY: 'ÐŸÒ¯',
  FRIDAY: 'Ð‘Ð°', SATURDAY: 'Ð‘Ñ', SUNDAY: 'ÐÑ',
};
const ALL_DAYS: Weekday[] = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];


function isBinaryHabit(h: Habit) {
  return h.targetValue === 1 && ['ÑƒÐ´Ð°Ð°', 'times', 'boolean'].includes(h.measurementUnit);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
}

function getLast28Days() {
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 27 + i);
    return d.toISOString().split('T')[0];
  });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em' }}
       className="text-muted-foreground mb-2 pl-0.5">{children}</p>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="rounded-[20px] overflow-hidden bg-card"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)', ...style }}>{children}</div>
  );
}

function StrengthBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between mb-1.5">
        <span style={{ fontSize: 12, fontWeight: 500 }} className="text-muted-foreground">{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

function QuickLogWidget({ habit, logs, color, onLogged }: {
  habit: Habit; logs: HabitLog[]; color: ReturnType<typeof getHabitColor>; onLogged: () => void;
}) {
  const { userId } = useAuth();
  const todayLog = logs.find(l => l.completedAt.startsWith(TODAY));
  const isAlreadyDone = todayLog?.status === 'DONE';
  const binary = isBinaryHabit(habit);
  const target = habit.targetValue;
  const [value, setValue] = useState(todayLog?.actualValue ?? target);
  const [saving, setSaving] = useState(false);

  const pct = Math.min((value / target) * 100, 100);
  const status = value >= target ? 'done' : value > 0 ? 'partial' : 'none';
  const statusLabel =
    status === 'done' ? 'Ð—Ð¾Ñ€Ð¸Ð»Ñ‚ Ð±Ð¸ÐµÐ»ÑÐ² âœ“' :
    status === 'partial' ? `${value}/${target} ${habit.measurementUnit}` :
    `Ð—Ð¾Ñ€Ð¸Ð»Ñ‚: ${target} ${habit.measurementUnit}`;
  const statusColor =
    status === 'done' ? color.accent : status === 'partial' ? color.ring : 'rgba(0,0,0,0.35)';

  const handleLog = async () => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      await habitsApi.createLog(userId, habit.id, {
        actualValue: binary ? 1 : value,
        completedAt: new Date().toISOString(),
        triggerSource: 'SELF_INITIATED',
      });
      onLogged();
    } catch (err) { console.error('Log failed:', err); }
    finally { setSaving(false); }
  };

  if (binary) {
    return (
      <div className="px-4 py-4">
        {isAlreadyDone ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 justify-center py-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color.btn }}>
              <Check className="w-5 h-5" style={{ color: color.accent }} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: color.accent }}>Ó¨Ð½Ó©Ó©Ð´Ó©Ñ€ Ð´ÑƒÑƒÑÑÐ°Ð½</span>
          </motion.div>
        ) : (
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleLog} disabled={saving}
            className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: CTA_DARK.bg, boxShadow: CTA_DARK.shadow }}>
            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{saving ? '...' : 'Ó¨Ð½Ó©Ó©Ð´Ó©Ñ€ Ñ…Ð¸Ð¹Ð»ÑÑ'}</span>
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: status === 'done' ? color.accent : color.ring }} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <motion.button whileTap={{ scale: 0.86 }}
          onClick={() => setValue(v => Math.max(0, +(v - (target >= 10 ? 1 : 0.5)).toFixed(1)))}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
          <Minus className="w-4 h-4" style={{ color: '#474747' }} />
        </motion.button>
        <div className="flex-1 text-center">
          <span style={{ fontSize: 32, fontWeight: 600, color: statusColor, letterSpacing: '-1px' }}>{value}</span>
          <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', marginLeft: 4 }}>{habit.measurementUnit}</span>
        </div>
        <motion.button whileTap={{ scale: 0.86 }}
          onClick={() => setValue(v => +(v + (target >= 10 ? 1 : 0.5)).toFixed(1))}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: color.btn }}>
          <Plus className="w-4 h-4" style={{ color: color.accent }} />
        </motion.button>
      </div>
      <p className="text-center mb-3" style={{ fontSize: 12, color: statusColor, fontWeight: 500 }}>{statusLabel}</p>
      <motion.button whileTap={{ scale: 0.96 }} onClick={handleLog}
        disabled={status === 'none' || saving}
        className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          backgroundColor: status !== 'none' ? CTA_DARK.bg : 'rgba(0,0,0,0.08)',
          boxShadow: status !== 'none' ? CTA_DARK.shadow : 'none',
        }}>
        <Check className="w-4 h-4" style={{ color: status !== 'none' ? '#fff' : '#9ca3af' }} strokeWidth={2.5} />
        <span style={{ fontSize: 14, fontWeight: 500, color: status !== 'none' ? '#fff' : '#9ca3af' }}>
          {saving ? '...' : isAlreadyDone ? 'Ð”Ð°Ñ…Ð¸Ð½ Ð±Ò¯Ñ€Ñ‚Ð³ÑÑ…' : 'Ð‘Ò¯Ñ€Ñ‚Ð³ÑÑ…'}
        </span>
      </motion.button>
    </div>
  );
}

function HistoryGrid({ habit, logs, color }: {
  habit: Habit; logs: HabitLog[]; color: ReturnType<typeof getHabitColor>;
}) {
  const days = useMemo(() => getLast28Days(), []);
  const scheduledDays = new Set(habit.scheduleDays.map(s => s.weekday));
  const logMap = useMemo(() => {
    const m: Record<string, { done: boolean; partial: boolean }> = {};
    for (const l of logs) {
      const dateStr = l.completedAt.split('T')[0];
      m[dateStr] = { done: l.status === 'DONE', partial: l.status !== 'DONE' && (l.actualValue ?? 0) > 0 };
    }
    return m;
  }, [logs]);

  const getDayOfWeek = (dateStr: string): Weekday => {
    const jsDay = new Date(dateStr).getDay();
    return ALL_DAYS[jsDay === 0 ? 6 : jsDay - 1];
  };

  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
      {['Ð”Ð°','ÐœÑ','Ð›Ñ…','ÐŸÒ¯','Ð‘Ð°','Ð‘Ñ','ÐÑ'].map(d => (
        <div key={d} className="text-center" style={{ fontSize: 10, color: 'rgba(0,0,0,0.32)', fontWeight: 500, paddingBottom: 2 }}>{d}</div>
      ))}
      {days.map(dateStr => {
        const log = logMap[dateStr];
        const isScheduled = scheduledDays.has(getDayOfWeek(dateStr));
        const isToday = dateStr === TODAY;
        const bg =
          log?.done ? color.accent :
          log?.partial ? color.ring + 'aa' :
          !isScheduled ? 'transparent' : 'rgba(0,0,0,0.07)';
        return (
          <div key={dateStr} className="relative flex items-center justify-center"
            style={{ aspectRatio: '1', borderRadius: 8, backgroundColor: bg,
              border: isToday ? `1.5px solid ${color.accent}` : 'none' }}>
            {log?.partial && !log?.done && (
              <span style={{ fontSize: 8, color: color.accent, fontWeight: 500 }}>~</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function HabitDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [strength, setStrength] = useState<HabitStrengthSignals | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [logKey, setLogKey] = useState(0);

  const fetchAll = async () => {
    if (!userId || !id) return;
    try {
      const [h, l, s, p] = await Promise.all([
        habitsApi.getHabit(userId, id),
        habitsApi.listLogs(userId, id),
        habitsApi.getStrengthSignals(userId, id).catch(() => null),
        habitsApi.getProgressSummary(userId, id).catch(() => null),
      ]);
      setHabit(h); setLogs(l); setStrength(s); setProgress(p);
    } catch (err) { console.error('Failed to load habit:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [userId, id, logKey]);

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
          <p style={{ fontSize: 48 }}>ðŸ”</p>
          <p style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }} className="text-foreground">Ð”Ð°Ð´Ð°Ð» Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹</p>
          <p style={{ fontSize: 13, marginTop: 6 }} className="text-muted-foreground">Ð­Ð½Ñ Ð´Ð°Ð´Ð°Ð» ÑƒÑÑ‚Ð³Ð°Ð³Ð´ÑÐ°Ð½ Ð±Ð°Ð¹Ð¶ Ð±Ð¾Ð»Ð·Ð¾ÑˆÐ³Ò¯Ð¹</p>
          <button onClick={() => navigate('/dashboard')}
            className="mt-6 px-8 py-3 rounded-full"
            style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, fontSize: 14, fontWeight: 500, boxShadow: CTA_DARK.shadow }}>
            ÐÒ¯Ò¯Ñ€ Ñ…ÑƒÑƒÐ´Ð°Ñ Ñ€ÑƒÑƒ
          </button>
        </div>
      </div>
    );
  }

  const color = getHabitColor(habit.color);
  const habitIcon = habit.iconValue || '✨';
  const binary = isBinaryHabit(habit);

  const doneCount = progress?.doneCount ?? logs.filter(l => l.status === 'DONE').length;
  const totalLogs = progress?.totalLogs ?? logs.length;
  const completionRate = totalLogs > 0 ? Math.round((doneCount / totalLogs) * 100) : 0;
  const strengthTotal = strength ? Math.round(strength.doneRate * 100) : 0;
  const consistencyPct = strength ? Math.round(strength.doneRate * 100) : 0;
  const independencePct = strength ? Math.round(strength.selfInitiatedRate * 100) : 0;

  const scheduledDays = habit.scheduleDays.map(s => s.weekday);
  const daysLabel =
    scheduledDays.length === 7 ? 'Ó¨Ð´Ó©Ñ€ Ð±Ò¯Ñ€' :
    scheduledDays.length === 5 && !scheduledDays.includes('SATURDAY') && !scheduledDays.includes('SUNDAY')
      ? 'ÐÐ¶Ð»Ñ‹Ð½ Ó©Ð´Ñ€Ò¯Ò¯Ð´' : `Ð”Ð¾Ð»Ð¾Ð¾ Ñ…Ð¾Ð½Ð¾Ð³Ñ‚ ${scheduledDays.length} Ó©Ð´Ó©Ñ€`;

  const todayLog = logs.find(l => l.completedAt.startsWith(TODAY));
  const todayStatus = todayLog?.status === 'DONE' ? 'done' : todayLog ? 'partial' : 'none';
  const todayStatusLabel =
    todayStatus === 'done' ? 'Ð”ÑƒÑƒÑÑÐ°Ð½ âœ“' :
    todayStatus === 'partial' ? `Ð¥Ð°Ð³Ð°ÑÐ´ÑÐ°Ð½ Â· ${todayLog?.actualValue} ${habit.measurementUnit}` :
    'Ð‘Ò¯Ñ€Ñ‚Ð³ÑÐ³Ð´ÑÑÐ³Ò¯Ð¹';
  const todayStatusColor =
    todayStatus === 'done' ? color.accent : todayStatus === 'partial' ? color.ring : 'rgba(0,0,0,0.38)';

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

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-5 pt-13 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <p style={{ fontSize: 15, fontWeight: 600 }} className="truncate mx-3 flex-1 text-center text-foreground">{habit.title}</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowArchiveConfirm(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <Archive className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 pt-5">
        {/* HERO BAND */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] p-5 relative overflow-hidden"
          style={{ backgroundColor: color.card, boxShadow: '0 2px 16px rgba(0,0,0,0.09)' }}>
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }} />
          <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <div className="relative flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}>
              <span style={{ fontSize: 28 }}>{habitIcon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 17, fontWeight: 600, color: '#202325', lineHeight: 1.3 }}>{habit.title}</p>
            </div>
          </div>
          <div className="relative flex gap-2.5">
            {[
              { label: 'Ð¥Ò¯Ñ‡', value: `${strengthTotal}`, suffix: '/100' },
              { label: 'Ð“Ò¯Ð¹Ñ†ÑÑ‚Ð³ÑÐ»', value: `${completionRate}`, suffix: '%' },
              { label: 'ÐÐ¸Ð¹Ñ‚', value: `${totalLogs}`, suffix: ' ÑƒÐ´Ð°Ð°' },
            ].map(item => (
              <div key={item.label} className="flex-1 rounded-[14px] py-2 px-2 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#202325', letterSpacing: '-0.3px' }}>
                  {item.value}<span style={{ fontSize: 10, fontWeight: 500, opacity: 0.6 }}>{item.suffix}</span>
                </p>
                <p style={{ fontSize: 9, color: 'rgba(0,0,0,0.45)', marginTop: 1, fontWeight: 500 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* HABIT SENTENCE */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.035 }}>
          <div className="rounded-[20px] px-4 py-4"
            style={{ backgroundColor: color.card, border: `1.5px solid ${color.accent}30`, boxShadow: `0 1px 10px ${color.accent}18` }}>
            <p style={{ fontSize: 15, lineHeight: 2.0 }} className="text-foreground">
              {habit.precedingRoutine && (
                <><span style={{ color: 'rgba(0,0,0,0.5)' }}>{habit.precedingRoutine} </span><span style={{ fontWeight: 500 }}>дараа </span></>
              )}
              <span style={{ fontWeight: 500 }}>{habit.title}</span>
              <span style={{ fontWeight: 500 }}> дадлыг хийнэ.</span>
            </p>
            {habit.motivationProfile?.reason && (
              <p style={{ fontSize: 14, lineHeight: 1.7, marginTop: 4 }} className="text-foreground">
                <span style={{ fontWeight: 500 }}>Ингэснээр би: </span>
                <span style={{ color: 'rgba(0,0,0,0.6)' }}>{habit.motivationProfile.reason}</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* TODAY STATUS */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <SectionLabel>Ó¨ÐÓ¨Ó¨Ð”Ó¨Ð </SectionLabel>
          <Card>
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }} className="text-muted-foreground">
                  {new Date().toLocaleDateString('mn-MN', { month: 'long', day: 'numeric', weekday: 'short' })}
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, color: todayStatusColor }}>{todayStatusLabel}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: todayStatus === 'done' ? color.accent : todayStatus === 'partial' ? color.btn : 'rgba(0,0,0,0.07)' }}>
                {todayStatus === 'done' ? <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                  : todayStatus === 'partial' ? <span style={{ fontSize: 18, color: color.accent }}>~</span>
                  : <span style={{ fontSize: 18 }}>â—‹</span>}
              </div>
            </div>
            {!binary && (
              <>
                <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span style={{ fontSize: 12 }} className="text-muted-foreground">Ð—Ð¾Ñ€Ð¸Ð»Ñ‚</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }} className="text-foreground">
                    {habit.targetValue} {habit.measurementUnit}
                    {habit.minimumTarget > 1 ? ` Â· Ñ…Ð°Ð¼Ð³Ð¸Ð¹Ð½ Ð±Ð°Ð³Ð° ${habit.minimumTarget}` : ''}
                  </span>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* WHY CARD */}
        {habit.motivationProfile?.reason && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
            <SectionLabel>Ð¯ÐÐ“ÐÐÐ” Ð§Ð£Ð¥ÐÐ› Ð’Ð­</SectionLabel>
            <div className="rounded-[20px] px-4 py-4"
              style={{ backgroundColor: color.btn + 'bb', border: `1px solid ${color.accent}20`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Heart className="w-3.5 h-3.5" style={{ color: color.accent }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: color.accent, letterSpacing: '0.04em' }}>ÐœÐ˜ÐÐ˜Ð™ Ð¨ÐÐ›Ð¢Ð“ÐÐÐ</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65 }} className="text-foreground">{habit.motivationProfile.reason}</p>
            </div>
          </motion.div>
        )}

        {/* CUE SUMMARY */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <SectionLabel>Ð”ÐžÐ¥Ð˜Ðž Ð‘Ð Ð¥Ð£Ð’ÐÐÐ Ð¬</SectionLabel>
          <Card>
            <div className="px-4 py-3">
              <div className="flex gap-1.5">
                {ALL_DAYS.map(day => {
                  const active = scheduledDays.includes(day);
                  return (
                    <div key={day} className="flex-1 py-1.5 rounded-[10px] flex items-center justify-center"
                      style={{
                        backgroundColor: active ? color.btn : 'rgba(0,0,0,0.04)',
                        fontSize: 11, fontWeight: active ? 700 : 400,
                        color: active ? '#202325' : 'rgba(0,0,0,0.3)',
                      }}>{DAYS_MAP[day]}</div>
                  );
                })}
              </div>
              <p className="mt-2 text-muted-foreground" style={{ fontSize: 11, fontWeight: 500 }}>
                {daysLabel} Â· {formatDate(habit.startDate)} -Ð°Ð°Ñ
              </p>
            </div>
            {(timeCue || locationCue || routineCue) && (
              <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />
            )}
            {timeCue && (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn + '22' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: color.accent }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }} className="text-foreground">Ð¦Ð°Ð³Ð¸Ð¹Ð½ Ñ…Ò¯Ñ€ÑÑ</span>
                <span style={{ fontSize: 13 }} className="text-muted-foreground">{[timeCue.startTime, timeCue.endTime].filter(Boolean).join(' – ')}</span>
              </div>
            )}
            {locationCue && (
              <>
                {timeCue && <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn + '22' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }} className="text-foreground">Ð‘Ð°Ð¹Ñ€ÑˆÐ¸Ð»</span>
                  <span style={{ fontSize: 13 }} className="text-muted-foreground">{locationCue.coarseLocation}</span>
                </div>
              </>
            )}
            {routineCue && (
              <>
                {(timeCue || locationCue) && <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn + '22' }}>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }} className="text-foreground">Ó¨Ð¼Ð½Ó©Ñ… Ñ…ÑÑ€ÑÐ³Ð»Ò¯Ò¯Ñ€</span>
                  <span style={{ fontSize: 13 }} className="text-muted-foreground">{routineCue.precedingRoutine}</span>
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* QUICK LOG */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <SectionLabel>Ð¥Ð£Ð Ð”ÐÐ Ð‘Ò®Ð Ð¢Ð“Ð­Ð›</SectionLabel>
          <Card>
            <QuickLogWidget key={logKey} habit={habit} logs={logs} color={color} onLogged={() => setLogKey(k => k + 1)} />
          </Card>
        </motion.div>

        {/* STRENGTH */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <SectionLabel>Ð”ÐÐ”Ð›Ð«Ð Ð¥Ò®Ð§</SectionLabel>
          <Card>
            <div className="px-4 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: color.accent }} />
                <span style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">ÐÐ¸Ð¹Ñ‚ Ñ…Ò¯Ñ‡</span>
              </div>
              <div className="flex items-end gap-1">
                <span style={{ fontSize: 26, fontWeight: 600, color: color.accent, letterSpacing: '-1px' }}>{strengthTotal}</span>
                <span style={{ fontSize: 13, paddingBottom: 3 }} className="text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="px-4 py-4">
              <StrengthBar label="Ð¢Ð¾Ð³Ñ‚Ð¼Ð¾Ð» Ð±Ð°Ð¹Ð´Ð°Ð»" value={consistencyPct} color={color.accent} />
              <StrengthBar label="Ð‘Ð¸Ðµ Ð´Ð°Ð°ÑÐ°Ð½ Ð±Ð°Ð¹Ð´Ð°Ð»" value={independencePct} color={color.ring} />
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-[14px] px-3.5 py-2.5" style={{ backgroundColor: color.btn + '88' }}>
                <p style={{ fontSize: 12, lineHeight: 1.6 }} className="text-foreground">
                  {strengthTotal >= 70 ? 'ðŸ’ª ÐœÐ°Ñˆ ÑÐ°Ð¹Ð½ â€” Ð´Ð°Ð´Ð°Ð» Ð½ÑŒ Ð±Ð¸Ðµ Ð´Ð°Ð°ÑÐ°Ð½ Ð±Ð¾Ð»Ð¶ Ð±Ð°Ð¹Ð½Ð°.'
                    : strengthTotal >= 40 ? 'ðŸŒ± Ð¥Ó©Ð³Ð¶Ð¸Ð¶ Ð±Ð°Ð¹Ð½Ð° â€” Ñ‚Ð¾Ð³Ñ‚Ð¼Ð¾Ð» Ð±Ð°Ð¹Ð´Ð°Ð» Ð½ÑÐ¼ÑÐ³Ð´ÑÐ¶ Ð±Ð°Ð¹Ð½Ð°.'
                    : 'ðŸ”° Ð­Ñ…Ð»ÑÐ»Ð¸Ð¹Ð½ ÑˆÐ°Ñ‚Ð°Ð½Ð´ â€” Ó©Ð´Ó©Ñ€ Ð±Ò¯Ñ€ Ñ…Ð¸Ð¹Ñ… Ð½ÑŒ Ñ‡ÑƒÑ…Ð°Ð».'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* HISTORY */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}>
          <SectionLabel>Ð“Ò®Ð™Ð¦Ð­Ð¢Ð“Ð­Ð›Ð˜Ð™Ð Ð¢Ò®Ò®Ð¥</SectionLabel>
          <Card>
            <div className="px-4 pt-4 pb-3">
              <HistoryGrid habit={habit} logs={logs} color={color} />
              <div className="flex items-center gap-3 mt-3">
                {[{ c: color.accent, l: 'Ð”ÑƒÑƒÑÑÐ°Ð½' }, { c: color.ring + 'aa', l: 'Ð¥Ð°Ð³Ð°ÑÐ´ÑÐ°Ð½' }, { c: 'rgba(0,0,0,0.1)', l: 'Ð¥Ð¸Ð¹Ð³Ð´ÑÑÐ³Ò¯Ð¹' }].map(x => (
                  <div key={x.l} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: x.c }} />
                    <span style={{ fontSize: 10 }} className="text-muted-foreground">{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            {logs.length > 0 ? (
              <>
                <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)' }} />
                <div className="px-4 py-3 flex flex-col gap-2.5">
                  {logs.slice(0, 6).map(log => (
                    <div key={log.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: log.status === 'DONE' ? color.btn : 'rgba(0,0,0,0.06)' }}>
                        {log.status === 'DONE' ? <Check className="w-3.5 h-3.5" style={{ color: color.accent }} strokeWidth={2.5} />
                          : <X className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.3)' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">{log.status === 'DONE' ? 'Ð”ÑƒÑƒÑÑÐ°Ð½' : 'Ð¥Ð¸Ð¹Ð³Ð´ÑÑÐ³Ò¯Ð¹'}</span>
                        {!binary && log.actualValue != null && (
                          <span style={{ fontSize: 12, marginLeft: 6 }} className="text-muted-foreground">{log.actualValue} {habit.measurementUnit}</span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, whiteSpace: 'nowrap' }} className="text-muted-foreground">{formatDate(log.completedAt)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center px-4 py-8">
                <p style={{ fontSize: 32 }}>ðŸ“</p>
                <p style={{ fontSize: 13, marginTop: 8 }} className="text-muted-foreground">Ð‘Ò¯Ñ€Ñ‚Ð³ÑÐ» Ð±Ð°Ð¹Ñ…Ð³Ò¯Ð¹ Ð±Ð°Ð¹Ð½Ð°</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* SETTINGS */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <SectionLabel>Ð¢ÐžÐ¥Ð˜Ð Ð“ÐžÐž</SectionLabel>
          <Card>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn }}>
                {habit.reminderEnabled ? <Bell className="w-3.5 h-3.5" style={{ color: color.accent }} />
                  : <BellOff className="w-3.5 h-3.5" style={{ color: 'rgba(0,0,0,0.35)' }} />}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }} className="text-foreground">Ð¡Ð°Ð½ÑƒÑƒÐ»Ð³Ð°</span>
              <span style={{ fontSize: 13, fontWeight: 500 }} className="text-muted-foreground">
                {habit.reminderEnabled ? 'Ð˜Ð´ÑÐ²Ñ…Ñ‚ÑÐ¹' : 'Ð˜Ð´ÑÐ²Ñ…Ð³Ò¯Ð¹'}
              </span>
            </div>
            <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: color.btn }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: color.accent }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }} className="text-foreground">ÐÐ¸Ð¹Ñ‚ Ð±Ò¯Ñ€Ñ‚Ð³ÑÐ»</span>
              <span style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">{totalLogs} ÑƒÐ´Ð°Ð°</span>
            </div>
            <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowArchiveConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.10)' }}>
                <Archive className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#EF4444', flex: 1 }}>ÐÑ€Ñ…Ð¸Ð²Ð»Ð°Ñ…</span>
            </motion.button>
          </Card>
        </motion.div>
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
                  <p style={{ fontSize: 40 }}>ðŸ—‚ï¸</p>
                  <p style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }} className="text-foreground">Ð”Ð°Ð´Ð»Ð°Ð° Ð°Ñ€Ñ…Ð¸Ð²Ð»Ð°Ñ… ÑƒÑƒ?</p>
                  <p className="mt-2 text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>
                    ÐÑ€Ñ…Ð¸Ð²Ð»Ð°ÑÐ°Ð½ Ð´Ð°Ð´Ð°Ð» Ñ…ÑÐ½Ð°Ð»Ñ‚Ñ‹Ð½ ÑÐ°Ð¼Ð±Ð°Ñ€Ð°Ð°Ñ Ð½ÑƒÑƒÐ³Ð´Ð°Ð½Ð°,<br/>Ñ…Ð°Ñ€Ð¸Ð½ Ð³Ò¯Ð¹Ñ†ÑÑ‚Ð³ÑÐ»Ð¸Ð¹Ð½ Ñ‚Ò¯Ò¯Ñ… Ñ…Ð°Ð´Ð³Ð°Ð»Ð°Ð³Ð´Ð°Ð½Ð°.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleArchive}
                    className="w-full py-3.5 rounded-full"
                    style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, fontSize: 15, fontWeight: 500, boxShadow: CTA_DARK.shadow }}>
                    Ð¢Ð¸Ð¹Ð¼, Ð°Ñ€Ñ…Ð¸Ð²Ð»Ð°Ñ…
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowArchiveConfirm(false)}
                    className="w-full py-3 rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#474747', fontSize: 14, fontWeight: 500 }}>
                    Ð‘Ð¾Ð»Ð¸Ñ…
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
