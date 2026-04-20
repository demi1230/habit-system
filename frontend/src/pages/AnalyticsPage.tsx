import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, ChevronLeft, ChevronRight, Flame, Calendar,
  Target, Zap, Brain, MapPin, Clock, TrendingUp,
  ChevronDown, Shield, Sparkles, X, Info,
} from 'lucide-react';
import { getHabitColor } from '@/lib/habit-colors';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import { srbaiApi } from '@/api/srbai';
import type { Habit, HabitLog, ProgressSummary } from '@/api/types';
import type { SrbaiAssessment, SrbaiCompositeScore } from '@/api/srbai';
import type { AdaptationRecommendation } from '@/api/habits';
import { BottomNav } from '@/components/bottom-nav';

// ── Helpers ─────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

const JS_TO_WD: Record<number, string> = {
  0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
  4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
};

// ── Month Calendar ──────────────────────────────────────────────────────────

function MonthCalendar({ logs, accent }: { logs: HabitLog[]; accent: string }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = month.getFullYear(); const m = month.getMonth();
  const daysCount = getDaysInMonth(year, m);
  const firstDay = getFirstDayOfMonth(year, m);

  const logDates = useMemo(() => {
    const s = new Set<string>();
    for (const l of logs) { if (l.status === 'DONE') s.add(toLocalDateStr(new Date(l.completedAt))); }
    return s;
  }, [logs]);

  const today = toLocalDateStr(now);
  const monthLabel = month.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long' });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOffset(o => o - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <ChevronLeft className="w-4 h-4" style={{ color: '#474747' }} />
        </motion.button>
        <p style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }} className="text-foreground">{monthLabel}</p>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOffset(o => Math.min(o + 1, 0))} disabled={offset >= 0}
          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <ChevronRight className="w-4 h-4" style={{ color: '#474747' }} />
        </motion.button>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7,1fr)' }}>
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center" style={{ fontSize: 11, fontWeight: 500, color: 'rgba(0,0,0,0.3)', paddingBottom: 2 }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysCount }, (_, i) => {
          const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
          const done = logDates.has(dateStr);
          const isToday = dateStr === today;
          return (
            <div key={dateStr} className="flex items-center justify-center"
              style={{ aspectRatio: '1', borderRadius: 10, backgroundColor: done ? accent + '22' : 'transparent', border: isToday ? `1.5px solid ${accent}` : 'none' }}>
              <span style={{ fontSize: 11, fontWeight: done || isToday ? 600 : 400, color: done ? accent : isToday ? accent : 'rgba(0,0,0,0.45)' }}>{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reusable Components ─────────────────────────────────────────────────────

function ProgressRing({ value, size = 120, strokeWidth = 8, color, children }: {
  value: number; size?: number; strokeWidth?: number; color: string; children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: off }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </svg>
      <div className="absolute text-center">{children}</div>
    </div>
  );
}

function SectionCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`rounded-[20px] p-4 bg-card ${className}`} style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span style={{ fontSize: 13, fontWeight: 600 }} className="text-foreground">{label}</span>
    </div>
  );
}

function BarSegment({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontSize: 11, fontWeight: 500, width: 60 }} className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, width: 32, textAlign: 'right' }} className="text-foreground">{pct}%</span>
    </div>
  );
}

function StatMini({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-[16px] p-3.5 bg-card" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <div className="w-8 h-8 rounded-[12px] flex items-center justify-center mb-2" style={{ backgroundColor: color + '18' }}>
        {icon}
      </div>
      <p style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.5px' }} className="text-foreground">{value}</p>
      <p style={{ fontSize: 11, marginTop: 2, fontWeight: 500 }} className="text-muted-foreground">{label}</p>
    </div>
  );
}

// ── SRBAI Assessment Modal ──────────────────────────────────────────────────

const SRBAI_QUESTIONS = [
  'Би энэ дадлыг автоматаар хийдэг',
  'Бодолгүйгээр хийдэг',
  'Өөрийгөө хүчлэхгүйгээр хийдэг',
  'Санаа зовохгүйгээр хийдэг',
];

