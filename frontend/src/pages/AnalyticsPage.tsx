import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Calendar,
  Target, Brain, MapPin, Clock,
  ChevronDown, ChevronRight, Sparkles, X, Info,
} from 'lucide-react';
import { getHabitColor } from '@/lib/habit-colors';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';
import { svgPaths } from '@/lib/svg-paths';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import { srbaiApi } from '@/api/srbai';
import type { Habit, HabitLog, ProgressSummary } from '@/api/types';
import type { SrbaiAssessment, SrbaiCompositeScore } from '@/api/srbai';
import { feedbackApi } from '@/api/feedback';
import type { DifficultyFeedback, ReflectionResponse } from '@/api/feedback';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecommendations, useRefreshRecommendations, useLogRecommendationInteraction, useLogArticleInteraction } from '@/features/learning/hooks/useRecommendations';
import { RecommendationCard } from '@/features/learning/components/RecommendationCard';
import type { RecommendationItem } from '@/features/learning/model/recommendation.types';

import { BottomNav } from '@/components/bottom-nav';
import { MonthCalendar } from '@/components/month-calendar';
import { computeScheduledStreakFromLogs, countCompletedDays, countScheduledDays } from '@/lib/habit-log-days';

// ── Helpers ─────────────────────────────────────────────────────────────────
function withAlpha(color: string, alpha: number) {
  if (color.startsWith('#')) {
    const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return `${color}${hex}`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-border-soft)" strokeWidth={strokeWidth} />
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
      className={`rounded-[20px] p-4 bg-card ${className}`} style={{ boxShadow: SHADOW.card }}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span style={TYPOGRAPHY.sectionTitle} className="text-foreground">{label}</span>
    </div>
  );
}

function BarSegment({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span style={{ ...TYPOGRAPHY.micro, width: 60 }} className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full" style={{ backgroundColor: 'var(--surface-border-soft)' }}>
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      </div>
      <span style={{ ...TYPOGRAPHY.micro, fontWeight: 600, width: 32, textAlign: 'right' }} className="text-foreground">{pct}%</span>
    </div>
  );
}

