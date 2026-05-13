import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Bell,
  ChevronDown,
  ExternalLink,
  SlidersHorizontal,
  Share2,
  User,
  Star,
  Flame,
  Zap,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import { engagementApi } from '@/api/engagement';
import { Skeleton } from '@/components/skeleton';
import { Spinner } from '@/components/spinner';
import { getHabitColor } from '@/lib/habit-colors';
import { shareAchievement } from '@/lib/share-achievement';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';
import type { EngagementBadge, EngagementSummary, Habit } from '@/api/types';

function formatMnMonthDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}-р сар ${date.getDate()}`;
}

const BADGE_LABELS: Record<string, string> = {
  FIRST_DONE: 'Анхны амжилт',
  STREAK_7: '7 өдрийн дараалал',
  STREAK_21: '21 өдрийн дараалал',
  TOTAL_30: '30 удаагийн гүйцэтгэл',
};

const XP_RANK_TIERS = [
  { minXp: 0,    title: 'Гал тавигч',    emoji: '🔥' },
  { minXp: 100,  title: 'Хурдан туулай', emoji: '🐰' },
  { minXp: 300,  title: 'Зоригтой арслан', emoji: '🦁' },
  { minXp: 700,  title: 'Нисдэг бүргэд', emoji: '🦅' },
  { minXp: 1500, title: 'Домогт луу',    emoji: '🐉' },
] as const;

function getXpRank(totalXp: number) {
  const xp = Math.max(0, totalXp);
  let currentIndex = 0;

  for (let i = 0; i < XP_RANK_TIERS.length; i += 1) {
    if (xp >= XP_RANK_TIERS[i].minXp) currentIndex = i;
  }

  const current = XP_RANK_TIERS[currentIndex];
  const next = XP_RANK_TIERS[currentIndex + 1] ?? null;
  const levelXp = xp - current.minXp;
  const levelTarget = next ? next.minXp - current.minXp : 1;
  const progressPercent = next ? Math.min(100, Math.max(0, (levelXp / levelTarget) * 100)) : 100;

  return {
    title: current.title,
    level: currentIndex + 1,
    currentXp: xp,
    nextTitle: next?.title ?? null,
    emoji: current.emoji,
    nextMinXp: next?.minXp ?? null,
    remainingXp: next ? Math.max(0, next.minXp - xp) : 0,
    progressPercent,
  };
}

function EngagementBadgeGlyph({ badgeCode, size = 'md' }: { badgeCode: string; size?: 'md' | 'lg' }) {
  const cn = size === 'lg' ? 'w-[22px] h-[22px] shrink-0' : 'w-5 h-5 shrink-0';
  const sw = size === 'lg' ? 2.25 : 2;
  switch (badgeCode) {
    case 'FIRST_DONE':
      return <Star className={cn} strokeWidth={sw} style={{ color: 'var(--primary)' }} />;
    case 'STREAK_7':
      return <Flame className={cn} strokeWidth={sw} style={{ color: 'var(--primary)' }} />;
    case 'STREAK_21':
      return <Zap className={cn} strokeWidth={sw} style={{ color: 'var(--primary)' }} />;
    case 'TOTAL_30':
      return <Trophy className={cn} strokeWidth={sw} style={{ color: 'var(--primary)' }} />;
    default:
      return <Award className={cn} strokeWidth={sw} style={{ color: 'var(--text-muted-soft)' }} />;
  }
}

const SHARE_RESULT_MESSAGE = {
  shared: 'Хуваалцах цонх нээгдлээ.',
  'shared-text': 'Хуваалцах цонх нээгдлээ.',
  'copied-image': 'Амжилтын зураг clipboard руу хуулагдлаа.',
  'copied-text': 'Амжилтын текст clipboard руу хуулагдлаа.',
  downloaded: 'Амжилтын зураг татагдлаа.',
} as const;

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-card overflow-hidden" style={{ boxShadow: SHADOW.card }}>
      {children}
    </div>
  );
}



export function ProfilePage() {
  const navigate = useNavigate();
  const { userId, displayName } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [engagement, setEngagement] = useState<EngagementSummary | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(true);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [shareBusyId, setShareBusyId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const loadHabits = useCallback(() => {
    if (!userId) return;
    setHabitsLoading(true);
    habitsApi
      .list(userId, true)
      .then(setHabits)
      .catch(console.error)
      .finally(() => setHabitsLoading(false));
  }, [userId]);

  const loadEngagement = useCallback(() => {
    if (!userId) return;
    setEngagementLoading(true);
    engagementApi
      .getSummary(userId)
      .then(setEngagement)
      .catch(console.error)
      .finally(() => setEngagementLoading(false));
  }, [userId]);

  useEffect(() => {
    loadHabits();
    loadEngagement();
  }, [loadHabits, loadEngagement]);

  // Refetch when the tab becomes visible again so achievements/streaks stay fresh.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadHabits();
        loadEngagement();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadHabits, loadEngagement]);

  useEffect(() => {
    if (selectedBadgeId && !engagement?.badges.some((badge) => badge.id === selectedBadgeId)) {
      setSelectedBadgeId(null);
      setShareStatus(null);
    }
  }, [engagement, selectedBadgeId]);

  const activeHabits = useMemo(() => habits.filter((h) => h.status === 'ACTIVE'), [habits]);
  const activeCount = activeHabits.length;
  const unlockedBadgeCount = engagement?.unlockedBadgeCount ?? 0;
  const selectedBadge = selectedBadgeId
    ? engagement?.badges.find((badge) => badge.id === selectedBadgeId) ?? null
    : null;
  const visibleBadges = useMemo(() => {
    if (!engagement?.badges) return [];
    return showAllBadges ? engagement.badges : engagement.badges.slice(0, 3);
  }, [engagement, showAllBadges]);
  const initials = useMemo(() => {
    if (!displayName) return '';
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  const handleShareBadge = async (badge: EngagementBadge) => {
    const badgeLabel = BADGE_LABELS[badge.badgeCode] ?? badge.badgeCode;
    const color = getHabitColor(badge.habitColor);
    setShareBusyId(badge.id);
    setShareStatus(null);
    try {
      const result = await shareAchievement({
        title: badgeLabel,
        subtitle: badge.habitTitle
          ? `“${badge.habitTitle}” дадал дээр шинэ амжилт нээлээ.`
          : 'Шинэ амжилт нээлээ.',
        accentColor: color.accent,
        badgeIcon: badge.habitIcon ?? null,
        xpLabel: engagement ? `${engagement.totalXp} XP` : null,
        userName: displayName || null,
        text: badge.habitTitle
          ? `“${badge.habitTitle}” дадал дээр ${badgeLabel} амжилтыг нээлээ.`
          : `Шинэ амжилт: ${badgeLabel}`,
      });
      setShareStatus(SHARE_RESULT_MESSAGE[result]);
    } catch (err) {
      // Ignore AbortError (user dismissed) and InvalidStateError (double-tap)
      if (
        err instanceof Error &&
        err.name !== 'AbortError' &&
        err.name !== 'InvalidStateError'
      ) {
        console.warn('Share failed:', err.message);
        setShareStatus('Хуваалцах үед алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setShareBusyId(null);
    }
  };

  const isLoadingProfile = engagementLoading && !engagement;
  const totalBadgeCount = engagement?.badges?.length ?? 0;
  const hasMoreBadges = totalBadgeCount > 3;
  const xpRank = getXpRank(engagement?.totalXp ?? 0);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Page header — matches the pattern used by other tabs */}
      <div className="px-5 pt-12 pb-2 flex items-center justify-between">
        <p style={TYPOGRAPHY.pageTitle} className="text-foreground">
          Профайл
        </p>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/reminders')}
            className="w-9 h-9 rounded-[18px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
            aria-label="Сануулгууд"
          >
            <Bell className="w-4 h-4 text-foreground" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-[18px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
            aria-label="Тохиргоо"
          >
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
          </motion.button>
        </div>
      </div>

      <div className="px-5 pt-3 flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-5 bg-card"
          style={{ boxShadow: SHADOW.card }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: initials ? 'var(--primary)' : 'var(--muted)',
                color: initials ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {initials ? (
                <span style={{ ...TYPOGRAPHY.statMd, fontWeight: 600, fontSize: 16 }}>
                  {initials}
                </span>
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {isLoadingProfile && !displayName ? (
                <>
                  <Skeleton width={140} height={20} />
                  <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
                </>
              ) : (
                <>
                  <p style={TYPOGRAPHY.pageTitle} className="text-foreground truncate">
                    {displayName || 'Хэрэглэгч'}
                  </p>
                  <p style={TYPOGRAPHY.caption} className="text-muted-foreground mt-1">
                    , love you - Demi
                  </p>
                </>
              )}
            </div>
          </div>
          <div
            className="flex justify-center gap-6 pt-4"
            style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}
          >
            <div className="text-center flex-1">
              <p style={TYPOGRAPHY.statLg} className="text-foreground">
                {habitsLoading ? '—' : activeCount}
              </p>
              <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                Идэвхтэй
              </p>
            </div>
            <div style={{ width: 1, backgroundColor: 'var(--surface-border-soft)' }} />
            <div className="text-center flex-1">
              <p
                style={{ ...TYPOGRAPHY.statLg, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                className="text-foreground"
              >
                {isLoadingProfile ? '—' : unlockedBadgeCount}
                {!isLoadingProfile && unlockedBadgeCount > 0 ? (
                  <Award className="w-4 h-4" style={{ color: '#f59e0b' }} />
                ) : null}
              </p>
              <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                Амжилт
              </p>
            </div>
            <div style={{ width: 1, backgroundColor: 'var(--surface-border-soft)' }} />
            <div className="text-center flex-1">
              <p style={TYPOGRAPHY.statLg} className="text-foreground">
                {isLoadingProfile ? '—' : engagement?.totalXp ?? 0}
              </p>
              <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                XP
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2 pl-0.5">
            <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground">
              Амжилт
            </p>
            {!isLoadingProfile && totalBadgeCount > 0 ? (
              <span style={TYPOGRAPHY.micro} className="text-muted-foreground">
                {totalBadgeCount} нээгдсэн
              </span>
            ) : null}
          </div>
          <Card>
            <div className="px-4 py-4">
              {isLoadingProfile ? (
                <div className="flex flex-col gap-2.5">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} height={66} rounded={16} />
                  ))}
                </div>
              ) : (
                <>
                  <div
                    className="rounded-[18px] p-3.5 mb-3"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--primary) 0%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--primary) 0%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 14%, transparent)' }}
                      >
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{xpRank.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p style={{ ...TYPOGRAPHY.sectionTitle }} className="text-foreground truncate">
                            {xpRank.title}
                          </p>
                          <span
                            className="rounded-full px-2 py-1 shrink-0"
                            style={{
                              ...TYPOGRAPHY.micro,
                              backgroundColor: 'var(--surface-muted)',
                              color: 'var(--primary)',
                              fontWeight: 500,
                            }}
                          >
                            Rank {xpRank.level}
                          </span>
                        </div>
                        <p style={{ ...TYPOGRAPHY.micro, marginTop: 4 }} className="text-muted-foreground">
                          {xpRank.nextTitle
                            ? `Дараагийн rank хүртэл ${xpRank.remainingXp} XP`
                            : 'Хамгийн дээд rank-д хүрсэн байна'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={TYPOGRAPHY.micro} className="text-muted-foreground">
                          {xpRank.currentXp} XP
                        </span>
                        <span style={TYPOGRAPHY.micro} className="text-muted-foreground">
                          {xpRank.nextMinXp ? `${xpRank.nextMinXp} XP` : 'MAX'}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--surface-muted)' }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${xpRank.progressPercent}%` }}
                          transition={{ duration: 0.55, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: 'var(--primary)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {engagement?.badges?.length ? (
                    <>
                      <div className="flex flex-col gap-2.5">
                        {visibleBadges.map((badge) => {
                          const isSelected = selectedBadgeId === badge.id;
                          const label = BADGE_LABELS[badge.badgeCode] ?? badge.badgeCode;
                          const palette = getHabitColor(badge.habitColor);

                          return (
                            <motion.button
                              key={badge.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setShareStatus(null);
                                setSelectedBadgeId(isSelected ? null : badge.id);
                              }}
                              aria-label={`${label}${badge.habitTitle ? ` — ${badge.habitTitle}` : ''}`}
                              className="rounded-[16px] px-3 py-3 text-left flex items-center gap-3"
                              style={{
                                backgroundColor: `${palette.accent}${isSelected ? '20' : '0e'}`,
                                border: `1px solid ${palette.accent}${isSelected ? '55' : '28'}`,
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${palette.accent}${isSelected ? '2a' : '1e'}` }}
                              >
                                <EngagementBadgeGlyph badgeCode={badge.badgeCode} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground truncate">
                                  {label}
                                </p>
                                <p style={{ ...TYPOGRAPHY.micro, marginTop: 3 }} className="text-muted-foreground truncate">
                                  {badge.habitTitle ?? 'Системийн амжилт'}
                                </p>
                              </div>
                              <span
                                className="shrink-0 rounded-full px-2 py-1"
                                style={{
                                  ...TYPOGRAPHY.micro,
                                  backgroundColor: isSelected ? `${palette.accent}1f` : 'var(--surface-muted)',
                                  color: isSelected ? palette.accent : 'var(--text-muted-soft)',
                                }}
                              >
                                {formatMnMonthDay(badge.awardedAt)}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {hasMoreBadges ? (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowAllBadges((v) => !v)}
                          className="w-full mt-3 flex items-center justify-center gap-1.5 rounded-[14px] py-2.5"
                          style={{
                            backgroundColor: 'var(--surface-subtle)',
                            ...TYPOGRAPHY.caption,
                            fontWeight: 600,
                            color: 'var(--text-soft)',
                          }}
                        >
                          {showAllBadges ? 'Цөөн харуулах' : `Бүгдийг харах (${totalBadgeCount})`}
                          <motion.span animate={{ rotate: showAllBadges ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-4 h-4" />
                          </motion.span>
                        </motion.button>
                      ) : null}

                      <AnimatePresence>
                        {selectedBadge && (() => {
                          const label = BADGE_LABELS[selectedBadge.badgeCode] ?? selectedBadge.badgeCode;
                          const palette = getHabitColor(selectedBadge.habitColor);

                          return (
                            <motion.div
                              key={selectedBadge.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              className="mt-3 rounded-[18px] p-3.5"
                              style={{
                                backgroundColor: 'var(--card)',
                                border: `1px solid ${palette.accent}30`,
                                boxShadow: `0 10px 28px ${palette.accent}12`,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${palette.accent}18` }}
                                >
                                  <EngagementBadgeGlyph badgeCode={selectedBadge.badgeCode} size="lg" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p style={{ ...TYPOGRAPHY.sectionTitle, }} className="text-foreground">
                                    {label}
                                  </p>
                                  <p style={TYPOGRAPHY.bodySm} className="text-muted-foreground mt-1">
                                    {selectedBadge.habitTitle
                                      ? `“${selectedBadge.habitTitle}” дээр нээгдсэн.`
                                      : 'Энэ бол таны шинэ системийн амжилт.'}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                                <div
                                  className="rounded-full px-3 py-1.5"
                                  style={{
                                    backgroundColor: `${palette.accent}12`,
                                    border: `1px solid ${palette.accent}20`,
                                  }}
                                >
                                  <span style={{ ...TYPOGRAPHY.micro, color: palette.accent }}>
                                    {formatMnMonthDay(selectedBadge.awardedAt)}
                                  </span>
                                </div>

                                <motion.button
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleShareBadge(selectedBadge)}
                                  disabled={shareBusyId === selectedBadge.id}
                                  className={`flex items-center justify-center gap-2 ${buttonStyles({ variant: 'default', size: 'default' })}`}
                                  style={{ minWidth: 150 }}
                                >
                                  {shareBusyId === selectedBadge.id ? (
                                    <Spinner size={14} />
                                  ) : (
                                    <Share2 className="w-4 h-4" />
                                  )}
                                  <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600 }}>
                                    {shareBusyId === selectedBadge.id ? 'Бэлтгэж байна…' : 'Хуваалцах'}
                                  </span>
                                </motion.button>
                              </div>

                              {shareStatus ? (
                                <p style={{ ...TYPOGRAPHY.micro, marginTop: 10, color: 'var(--text-muted-soft)' }}>
                                  {shareStatus}
                                </p>
                              ) : null}
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div
                      className="rounded-[18px] px-4 py-4"
                      style={{
                        backgroundColor: 'var(--surface-muted)',
                        border: '1px solid var(--surface-border-soft)',
                      }}
                    >
                      <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600 }} className="text-foreground">
                        Одоогоор амжилт нээгдээгүй байна
                      </p>
                      <p style={{ ...TYPOGRAPHY.micro, marginTop: 6 }} className="text-muted-foreground">
                        Дадлаа тогтмол хийж эхлэхэд энэ хэсэг автоматаар дүүрнэ.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card>
            <div className="px-4 py-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 600 }} className="text-foreground">
                  Судалгаанд оролцоорой
                </p>
                <p style={{ ...TYPOGRAPHY.micro, marginTop: 3 }} className="text-muted-foreground">
                  2-3 минут л хангалттай
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSeqU77MUs0L-7RUtyu4QjqWpDrWZfI2R8qyANKvuRnvjt44YQ/viewform', '_blank', 'noopener,noreferrer')}
                className={`shrink-0 flex items-center justify-center gap-1.5 ${buttonStyles({ variant: 'default', size: 'sm' })}`}
                style={{ backgroundColor: 'var(--primary)', fontWeight: 600, fontSize: 12, color: 'var(--primary-foreground)' }}
              >
                Бөглөх
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