function SrbaiModal({ onSubmit, onClose, accent }: {
  onSubmit: (items: [number, number, number, number]) => void; onClose: () => void; accent: string;
}) {
  const [answers, setAnswers] = useState<number[]>([0, 0, 0, 0]);
  const allAnswered = answers.every(a => a > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}>
      <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="w-full max-w-[430px] bg-card rounded-t-[24px] px-5 pt-5 pb-8"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: 16, fontWeight: 600 }} className="text-foreground">SRBAI Үнэлгээ</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.5 }} className="text-muted-foreground mb-4">
          1 (огт үгүй) — 7 (бүрэн зөвшөөрч байна) хооронд үнэлнэ үү
        </p>
        <div className="flex flex-col gap-4">
          {SRBAI_QUESTIONS.map((q, qi) => (
            <div key={qi}>
              <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground mb-2">{qi + 1}. {q}</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map(v => (
                  <motion.button key={v} whileTap={{ scale: 0.9 }}
                    onClick={() => setAnswers(prev => { const n = [...prev]; n[qi] = v; return n; })}
                    className="flex-1 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: answers[qi] === v ? accent : 'rgba(0,0,0,0.05)',
                      color: answers[qi] === v ? '#fff' : 'rgba(0,0,0,0.5)',
                      fontSize: 13, fontWeight: answers[qi] === v ? 600 : 400,
                    }}>
                    {v}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => allAnswered && onSubmit(answers as [number, number, number, number])}
          className="w-full mt-5 rounded-2xl py-3.5 flex items-center justify-center"
          style={{
            backgroundColor: allAnswered ? accent : 'rgba(0,0,0,0.08)',
            color: allAnswered ? '#fff' : 'rgba(0,0,0,0.3)',
            fontSize: 14, fontWeight: 600,
          }}>
          Үнэлгээ өгөх
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Adaptation Labels ───────────────────────────────────────────────────────

const ADAPTATION_MAP: Record<string, { icon: React.ReactNode; label: string; description: string; color: string }> = {
  reduce_reminders: { icon: <Sparkles className="w-4 h-4" />, label: 'Сануулга бууруулах', description: 'Дадал бэхжиж байна — сануулга автоматаар багасна.', color: '#18A68A' },
  maintain: { icon: <Shield className="w-4 h-4" />, label: 'Тогтвортой', description: 'Одоогийн ахиц маш сайн — үргэлжлүүлээрэй!', color: '#3B8FD4' },
  increase_support: { icon: <TrendingUp className="w-4 h-4" />, label: 'Дэмжлэг нэмэх', description: 'Арай хүндрэлтэй байна — дохио, сануулгаа шалгаарай.', color: '#E8A87C' },
  review_difficulty: { icon: <Target className="w-4 h-4" />, label: 'Хүндрэл шалгах', description: 'Зорилтоо бага зэрэг бууруулж, жижиг алхамаар эхлээрэй.', color: '#D94F6E' },
  celebrate_consistency: { icon: <Flame className="w-4 h-4" />, label: 'Баяр хүргэе! 🎉', description: 'Тууштай байдал маш өндөр — дадал тань бэхэжиж байна!', color: '#303437' },
};

// ── All Habits Overview (Бүгд) ──────────────────────────────────────────────