function StatMini({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-[16px] p-3.5 bg-card" style={{ boxShadow: SHADOW.card }}>
      <div className="w-8 h-8 rounded-[12px] flex items-center justify-center mb-2" style={{ backgroundColor: withAlpha(color, 0.1) }}>
        {icon}
      </div>
      <p style={TYPOGRAPHY.statLg} className="text-foreground">{value}</p>
      <p style={{ ...TYPOGRAPHY.micro, marginTop: 2 }} className="text-muted-foreground">{label}</p>
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
          <p style={TYPOGRAPHY.cardTitle} className="text-foreground">SRBAI Үнэлгээ</p>
          <button onClick={onClose} className={buttonStyles({ variant: 'nav', size: 'iconSm' })} style={{ backgroundColor: 'var(--surface-subtle)' }}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p style={{ ...TYPOGRAPHY.caption, lineHeight: 1.5 }} className="text-muted-foreground mb-4">
          1 (огт үгүй) — 7 (бүрэн зөвшөөрч байна) хооронд үнэлнэ үү
        </p>
        <div className="flex flex-col gap-4">
          {SRBAI_QUESTIONS.map((q, qi) => (
            <div key={qi}>
              <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground mb-2">{qi + 1}. {q}</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map(v => (
                  <motion.button key={v} whileTap={{ scale: 0.9 }}
                    onClick={() => setAnswers(prev => { const n = [...prev]; n[qi] = v; return n; })}
                    className={`flex-1 h-9 rounded-xl flex items-center justify-center transition-all ${buttonStyles({ variant: 'chip', size: 'sm' })}`}
                    style={{
                      backgroundColor: answers[qi] === v ? accent : 'var(--surface-subtle)',
                      color: answers[qi] === v ? '#fff' : 'var(--text-soft)',
                      fontSize: 13, fontWeight: answers[qi] === v ? 550 : 400,
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
          className={`w-full mt-5 ${buttonStyles({ variant: allAnswered ? 'accent' : 'secondary', size: 'lg' })}`}
          style={{
            backgroundColor: allAnswered ? accent : 'var(--surface-strong)',
            color: allAnswered ? '#fff' : 'var(--text-placeholder)',
            fontSize: 14, fontWeight: 550,
          }}>
          Үнэлгээ өгөх
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── All Habits Overview (Бүгд) ──────────────────────────────────────────────

function AllHabitsOverview({ habits, logs, composites, loading }: {
  habits: Habit[];
  logs: HabitLog[];
  composites: (SrbaiCompositeScore & { habitId: string })[];
  loading: boolean;
}) {
  // Group logs by habitId so each habit's completion is counted independently
  const logsByHabit = new Map<string, HabitLog[]>();
  for (const log of logs) {
    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
    logsByHabit.get(log.habitId)!.push(log);
  }
  let totalCompleted = 0;
  let totalAttempted = 0;
  for (const habit of habits) {
    const habitLogs = logsByHabit.get(habit.id) ?? [];
    totalCompleted += countCompletedDays(habitLogs);
    totalAttempted += countScheduledDays(habit.startDate, habit.scheduleDays);
  }
  const completedDays = totalCompleted;
  const completionRate = totalAttempted > 0
    ? Math.round((totalCompleted / totalAttempted) * 100)
    : 0;

  // Average composite score
  const avgScore = composites.length > 0
    ? Math.round(composites.reduce((s, c) => s + c.finalScore, 0) / composites.length)
    : 0;

  const avgStage = avgScore >= 70 ? 'strong' : avgScore >= 40 ? 'building' : 'weak';
  const stageLabel = avgStage === 'strong' ? 'Хүчтэй' : avgStage === 'building' ? 'Хөгжиж буй' : 'Сул';
  const stageColor = avgStage === 'strong' ? '#18A68A' : avgStage === 'building' ? '#E8A87C' : '#D94F6E';

  // Per-habit strength for the breakdown list
  const habitScores = habits.map(h => {
    const comp = composites.find(c => c.habitId === h.id);
    return { habit: h, score: Math.round(comp?.finalScore ?? 0), stage: comp?.stage ?? 'weak' };
  });

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
      <p style={TYPOGRAPHY.bodySm} className="text-muted-foreground -mb-1">Бүх дадлын тойм</p>

      {/* Calendar — all habits combined */}
      <SectionCard delay={0}>
        <SectionLabel icon={<Calendar className="w-4 h-4" style={{ color: 'var(--foreground)' }} />} label="Хуанли" />
        <MonthCalendar logs={logs} accent="var(--foreground)" />
      </SectionCard>

      {/* Overall Strength Ring */}
      <SectionCard delay={0.03}>
        <div className="flex flex-col items-center gap-2 py-2">
          <ProgressRing value={avgScore} size={120} strokeWidth={8} color={stageColor}>
            <div className="flex flex-col items-center">
              <span style={{ fontSize: 28, fontWeight: 600, color: stageColor }}>{avgScore}%</span>
            </div>
          </ProgressRing>
          <p style={TYPOGRAPHY.bodySm} className="text-muted-foreground">дадлын хүч</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColor }} />
            <span style={{ ...TYPOGRAPHY.caption, color: stageColor }}>{stageLabel}</span>
          </div>
        </div>
      </SectionCard>



      {/* Per-habit breakdown */}
      <SectionCard delay={0.09}>
        <SectionLabel icon={<Target className="w-4 h-4" style={{ color: 'var(--foreground)' }} />} label="Дадал тус бүрийн хүч" />
        <div className="flex flex-col gap-2.5">
          {habitScores.map(({ habit, score, stage }) => {
            const sc = stage === 'strong' ? '#18A68A' : stage === 'building' ? '#E8A87C' : '#D94F6E';
            return (
              <div key={habit.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}>
                  <span style={{ fontSize: 14 }}>{habit.iconValue || '✨'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ ...TYPOGRAPHY.caption, fontWeight: 500 }} className="text-foreground truncate">{habit.title}</span>
                    <span style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: sc }}>{score}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--surface-border-soft)' }}>
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
          label="Гүйцэтгэлийн хувь" value={`${completionRate}%`} color="#18A68A" />
        <StatMini icon={<Calendar className="w-4 h-4" style={{ color: '#3B8FD4' }} />}
          label="Нийт гүйцэтгэсэн" value={`${completedDays}`} color="#3B8FD4" />
        <StatMini icon={<svg width="20" height="20" viewBox="0 0 26 25.0006" fill="none"><path d={svgPaths.p2eaaee80} fill={stageColor} /></svg>}
          label="Дундаж хүч" value={`${avgScore}`} color={stageColor} />
        <StatMini icon={<BarChart3 className="w-4 h-4" style={{ color: 'var(--foreground)' }} />}
          label="Нийт дадал" value={`${habits.length}`} color="var(--foreground)" />
      </motion.div>
    </>
  );
}

// ── Performance Insight Section ─────────────────────────────────────────────

const DIFFICULTY_SCORE: Record<string, number> = {
  very_easy: 1, easy: 2, moderate: 3, hard: 4, very_hard: 5,
};
const DIFFICULTY_LABEL: Record<string, string> = {
  very_easy: 'Маш амархан', easy: 'Амархан', moderate: 'Дунд зэрэг', hard: 'Хэцүү', very_hard: 'Маш хэцүү',
};

function PerformanceInsightSection({ difficulties, reflections, showAllReflections, onToggleReflections, accent }: {
  difficulties: DifficultyFeedback[];
  reflections: ReflectionResponse[];
  showAllReflections: boolean;
  onToggleReflections: () => void;
  accent: string;
}) {
  // Average difficulty score 1-5
  const avgScore = difficulties.length > 0
    ? difficulties.reduce((s, d) => s + (DIFFICULTY_SCORE[d.rating] ?? 3), 0) / difficulties.length
    : null;

  // Trend: compare last 7 days avg vs overall avg
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = difficulties.filter(d => new Date(d.occurredAt) >= sevenDaysAgo);
  const recentAvg = recent.length > 0
    ? recent.reduce((s, d) => s + (DIFFICULTY_SCORE[d.rating] ?? 3), 0) / recent.length
    : null;
  const trend = avgScore !== null && recentAvg !== null
    ? recentAvg > avgScore + 0.3 ? 'up' : recentAvg < avgScore - 0.3 ? 'down' : 'stable'
    : 'stable';
  const trendLabel = trend === 'up' ? 'Сүүлд арай хэцүү болсон' : trend === 'down' ? 'Сүүлд арай амар болсон' : 'Тогтвортой';
  const trendColor = trend === 'up' ? '#E8A87C' : trend === 'down' ? '#18A68A' : '#3B8FD4';

  // difficulty scale label
  const avgLabel = avgScore !== null
    ? avgScore <= 1.5 ? 'Амархан' : avgScore <= 2.5 ? 'Амар–Дунд' : avgScore <= 3.5 ? 'Дунд зэрэг' : avgScore <= 4.5 ? 'Хэцүү' : 'Маш хэцүү'
    : null;

  const visibleReflections = showAllReflections ? reflections : reflections.slice(0, 2);

  return (
    <SectionCard delay={0.12}>
      <SectionLabel icon={<Brain className="w-4 h-4" style={{ color: accent }} />} label="Мэдрэмж ба хүчин чадал" />
      <div className="flex flex-col gap-3">
        {/* Difficulty */}
        {difficulties.length > 0 && (
          <div className="rounded-2xl p-3" style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--surface-border-faint)' }}>
            <p style={{ ...TYPOGRAPHY.micro, fontWeight: 600, color: 'var(--text-muted-soft)', marginBottom: 6 }}>Дундаж хүчин чадал</p>
            {/* 5-dot scale */}
            <div className="flex gap-1.5 mb-2">
              {[1, 2, 3, 4, 5].map(v => (
                <div key={v} className="flex-1 h-2 rounded-full" style={{
                  backgroundColor: avgScore !== null && v <= Math.round(avgScore)
                    ? (Math.round(avgScore) >= 4 ? '#E8A87C' : Math.round(avgScore) <= 2 ? '#18A68A' : '#3B8FD4')
                    : 'var(--surface-strong)',
                }} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p style={{ ...TYPOGRAPHY.caption, fontWeight: 600 }} className="text-foreground">{avgLabel}</p>
              <p style={{ fontSize: 10, color: trendColor }}>{trendLabel}</p>
            </div>
          </div>
        )}
        {/* Reflections */}
        {reflections.length > 0 && (
          <div className="rounded-2xl p-3" style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--surface-border-faint)' }}>
            <p style={{ ...TYPOGRAPHY.micro, fontWeight: 600, color: 'var(--text-muted-soft)', marginBottom: 8 }}>Эргэцүүлэмж</p>
            <div className="flex flex-col gap-3">
              {visibleReflections.map(r => {
                const d = new Date(r.occurredAt);
                const dateStr = `${d.getMonth() + 1}-р сарын ${d.getDate()}`;
                return (
                  <div key={r.id} className="flex flex-col gap-0.5">
                    <p style={{ fontSize: 10, color: 'var(--text-placeholder)' }}>{dateStr}</p>
                    <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-soft)' }}>
                      {r.text.length > 100 ? r.text.slice(0, 97) + '…' : r.text}
                    </p>
                  </div>
                );
              })}
            </div>
            {reflections.length > 2 && (
              <button onClick={onToggleReflections} className={buttonStyles({ variant: 'link', size: 'inline' })} style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 6 }}>
                {showAllReflections ? 'Хураах' : `+${reflections.length - 2} дэлгэрэнгүй`}
              </button>
            )}
          </div>
        )}
      </div>
      {/* difficulty notes */}
      {difficulties.some(d => d.note) && (
        <div className="mt-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--surface-border-faint)', paddingTop: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 2 }}>Хэцүү байдлын тэмдэглэл</p>
          {difficulties.filter(d => d.note).slice(0, 3).map(d => (
            <p key={d.id} style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-muted-soft)', lineHeight: 1.4 }}>
              "{d.note}" <span style={{ fontStyle: 'normal', color: 'var(--text-placeholder)' }}>· {DIFFICULTY_LABEL[d.rating]}</span>
            </p>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);          // -1 = "Бүгд"
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [composite, setComposite] = useState<SrbaiCompositeScore | null>(null);
  const [srbaiLatest, setSrbaiLatest] = useState<SrbaiAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSrbai, setShowSrbai] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [difficulties, setDifficulties] = useState<DifficultyFeedback[]>([]);
  const [reflections, setReflections] = useState<ReflectionResponse[]>([]);
  const [showAllReflections, setShowAllReflections] = useState(false);

  // ── Aggregate state for "Бүгд" ──
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);
  const [allComposites, setAllComposites] = useState<(SrbaiCompositeScore & { habitId: string })[]>([]);

  const [allLoading, setAllLoading] = useState(false);

  const isAllMode = selectedIdx === -1;
  const selected = habits[selectedIdx] ?? null;

  useEffect(() => {
    if (!userId) return;
    habitsApi.list(userId).then(h => {
      setHabits(h);
      setLoading(false);
      const targetId = searchParams.get('habitId');
      if (targetId) {
        const idx = h.findIndex(hab => hab.id === targetId);
        if (idx !== -1) setSelectedIdx(idx);
      }
    }).catch(() => setLoading(false));
  }, [userId, searchParams]);

  const selectedId = selected?.id ?? null;
  const loadHabitData = useCallback(async () => {
    if (!userId || !selectedId) return;
    const [l, p, c, s, diffs, refs] = await Promise.all([
      habitsApi.listLogs(userId, selectedId),
      habitsApi.getProgressSummary(userId, selectedId).catch(() => null),
      srbaiApi.getCompositeScore(userId, selectedId).catch(() => null),
      srbaiApi.getLatest(userId, selectedId).catch(() => null),
      feedbackApi.listDifficultyRatings(userId, selectedId).catch(() => [] as DifficultyFeedback[]),
      feedbackApi.listReflections(userId, selectedId).catch(() => [] as ReflectionResponse[]),
    ]);
    setLogs(l); setProgress(p); setComposite(c); setSrbaiLatest(s);
    setDifficulties(diffs); setReflections(refs); setShowAllReflections(false);
  }, [userId, selectedId]);

  useEffect(() => { loadHabitData(); }, [loadHabitData]);

  // ── Load aggregate data for "Бүгд" mode ──
  const loadAllData = useCallback(async () => {
    if (!userId || habits.length === 0) return;
    setAllLoading(true);
    try {
      const results = await Promise.all(
        habits.map(async (h) => {
          const [logs, comp] = await Promise.all([
            habitsApi.listLogs(userId, h.id).catch(() => [] as HabitLog[]),
            srbaiApi.getCompositeScore(userId, h.id).catch(() => null),
          ]);
          return { habitId: h.id, logs, comp };
        }),
      );
      setAllLogs(results.flatMap(r => r.logs));
      // Tag composites with habitId for per-habit breakdown
      setAllComposites(results.map(r => r.comp ? { ...r.comp, habitId: r.habitId } : null).filter((c): c is SrbaiCompositeScore & { habitId: string } => c !== null));
    } catch { /* ignore */ }
    setAllLoading(false);
  }, [userId, habits]);

  useEffect(() => { if (isAllMode) loadAllData(); }, [isAllMode, loadAllData]);

  const navigate = useNavigate();
  const color = getHabitColor(selected?.color);

  // ── Learning recommendations for selected habit ──
  const { data: habitRecommendations } = useRecommendations(
    userId ?? undefined,
    selected?.id,
  );
  const refreshRecommendations = useRefreshRecommendations(userId ?? '');
  const logRecInteraction = useLogRecommendationInteraction(userId ?? '');
  const logArticleInteraction2 = useLogArticleInteraction(userId ?? '');

  // Auto-generate recommendations whenever a habit is selected
  useEffect(() => {
    if (userId && selected?.id) {
      refreshRecommendations.mutate(selected.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selected?.id]);
  const streak = computeScheduledStreakFromLogs(logs, selected?.scheduleDays);
  const completedDays = countCompletedDays(logs);

  // Always use composite score (backend computes even without SRBAI)
  const displayScore = Math.round(composite?.finalScore ?? 0);
  const stage = composite?.stage ?? 'weak';
  const stageLabel = stage === 'strong' ? 'Хүчтэй' : stage === 'building' ? 'Хөгжиж буй' : 'Сул';
  const stageColor = stage === 'strong' ? '#18A68A' : stage === 'building' ? '#E8A87C' : '#D94F6E';
  const selfRate = progress ? Math.round(progress.selfInitiatedRate * 100) : 0;

  const handleSrbaiSubmit = async (items: [number, number, number, number]) => {
    if (!userId || !selected) return;
    await srbaiApi.submit(userId, selected.id, { item1: items[0], item2: items[1], item3: items[2], item4: items[3] });
    setShowSrbai(false);
    loadHabitData();
  };

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
      {/* Header + Habit Selector — single sticky block */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid var(--surface-border-faint)' }}>
        {habits.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto px-5 pt-14 pb-3"
            style={{ scrollbarWidth: 'none' }}>
            {/* "Бүгд" — all habits */}
            <button
              className={`${buttonStyles({ variant: 'plain', size: 'bare' })} flex flex-col items-center gap-1 shrink-0`}
              onClick={() => setSelectedIdx(-1)}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isAllMode ? 'var(--foreground)' : 'var(--surface-subtle)',
                  boxShadow: isAllMode
                    ? '0 0 0 3px var(--background), 0 0 0 5px var(--foreground)'
                    : '0 2px 8px var(--surface-border-soft)',
                }}>
                <span style={{ fontSize: 22 }}>🏆</span>
              </div>
              <span style={{ ...TYPOGRAPHY.micro, color: isAllMode ? 'var(--foreground)' : 'var(--text-faint)', fontWeight: isAllMode ? 700 : 400, maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                Бүгд
              </span>
            </button>
            {habits.map((h, i) => {
              const active = i === selectedIdx;
              const c = getHabitColor(h.color);
              return (
                <button
                  key={h.id}
                  className={`${buttonStyles({ variant: 'plain', size: 'bare' })} flex flex-col items-center gap-1 shrink-0`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: c.btn,
                      boxShadow: active
                        ? `0 0 0 3px var(--background), 0 0 0 5px ${c.accent}`
                        : '0 2px 8px var(--surface-border-soft)',
                    }}>
                    <span style={{ fontSize: 22 }}>{h.iconValue || '✨'}</span>
                  </div>
                  <span style={{ ...TYPOGRAPHY.micro, color: active ? c.accent : 'var(--text-faint)', fontWeight: active ? 700 : 400, maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{h.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">

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
            loading={allLoading}
          />
        ) : !selected ? null : (
          <>
            {/* Habit definition sentence */}
            <div className="rounded-[20px] bg-card px-4 py-4" style={{ boxShadow: SHADOW.card }}>
              <p style={{ ...TYPOGRAPHY.sectionTitle, lineHeight: 1.75 }} className="text-foreground">
                {selected.precedingRoutine ? (
                  <>
                    <span style={{ }}>{selected.precedingRoutine} </span>
                    <span style={{ fontWeight: 500 }}>дараа </span>
                  </>
                ) : null}
                <span style={{ ...TYPOGRAPHY.sectionTitle }}>{selected.title}</span>
                <span style={{ fontWeight: 500 }}> дадлыг хийнэ.</span>
              </p>
              {selected.motivationProfile?.reason && (
                <p style={{ ...TYPOGRAPHY.body, lineHeight: 1.65, marginTop: 8 }} className="text-foreground">
                  <span style={{ fontWeight: 500 }}>Ингэснээр би: </span>
                  <span style={{...TYPOGRAPHY.sectionTitle }}>{selected.motivationProfile.reason}</span>
                </p>
              )}
            </div>

            {/* ═══ 1. Composite Strength Score (with SRBAI inline) ═══ */}
            <SectionCard delay={0}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 26 25.0006" fill="none"><path d={svgPaths.p2eaaee80} fill={color.accent} /></svg>
                  <span style={TYPOGRAPHY.sectionTitle} className="text-foreground">Дадлын хүч</span>
                </div>
                <button onClick={() => setShowFormulaInfo(f => !f)} className={`${buttonStyles({ variant: 'ghost', size: 'iconSm' })} shrink-0 -mr-0.5`}>
                  <Info className="w-4 h-4" style={{ color: showFormulaInfo ? color.accent : 'var(--text-disabled)' }} />
                </button>
              </div>
              {/* ── Main: big ring with habit icon + motivation text ── */}
              <div className="flex items-center gap-4">
                <ProgressRing value={displayScore} size={116} strokeWidth={8} color={color.accent}>
                  <span style={{ fontSize: 38, lineHeight: 1 }}>{selected.iconValue ?? '✅'}</span>
                </ProgressRing>
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color: color.accent }}>{displayScore}</span>
                    <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600, color: color.accent }}>/100</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stageColor }} />
                    <span style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: stageColor }}>{stageLabel}</span>
                  </div>
                  {selected.motivationProfile?.reason && (
                    <p style={{ ...TYPOGRAPHY.caption, lineHeight: 1.5, marginTop: 2 }} className="text-muted-foreground">
                      <span style={{ fontWeight: 600 }} className="text-foreground">Энэ дадлыг хийснээр: </span>
                      {selected.motivationProfile.reason}
                    </p>
                  )}
                  {composite && (
                    <span style={{ fontSize: 11, color: 'var(--text-placeholder)', marginTop: 2 }}>
                      {(() => { const d = new Date(composite.evaluatedAt); return `Үнэлсэн: ${d.getMonth() + 1}-р сарын ${d.getDate()}`; })()}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Expandable detail (i button) ── */}
              <AnimatePresence initial={false}>
                {showFormulaInfo && (
                  <motion.div
                    key="formula-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}>
                    <div className="mt-3 pt-3 flex flex-col gap-2.5" style={{ borderTop: '1px solid var(--surface-border-soft)' }}>
                      <BarSegment label="SRBAI" value={composite?.srbaiScore ?? 0} max={100} color="var(--foreground)" />
                      <BarSegment label="Тууштай" value={composite?.consistencyScore ?? 0} max={100} color="#18A68A" />
                      <BarSegment label="Контекст" value={composite?.contextStabilityScore ?? 0} max={100} color="#3B8FD4" />
                    </div>
                    <div className="rounded-2xl px-3.5 py-3 mt-3"
                      style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--surface-border-soft)' }}>
                      <p style={{ ...TYPOGRAPHY.caption, fontWeight: 600, marginBottom: 4 }} className="text-foreground">Дадлын хүч гэж юу вэ?</p>
                      <p style={{ ...TYPOGRAPHY.micro, lineHeight: 1.55, marginBottom: 10 }} className="text-muted-foreground">
                        Дадлын хүч нь таны дадлын автоматжилт, тууштай байдал, контекст тогтворжилтыг нэгтгэсэн цогц оноо юм. Энэ оноо таны дадал хэр бэхжсэнийг харуулна.
                      </p>
                      <p style={{ ...TYPOGRAPHY.micro, fontWeight: 600, marginBottom: 6 }} className="text-foreground">Томъёо</p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--foreground)' }} />
                          <p style={{ ...TYPOGRAPHY.micro, lineHeight: 1.4 }} className="text-muted-foreground">
                            <span className="font-semibold text-foreground">SRBAI (60%)</span> — SRBAI асуулгаар хэмжсэн автоматжилтын түвшин
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#18A68A' }} />
                          <p style={{ ...TYPOGRAPHY.micro, lineHeight: 1.4 }} className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Тууштай (25%)</span> — гүйцэтгэлийн хувь × дата бэлэн байдал
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#3B8FD4' }} />
                          <p style={{ ...TYPOGRAPHY.micro, lineHeight: 1.4 }} className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Контекст (15%)</span> — ижил цаг, газар, дараалалд хийсэн байдал
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2" style={{ borderTop: '1px solid var(--surface-border-soft)' }}>
                        <p style={{ ...TYPOGRAPHY.micro, lineHeight: 1.5 }} className="text-muted-foreground">
                          0–39 Сул · 40–69 Хөгжиж буй · 70–100 Хүчтэй
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SRBAI expandable detail */}
              <div className="mt-3" style={{ borderTop: '1px solid var(--surface-border-soft)' }}>
                <button className={`w-full pt-3 ${buttonStyles({ variant: 'ghost', size: 'inline' })}`} onClick={() => setExpandedSection(expandedSection === 'srbai' ? null : 'srbai')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5" style={{ color: 'var(--foreground)' }} />
                      <span style={{ ...TYPOGRAPHY.caption, fontWeight: 600 }} className="text-foreground">Автоматжилт (SRBAI)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {srbaiLatest && (
                        <span style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: 'var(--foreground)' }}>{Math.round(srbaiLatest.normalizedScore100)}/100</span>
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
                              <p style={{ ...TYPOGRAPHY.micro, marginTop: 2 }} className="text-muted-foreground">
                                Дундаж: {srbaiLatest.rawAverage.toFixed(1)} / 7
                              </p>
                              <p style={{ ...TYPOGRAPHY.micro, marginTop: 4 }} className="text-muted-foreground">
                                {(() => { const d = new Date(srbaiLatest.assessedAt); return `${d.getMonth() + 1}-р сарын ${d.getDate()}`; })()}
                              </p>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSrbai(true)}
                              className={buttonStyles({ variant: 'default', size: 'sm' })}
                              style={{ ...TYPOGRAPHY.micro, backgroundColor: 'var(--foreground)', color: 'var(--background)', fontWeight: 600 }}>
                              Дахин үнэлэх
                            </motion.button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p style={{ ...TYPOGRAPHY.caption, lineHeight: 1.5 }} className="text-muted-foreground">
                              Үнэлгээ өгөөгүй байна
                            </p>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSrbai(true)}
                              className={buttonStyles({ variant: 'default', size: 'sm' })}
                              style={{ ...TYPOGRAPHY.micro, backgroundColor: 'var(--foreground)', color: 'var(--background)', fontWeight: 600 }}>
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

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.025 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/habit/${selected.id}`)}
              className="w-full flex items-center gap-3 rounded-[20px] px-4 py-3.5 bg-card text-left"
              style={{ boxShadow: SHADOW.card }}
            >
              <div
                className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: color.btn }}
              >
                <Target className="w-4.5 h-4.5" style={{ color: color.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 600 }} className="text-foreground">
                  Дадлын дэлгэрэнгүй харах
                </p>
                <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                  Зорилго, тохиргоо, сануулга болон бүртгэл
                </p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-disabled)' }} />
            </motion.button>

            {/* ═══ 2. Stats Grid ═══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
              className="grid grid-cols-2 gap-3">
              <StatMini icon={<svg width="18" height="18" viewBox="0 0 23 24" fill="none"><path d={svgPaths.p29fc8c00} fill={color.accent} fillRule="evenodd" clipRule="evenodd" /></svg>}
                label="Дараалал (streak)" value={`${streak} өдөр`} color={color.accent} />
              <StatMini icon={<Calendar className="w-[18px] h-[18px]" style={{ color: color.accent }} />}
                label="Нийт гүйцэтгэсэн" value={`${completedDays}`} color={color.accent} />
              <StatMini icon={<MapPin className="w-[18px] h-[18px]" style={{ color: color.accent }} />}
                label="Контекст тогтвортой" value={`${Math.round(composite?.contextStabilityScore ?? 0)}%`} color={color.accent} />
              <StatMini icon={<Clock className="w-[18px] h-[18px]" style={{ color: color.accent }} />}
                label="Бие даасан байдал" value={`${selfRate}%`} color={color.accent} />
            </motion.div>

            {/* ═══ 3. Calendar Heatmap ═══ */}
            <SectionCard delay={0.06}>
              <SectionLabel icon={<Calendar className="w-4 h-4" style={{ color: color.accent }} />} label="Хуанли" />
              <MonthCalendar logs={logs} accent={color.accent} scheduleDays={selected?.scheduleDays?.map(s => s.weekday)} startDate={selected?.startDate} />
            </SectionCard>

            {/* ═══ 4. Recommendations ═══ */}
            {Array.isArray(habitRecommendations) && habitRecommendations.length > 0 && (
              <SectionCard delay={0.09}>
                <SectionLabel icon={<Sparkles className="w-4 h-4" style={{ color: 'var(--foreground)' }} />} label="Зөвлөмж" />
                <div className="flex flex-col">
                  {(habitRecommendations as RecommendationItem[]).map((rec, i) => (
                    <div key={rec.id}>
                      {i > 0 && <div style={{ height: 1, backgroundColor: 'var(--surface-border-faint)', margin: '0 0 12px' }} />}
                      <RecommendationCard
                        rec={rec}
                        onNavigate={(articleId, recId) => {
                          logArticleInteraction2.mutate({ articleId, interactionType: 'OPENED', sourceType: 'ANALYTICS_PAGE', sourceId: recId });
                          logRecInteraction.mutate({ recommendationId: recId, interactionType: 'CLICKED' });
                          navigate(`/learn/articles/${articleId}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ═══ 5. Performance Insight ═══ */}
            {(difficulties.length > 0 || reflections.length > 0) && (
              <PerformanceInsightSection
                difficulties={difficulties}
                reflections={reflections}
                showAllReflections={showAllReflections}
                onToggleReflections={() => setShowAllReflections(v => !v)}
                accent={color.accent}
              />
            )}
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