function AllHabitsOverview({ habits, logs, composites, adaptations, loading }: {
  habits: Habit[];
  logs: HabitLog[];
  composites: (SrbaiCompositeScore & { habitId: string })[];
  adaptations: AdaptationRecommendation[];
  loading: boolean;
}) {
  const doneLogs = logs.filter(l => l.status === 'DONE');
  const totalLogs = logs.length;
  const completionRate = totalLogs > 0 ? Math.round((doneLogs.length / totalLogs) * 100) : 0;

  // Average composite score
  const avgScore = composites.length > 0
    ? Math.round(composites.reduce((s, c) => s + c.finalScore, 0) / composites.length)
    : 0;

  const avgStage = avgScore >= 70 ? 'strong' : avgScore >= 40 ? 'building' : 'weak';
  const stageLabel = avgStage === 'strong' ? 'Хүчтэй 💪' : avgStage === 'building' ? 'Хөгжиж буй 🌱' : 'Сул';
  const stageColor = avgStage === 'strong' ? '#18A68A' : avgStage === 'building' ? '#E8A87C' : '#D94F6E';

  // Per-habit strength for the breakdown list
  const habitScores = habits.map(h => {
    const comp = composites.find(c => c.habitId === h.id);
    return { habit: h, score: Math.round(comp?.finalScore ?? 0), stage: comp?.stage ?? 'weak' };
  });

  // Most common adaptation focus
  const focusCounts = adaptations.reduce<Record<string, number>>((acc, a) => {
    acc[a.focus] = (acc[a.focus] ?? 0) + 1; return acc;
  }, {});
  const topFocus = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'maintain';
  const topAdapt = ADAPTATION_MAP[topFocus] ?? ADAPTATION_MAP['maintain'];

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-7 h-7 rounded-full border-2 border-t-transparent border-primary" />
      </div>
    );
  }

  return (
    <>
      <p style={{ fontSize: 13, fontWeight: 500 }} className="text-muted-foreground -mb-1">Бүх дадлын тойм</p>

      {/* Calendar — all habits combined */}
      <SectionCard delay={0}>
        <SectionLabel icon={<Calendar className="w-4 h-4" style={{ color: '#303437' }} />} label="Хуанли" />
        <MonthCalendar logs={logs} accent="#303437" />
      </SectionCard>

      {/* Overall Strength Ring */}
      <SectionCard delay={0.03}>
        <div className="flex flex-col items-center gap-2 py-2">
          <ProgressRing value={avgScore} size={120} strokeWidth={8} color={stageColor}>
            <div className="flex flex-col items-center">
              <span style={{ fontSize: 28, fontWeight: 600, color: stageColor }}>{avgScore}%</span>
            </div>
          </ProgressRing>
          <p style={{ fontSize: 13, fontWeight: 500 }} className="text-muted-foreground">дадлын хүч</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColor }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: stageColor }}>{stageLabel}</span>
          </div>
        </div>
      </SectionCard>

      {/* Advice */}
      <SectionCard delay={0.06}>
        <SectionLabel icon={<Sparkles className="w-4 h-4" style={{ color: topAdapt.color }} />} label="Зөвлөгөө" />
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: topAdapt.color + '18' }}>
            <div style={{ color: topAdapt.color }}>{topAdapt.icon}</div>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }} className="text-foreground">{topAdapt.label}</p>
            <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 2 }} className="text-muted-foreground">{topAdapt.description}</p>
          </div>
        </div>
      </SectionCard>

      {/* Per-habit breakdown */}
      <SectionCard delay={0.09}>
        <SectionLabel icon={<Target className="w-4 h-4" style={{ color: '#303437' }} />} label="Дадал тус бүрийн хүч" />
        <div className="flex flex-col gap-2.5">
          {habitScores.map(({ habit, score, stage }) => {
            const c = getHabitColor(habit.color);
            const sc = stage === 'strong' ? '#18A68A' : stage === 'building' ? '#E8A87C' : '#D94F6E';
            return (
              <div key={habit.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c.card }}>
                  <span style={{ fontSize: 14 }}>{habit.iconValue || '✨'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 12, fontWeight: 500 }} className="text-foreground truncate">{habit.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: sc }}>{score}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: sc }}
                      initial={{ width: 0 }} animate={{ width: `${Math.min(score, 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="grid grid-cols-2 gap-3">
        <StatMini icon={<Target className="w-4 h-4" style={{ color: '#18A68A' }} />}
          label="Нийт биелэлт" value={`${completionRate}%`} color="#18A68A" />
        <StatMini icon={<Calendar className="w-4 h-4" style={{ color: '#3B8FD4' }} />}
          label="Нийт бүртгэл" value={`${doneLogs.length}`} color="#3B8FD4" />
        <StatMini icon={<Zap className="w-4 h-4" style={{ color: stageColor }} />}
          label="Дундаж хүч" value={`${avgScore}`} color={stageColor} />
        <StatMini icon={<BarChart3 className="w-4 h-4" style={{ color: '#303437' }} />}
          label="Нийт дадал" value={`${habits.length}`} color="#303437" />
      </motion.div>
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { userId } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);          // -1 = "Бүгд"
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [composite, setComposite] = useState<SrbaiCompositeScore | null>(null);
  const [srbaiLatest, setSrbaiLatest] = useState<SrbaiAssessment | null>(null);
  const [adaptation, setAdaptation] = useState<AdaptationRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSrbai, setShowSrbai] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // ── Aggregate state for "Бүгд" ──
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);
  const [allComposites, setAllComposites] = useState<(SrbaiCompositeScore & { habitId: string })[]>([]);
  const [allAdaptations, setAllAdaptations] = useState<AdaptationRecommendation[]>([]);
  const [allLoading, setAllLoading] = useState(false);

  const isAllMode = selectedIdx === -1;
  const selected = habits[selectedIdx] ?? null;

  useEffect(() => {
    if (!userId) return;
    habitsApi.list(userId).then(h => { setHabits(h); setLoading(false); }).catch(() => setLoading(false));
  }, [userId]);

  const loadHabitData = useCallback(async () => {
    if (!userId || !selected) return;
    const [l, p, c, s, a] = await Promise.all([
      habitsApi.listLogs(userId, selected.id),
      habitsApi.getProgressSummary(userId, selected.id).catch(() => null),
      srbaiApi.getCompositeScore(userId, selected.id).catch(() => null),
      srbaiApi.getLatest(userId, selected.id).catch(() => null),
      habitsApi.getAdaptationRecommendation(userId, selected.id).catch(() => null),
    ]);
    setLogs(l); setProgress(p); setComposite(c); setSrbaiLatest(s); setAdaptation(a);
  }, [userId, selected?.id]);

  useEffect(() => { loadHabitData(); }, [loadHabitData]);

  // ── Load aggregate data for "Бүгд" mode ──
  const loadAllData = useCallback(async () => {
    if (!userId || habits.length === 0) return;
    setAllLoading(true);
    try {
      const results = await Promise.all(
        habits.map(async (h) => {
          const [logs, comp, adapt] = await Promise.all([
            habitsApi.listLogs(userId, h.id).catch(() => [] as HabitLog[]),
            srbaiApi.getCompositeScore(userId, h.id).catch(() => null),
            habitsApi.getAdaptationRecommendation(userId, h.id).catch(() => null),
          ]);
          return { habitId: h.id, logs, comp, adapt };
        }),
      );
      setAllLogs(results.flatMap(r => r.logs));
      // Tag composites with habitId for per-habit breakdown
      setAllComposites(results.map(r => r.comp ? { ...r.comp, habitId: r.habitId } : null).filter((c): c is SrbaiCompositeScore & { habitId: string } => c !== null));
      setAllAdaptations(results.map(r => r.adapt).filter((a): a is AdaptationRecommendation => a !== null));
    } catch { /* ignore */ }
    setAllLoading(false);
  }, [userId, habits]);

  useEffect(() => { if (isAllMode) loadAllData(); }, [isAllMode, loadAllData]);

  const color = getHabitColor(selected?.color);
  const doneLogs = logs.filter(l => l.status === 'DONE');
  const completionRate = logs.length > 0 ? Math.round((doneLogs.length / logs.length) * 100) : 0;

  // Streak
  const scheduledWds = new Set(selected?.scheduleDays?.map(s => s.weekday) ?? []);
  const doneSet = new Set(doneLogs.map(l => toLocalDateStr(new Date(l.completedAt))));
  const allLogDates = new Set(logs.map(l => toLocalDateStr(new Date(l.completedAt))));
  let streak = 0;
  const cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const wd = JS_TO_WD[cur.getDay()];
    if (scheduledWds.size === 0 || scheduledWds.has(wd)) {
      const key = toLocalDateStr(cur);
      if (doneSet.has(key)) streak++;
      else { if (i === 0 && !allLogDates.has(key)) { /* today no log yet */ } else break; }
    }
    cur.setDate(cur.getDate() - 1);
  }

  // Always use composite score (backend computes even without SRBAI)
  const displayScore = Math.round(composite?.finalScore ?? 0);
  const stage = composite?.stage ?? 'weak';
  const stageLabel = stage === 'strong' ? 'Хүчтэй 💪' : stage === 'building' ? 'Хөгжиж буй 🌱' : 'Сул';
  const stageColor = stage === 'strong' ? '#18A68A' : stage === 'building' ? '#E8A87C' : '#D94F6E';
  const selfRate = progress ? Math.round(progress.selfInitiatedRate * 100) : 0;
  const reminderRate = progress ? Math.round(progress.reminderDependenceRate * 100) : 0;

  const handleSrbaiSubmit = async (items: [number, number, number, number]) => {
    if (!userId || !selected) return;
    await srbaiApi.submit(userId, selected.id, { item1: items[0], item2: items[1], item3: items[2], item4: items[3] });
    setShowSrbai(false);
    loadHabitData();
  };

  const adaptInfo = adaptation ? ADAPTATION_MAP[adaptation.focus] ?? null : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-7 h-7 rounded-full border-2 border-t-transparent border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 px-5 pt-13 pb-3">
          <BarChart3 className="w-4.5 h-4.5 text-primary" />
          <p style={{ fontSize: 18, fontWeight: 600 }} className="text-foreground">Шинжилгээ</p>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* Habit Selector */}
        {habits.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {/* "Бүгд" (All) tab */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSelectedIdx(-1)}
              className="flex flex-col items-center gap-1 shrink-0" style={{ minWidth: 60 }}>
              <div className="w-12 h-12 rounded-[16px] flex items-center justify-center transition-all"
                style={{ backgroundColor: isAllMode ? '#303437' : 'rgba(0,0,0,0.05)', border: isAllMode ? '2px solid #303437' : '2px solid transparent' }}>
                <BarChart3 className="w-5 h-5" style={{ color: isAllMode ? '#fff' : 'rgba(0,0,0,0.35)' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: isAllMode ? 600 : 400, color: isAllMode ? '#303437' : 'rgba(0,0,0,0.45)' }}
                className="truncate text-center">Бүгд</span>
            </motion.button>
            {habits.map((h, i) => {
              const active = i === selectedIdx;
              const c = getHabitColor(h.color);
              return (
                <motion.button key={h.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedIdx(i)}
                  className="flex flex-col items-center gap-1 shrink-0" style={{ minWidth: 60 }}>
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center transition-all"
                    style={{ backgroundColor: active ? c.card : 'rgba(0,0,0,0.05)', border: active ? `2px solid ${c.accent}` : '2px solid transparent' }}>
                    <span style={{ fontSize: 20 }}>{h.iconValue || '✨'}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, maxWidth: 60, color: active ? c.accent : 'rgba(0,0,0,0.45)' }}
                    className="truncate text-center">{h.title}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {habits.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ fontSize: 48 }}>📊</p>
            <p className="text-muted-foreground mt-4" style={{ fontSize: 14 }}>Дадал нэмээгүй байна</p>
          </div>
        ) : isAllMode ? (
          <AllHabitsOverview
            habits={habits}
            logs={allLogs}
            composites={allComposites}
            adaptations={allAdaptations}
            loading={allLoading}
          />
        ) : !selected ? null : (
          <>
            {/* Habit full name */}
            <div className="-mb-1">
              <p style={{ fontSize: 13, fontWeight: 500 }} className="text-muted-foreground">{selected.title}</p>
              {selected.precedingRoutine && (
                <p style={{ fontSize: 11, lineHeight: 1.4, marginTop: 2 }} className="text-muted-foreground/60">
                  {selected.precedingRoutine}
                </p>
              )}
            </div>

            {/* ═══ 1. Composite Strength Score (with SRBAI inline) ═══ */}
            <SectionCard delay={0}>
              <SectionLabel icon={<Zap className="w-4 h-4" style={{ color: color.accent }} />} label="Дадлын хүч" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <p style={{ fontSize: 11, lineHeight: 1.4 }} className="text-muted-foreground">
                    Оноо = автоматжилт + тууштай байдал + контекст
                  </p>
                  <button onClick={() => setShowFormulaInfo(f => !f)} className="shrink-0">
                    <Info className="w-3.5 h-3.5" style={{ color: showFormulaInfo ? color.accent : 'rgba(0,0,0,0.25)' }} />
                  </button>
                </div>
                <AnimatePresence>
                  {showFormulaInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="rounded-2xl px-3.5 py-3 mb-3"
                      style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }} className="text-foreground">Томъёо</p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#303437' }} />
                          <p style={{ fontSize: 10.5, lineHeight: 1.4 }} className="text-muted-foreground">
                            <span className="font-semibold text-foreground">SRBAI (60%)</span> — SRBAI асуулгаар хэмжсэн автоматжилтын түвшин
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#18A68A' }} />
                          <p style={{ fontSize: 10.5, lineHeight: 1.4 }} className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Тууштай (25%)</span> — биелэлтийн хувь × дата бэлэн байдал
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#3B8FD4' }} />
                          <p style={{ fontSize: 10.5, lineHeight: 1.4 }} className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Контекст (15%)</span> — ижил цаг, газар, дараалалд хийсэн байдал
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <p style={{ fontSize: 10, lineHeight: 1.5 }} className="text-muted-foreground">
                          0–39 Сул · 40–69 Хөгжиж буй · 70–100 Хүчтэй
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-5">
                <ProgressRing value={displayScore} size={100} strokeWidth={7} color={color.accent}>
                  <span style={{ fontSize: 26, fontWeight: 600, color: color.accent }}>{displayScore}</span>
                </ProgressRing>
                <div className="flex-1 flex flex-col gap-2.5">
                  <BarSegment label="SRBAI" value={composite?.srbaiScore ?? 0} max={100} color="#303437" />
                  <BarSegment label="Тууштай" value={composite?.consistencyScore ?? 0} max={100} color="#18A68A" />
                  <BarSegment label="Контекст" value={composite?.contextStabilityScore ?? 0} max={100} color="#3B8FD4" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColor }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: stageColor }}>{stageLabel}</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>
                  {composite ? `Үнэлсэн: ${new Date(composite.evaluatedAt).toLocaleDateString('mn-MN')}` : ''}
                </span>
              </div>

              {/* SRBAI expandable detail */}
              <div className="mt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button className="w-full pt-3" onClick={() => setExpandedSection(expandedSection === 'srbai' ? null : 'srbai')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5" style={{ color: '#303437' }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }} className="text-foreground">Автоматжилт (SRBAI)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {srbaiLatest && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#303437' }}>{Math.round(srbaiLatest.normalizedScore100)}/100</span>
                      )}
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform"
                        style={{ transform: expandedSection === 'srbai' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </div>
                  </div>
                </button>
                <AnimatePresence>
                  {expandedSection === 'srbai' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="pt-3">
                        {srbaiLatest ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p style={{ fontSize: 11, marginTop: 2 }} className="text-muted-foreground">
                                Дундаж: {srbaiLatest.rawAverage.toFixed(1)} / 7
                              </p>
                              <p style={{ fontSize: 10, marginTop: 4 }} className="text-muted-foreground">
                                {new Date(srbaiLatest.assessedAt).toLocaleDateString('mn-MN')}
                              </p>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSrbai(true)}
                              className="rounded-2xl px-4 py-2"
                              style={{ backgroundColor: '#303437', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                              Дахин үнэлэх
                            </motion.button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p style={{ fontSize: 12, lineHeight: 1.5 }} className="text-muted-foreground">
                              Үнэлгээ өгөөгүй байна
                            </p>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSrbai(true)}
                              className="rounded-2xl px-4 py-2"
                              style={{ backgroundColor: '#303437', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                              Үнэлгээ өгөх
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionCard>

            {/* ═══ 2. Completion stats (compact rows) ═══ */}
            <SectionCard delay={0.03}>
              <SectionLabel icon={<Target className="w-4 h-4" style={{ color: color.accent }} />} label="Биелэлт" />
              <div className="flex flex-col gap-0">
                {[
                  { label: 'Биелсэн', value: `${progress?.doneCount ?? doneLogs.length} / ${progress?.totalLogs ?? logs.length}`, sub: `${completionRate}%` },
                  { label: 'Дараалал', value: `${streak} өдөр` },
                  { label: 'Өөрөө эхлүүлсэн', value: `${selfRate}%` },
                ].map((row, i) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5"
                    style={i > 0 ? { borderTop: '1px solid rgba(0,0,0,0.05)' } : undefined}>
                    <span style={{ fontSize: 12, fontWeight: 500 }} className="text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      {row.sub && <span style={{ fontSize: 11 }} className="text-muted-foreground">{row.sub}</span>}
                      <span style={{ fontSize: 13, fontWeight: 600 }} className="text-foreground">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ═══ 3. Adaptation Recommendation ═══ */}
            {adaptInfo && (
              <SectionCard delay={0.06}>
                <SectionLabel icon={<Sparkles className="w-4 h-4" style={{ color: adaptInfo.color }} />} label="Зөвлөмж" />
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: adaptInfo.color + '18' }}>
                    <div style={{ color: adaptInfo.color }}>{adaptInfo.icon}</div>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }} className="text-foreground">{adaptInfo.label}</p>
                    <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 2 }} className="text-muted-foreground">{adaptInfo.description}</p>
                  </div>
                </div>
                {adaptation?.milestoneReached && (
                  <div className="mt-3 rounded-xl px-3 py-2" style={{ backgroundColor: '#30343720' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#303437' }}>🎯 Milestone-д хүрлээ!</p>
                  </div>
                )}
              </SectionCard>
            )}

            {/* ═══ 4. Calendar Heatmap ═══ */}
            <SectionCard delay={0.09}>
              <SectionLabel icon={<Calendar className="w-4 h-4" style={{ color: color.accent }} />} label="Хуанли" />
              <MonthCalendar logs={logs} accent={color.accent} />
            </SectionCard>

            {/* ═══ 5. Stats Grid ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="grid grid-cols-2 gap-3">
              <StatMini icon={<Flame className="w-4 h-4" style={{ color: '#EF4444' }} />}
                label="Дараалал (streak)" value={`${streak} өдөр`} color="#EF4444" />
              <StatMini icon={<Calendar className="w-4 h-4" style={{ color: color.accent }} />}
                label="Нийт биелсэн" value={`${doneLogs.length}`} color={color.accent} />
              <StatMini icon={<MapPin className="w-4 h-4" style={{ color: '#3B8FD4' }} />}
                label="Контекст тогтвортой" value={`${Math.round(composite?.contextStabilityScore ?? 0)}%`} color="#3B8FD4" />
              <StatMini icon={<Clock className="w-4 h-4" style={{ color: '#E8A87C' }} />}
                label="Бие даасан байдал" value={`${selfRate}%`} color="#E8A87C" />
            </motion.div>
          </>
        )}
      </div>

      {/* SRBAI Modal */}
      <AnimatePresence>
        {showSrbai && <SrbaiModal accent={color.accent} onClose={() => setShowSrbai(false)} onSubmit={handleSrbaiSubmit} />}
      </AnimatePresence>

      {!showSrbai && <BottomNav />}
    </div>
  );
}
