import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Archive,
  Award,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Info,
  KeyRound,
  ExternalLink,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  Share2,
  Shield,
  Sun,
  User,
  Star,
  Flame,
  Zap,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PAGE_TOUR_CONFIG } from '@/features/tour/tour-steps';
import { habitsApi } from '@/api/habits';
import { engagementApi } from '@/api/engagement';
import { pushApi } from '@/api/push';
import { LocationSelector } from '@/components/LocationSelector';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { HabitIconSlot } from '@/components/habit-icon-slot';
import { Spinner } from '@/components/spinner';
import { Skeleton } from '@/components/skeleton';
import { useTheme, setTheme } from '@/lib/theme-store';
import type { ThemeMode } from '@/lib/theme-store';
import { getHabitColor } from '@/lib/habit-colors';
import { ensurePushSubscription, getNotificationPermission } from '@/lib/push';
import { shareAchievement } from '@/lib/share-achievement';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';
import type { EngagementBadge, EngagementSummary, Habit } from '@/api/types';

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { key: 'light', label: 'Цайвар', icon: <Sun className="w-3.5 h-3.5" /> },
  { key: 'dark', label: 'Бараан', icon: <Moon className="w-3.5 h-3.5" /> },
  { key: 'system', label: 'Систем', icon: <Monitor className="w-3.5 h-3.5" /> },
];

const APP_VERSION = `v${__APP_VERSION__}`;

const BADGE_LABELS: Record<string, string> = {
  FIRST_DONE: 'Анхны амжилт',
  STREAK_7: '7 өдрийн дараалал',
  STREAK_21: '21 өдрийн дараалал',
  TOTAL_30: '30 удаагийн гүйцэтгэл',
};

function EngagementBadgeGlyph({ badgeCode, size = 'md' }: { badgeCode: string; size?: 'md' | 'lg' }) {
  const cn = size === 'lg' ? 'w-[22px] h-[22px] shrink-0' : 'w-5 h-5 shrink-0';
  const sw = size === 'lg' ? 2.25 : 2;
  switch (badgeCode) {
    case 'FIRST_DONE':
      return <Star className={cn} strokeWidth={sw} style={{ color: '#d97706', fill: 'rgba(217,119,6,0.22)' }} />;
    case 'STREAK_7':
      return <Flame className={cn} strokeWidth={sw} style={{ color: '#ea580c' }} />;
    case 'STREAK_21':
      return <Zap className={cn} strokeWidth={sw} style={{ color: '#ca8a04' }} />;
    case 'TOTAL_30':
      return <Trophy className={cn} strokeWidth={sw} style={{ color: '#b45309' }} />;
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

function formatMnMonthDay(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getMonth() + 1}-р сар ${date.getDate()}`;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-card overflow-hidden" style={{ boxShadow: SHADOW.card }}>
      {children}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  value,
  badge,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  value?: string;
  badge?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  const interactive = Boolean(onClick) && !disabled;

  return (
    <motion.button
      whileTap={interactive ? { scale: 0.98 } : undefined}
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${
        buttonStyles({ variant: danger ? 'destructive' : 'ghost', size: 'default' })
      }`}
      style={{ opacity: disabled ? 0.55 : 1, cursor: interactive ? 'pointer' : 'default' }}
    >
      <div
        className="w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: danger ? '#ef444418' : 'var(--surface-subtle)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-foreground"
          style={{
            ...TYPOGRAPHY.sectionTitle,
            fontWeight: 500,
            color: danger ? '#ef4444' : undefined,
          }}
        >
          {label}
        </p>
        {subtitle ? (
          <p className="text-muted-foreground mt-0.5" style={TYPOGRAPHY.micro}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {badge ? (
        <span
          className="shrink-0 rounded-full px-2 py-0.5"
          style={{
            ...TYPOGRAPHY.micro,
            fontSize: 10.5,
            backgroundColor: 'var(--surface-muted)',
            color: 'var(--text-muted-soft)',
          }}
        >
          {badge}
        </span>
      ) : null}
      {value ? (
        <span
          className="text-muted-foreground shrink-0 text-right max-w-[128px] truncate"
          style={TYPOGRAPHY.caption}
          title={value}
        >
          {value}
        </span>
      ) : null}
      {interactive && !danger ? (
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-disabled)' }} />
      ) : null}
    </motion.button>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 0.5,
        backgroundColor: 'var(--surface-border-soft)',
        marginLeft: 60,
      }}
    />
  );
}

function PushToggleRow({
  permission,
  busy,
  subscriptionCount,
  onEnable,
  onDisable,
}: {
  permission: string;
  busy: boolean;
  subscriptionCount: number;
  onEnable: () => void;
  onDisable?: () => void;
}) {
  const isOn = permission === 'granted' && subscriptionCount > 0;
  const isDenied = permission === 'denied';

  const handleToggle = () => {
    if (isDenied || busy) return;
    if (isOn) onDisable?.();
    else onEnable();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className="w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: isOn ? 'var(--primary-translucent, rgba(var(--primary-rgb,99,102,241),0.12))' : 'var(--surface-subtle)' }}
      >
        <Bell
          className="w-4 h-4"
          style={{ color: isOn ? 'var(--primary)' : 'var(--muted-foreground)' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground" style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500 }}>
          Сануулга
        </p>
        <p className="text-muted-foreground mt-0.5" style={TYPOGRAPHY.micro}>
          {isDenied
            ? 'Браузерийн тохиргооноос зөвшөөрнө үү'
            : isOn
            ? `${subscriptionCount} төхөөрөмж идэвхтэй`
            : 'Цагтаа сануулга хүлээн авах'}
        </p>
      </div>
      <motion.button
        whileTap={isDenied || busy ? undefined : { scale: 0.92 }}
        onClick={handleToggle}
        disabled={isDenied || busy}
        className="shrink-0"
        style={{ opacity: isDenied ? 0.4 : 1 }}
      >
        <div
          className="relative rounded-full transition-colors duration-200"
          style={{
            width: 48,
            height: 28,
            backgroundColor: isOn ? 'var(--primary)' : 'var(--surface-strong)',
          }}
        >
          {busy ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-t-transparent"
                style={{ borderColor: isOn ? '#fff' : 'var(--muted-foreground)' }}
              />
            </div>
          ) : (
            <motion.div
              className="absolute top-1 rounded-full bg-white"
              style={{ width: 20, height: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
              animate={{ left: isOn ? 24 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
        </div>
      </motion.button>
    </div>
  );
}


export function ProfilePage() {
  const navigate = useNavigate();
  const { userId, displayName, logout } = useAuth();
  const [theme] = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [engagement, setEngagement] = useState<EngagementSummary | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState(getNotificationPermission());
  const [pushBusy, setPushBusy] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [shareBusyId, setShareBusyId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    setPushPermission(getNotificationPermission());
  }, [loadHabits, loadEngagement]);

  // Refetch when the tab becomes visible again so achievements/streaks stay fresh.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadHabits();
        loadEngagement();
        setPushPermission(getNotificationPermission());
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
  const archivedHabits = useMemo(() => habits.filter((h) => h.status === 'ARCHIVED'), [habits]);
  const activeCount = activeHabits.length;
  const archivedCount = archivedHabits.length;
  const unlockedBadgeCount = engagement?.unlockedBadgeCount ?? 0;
  const filteredArchivedHabits = useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    if (!q) return archivedHabits;
    return archivedHabits.filter((h) => h.title.toLowerCase().includes(q));
  }, [archivedHabits, archiveQuery]);
  const selectedBadge = selectedBadgeId
    ? engagement?.badges.find((badge) => badge.id === selectedBadgeId) ?? null
    : null;
  const visibleBadges = useMemo(() => {
    if (!engagement?.badges) return [];
    return showAllBadges ? engagement.badges : engagement.badges.slice(0, 6);
  }, [engagement, showAllBadges]);
  const initials = useMemo(() => {
    if (!displayName) return '';
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  const handleRestore = async (habitId: string) => {
    if (!userId || restoringId) return;
    setRestoringId(habitId);
    try {
      await habitsApi.updateHabit(userId, habitId, { status: 'ACTIVE' });
      loadHabits();
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setRestoringId(null);
    }
  };

  const handleEnablePush = async () => {
    if (!userId || pushBusy) return;
    setPushBusy(true);
    try {
      const subscription = await ensurePushSubscription();
      await pushApi.register(userId, subscription, navigator.userAgent);
      setPushPermission(getNotificationPermission());
      loadEngagement();
    } catch (error) {
      console.error('Push subscription failed:', error);
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    if (!userId || pushBusy) return;
    setPushBusy(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      const subs = await pushApi.list(userId);
      await Promise.all(subs.map((s) => pushApi.remove(userId, s.id)));
      setPushPermission(getNotificationPermission());
      loadEngagement();
    } catch (error) {
      console.error('Push unsubscription failed:', error);
    } finally {
      setPushBusy(false);
    }
  };

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

  const handleRestartTour = useCallback(() => {
    Object.values(PAGE_TOUR_CONFIG).forEach(c => localStorage.removeItem(c.storageKey));
    navigate('/dashboard');
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLoadingProfile = engagementLoading && !engagement;
  const totalBadgeCount = engagement?.badges?.length ?? 0;
  const hasMoreBadges = totalBadgeCount > 6;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Page header — matches the pattern used by other tabs */}
      <div className="px-5 pt-12 pb-2">
        <p style={TYPOGRAPHY.pageTitle} className="text-foreground">
          Профайл
        </p>
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
                backgroundColor: initials ? 'var(--foreground)' : 'var(--muted)',
                color: initials ? 'var(--background)' : 'var(--muted-foreground)',
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
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            Нээгдсэн амжилтууд
          </p>
          <Card>
            <div className="px-4 py-4">
              {isLoadingProfile ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} height={132} rounded={18} />
                  ))}
                </div>
              ) : engagement?.badges?.length ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
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
                          className="rounded-[18px] p-3 text-left min-h-[128px] flex flex-col"
                          style={{
                            backgroundColor: isSelected ? `${palette.accent}16` : 'var(--card)',
                            border: `1px solid ${isSelected ? `${palette.accent}55` : 'var(--surface-border-soft)'}`,
                            boxShadow: isSelected ? `0 8px 24px ${palette.accent}18` : 'none',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                              style={{
                                backgroundColor: isSelected ? `${palette.accent}24` : `${palette.accent}14`,
                              }}
                            >
                              <EngagementBadgeGlyph badgeCode={badge.badgeCode} />
                            </div>
                            <div
                              className="rounded-full px-2 py-1"
                              style={{
                                backgroundColor: isSelected ? `${palette.accent}1f` : 'var(--surface-muted)',
                              }}
                            >
                              <span
                                style={{
                                  ...TYPOGRAPHY.micro,
                                  color: isSelected ? palette.accent : 'var(--text-muted-soft)',
                                }}
                              >
                                {formatMnMonthDay(badge.awardedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex-1">
                            <p
                              style={{
                                ...TYPOGRAPHY.bodySm,
                                fontWeight: 600,
                                color: 'var(--foreground)',
                              }}
                            >
                              {label}
                            </p>
                            <p
                              style={{
                                ...TYPOGRAPHY.micro,
                                marginTop: 6,
                                color: 'var(--text-muted-soft)',
                              }}
                              className="truncate"
                            >
                              {badge.habitTitle ?? 'Системийн амжилт'}
                            </p>
                          </div>
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
                      {showAllBadges
                        ? 'Жижигрүүлэх'
                        : `Бүгдийг харах (${totalBadgeCount})`}
                      <motion.span
                        animate={{ rotate: showAllBadges ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
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
                              <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 600 }} className="text-foreground">
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
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
        >
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            Харагдац
          </p>
          <Card>
            <div className="p-3 flex gap-2">
              {THEME_OPTIONS.map((option) => {
                const active = theme === option.key;
                return (
                  <motion.button
                    key={option.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(option.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 ${
                      buttonStyles({ variant: active ? 'default' : 'secondary', size: 'default' })
                    }`}
                    style={{
                      border: '1.5px solid transparent',
                      fontSize: 12,
                      fontWeight: active ? 600 : 500,
                      color: active ? undefined : 'var(--foreground)',
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            Архив
          </p>
          <Card>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowArchive((value) => !value)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 ${
                buttonStyles({ variant: 'ghost', size: 'default' })
              }`}
            >
              <div
                className="w-8 h-8 rounded-[12px] flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              >
                <Archive className="w-4 h-4 text-muted-foreground" />
              </div>
              <span
                style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500, flex: 1 }}
                className="text-foreground"
              >
                Архивласан дадлууд
              </span>
              <span
                style={{ ...TYPOGRAPHY.caption, marginRight: 4 }}
                className="text-muted-foreground"
              >
                {archivedCount}
              </span>
              <motion.div animate={{ rotate: showArchive ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showArchive ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}>
                    {archivedHabits.length > 4 ? (
                      <div className="px-4 pt-3 pb-1">
                        <div className="relative">
                          <Search
                            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--text-muted-soft)' }}
                          />
                          <input
                            value={archiveQuery}
                            onChange={(e) => setArchiveQuery(e.target.value)}
                            placeholder="Хайх…"
                            style={{
                              width: '100%',
                              padding: '9px 12px 9px 34px',
                              borderRadius: 12,
                              backgroundColor: 'var(--surface-subtle)',
                              border: '1px solid var(--surface-border-soft)',
                              fontSize: 13,
                              color: 'var(--foreground)',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {archivedHabits.length === 0 ? (
                      <div className="text-center px-4 py-6">
                        <p style={{ ...TYPOGRAPHY.bodySm, marginTop: 6 }} className="text-muted-foreground">
                          Архивласан дадал байхгүй
                        </p>
                      </div>
                    ) : filteredArchivedHabits.length === 0 ? (
                      <div className="text-center px-4 py-6">
                        <p style={TYPOGRAPHY.bodySm} className="text-muted-foreground">
                          “{archiveQuery}” олдсонгүй
                        </p>
                      </div>
                    ) : (
                      <div>
                        {filteredArchivedHabits.map((habit, index) => {
                          const color = getHabitColor(habit.color);
                          const isRestoring = restoringId === habit.id;

                          return (
                            <div key={habit.id}>
                              {index > 0 ? (
                                <div
                                  style={{
                                    height: 0.5,
                                    backgroundColor: 'var(--surface-border-soft)',
                                    marginLeft: 60,
                                  }}
                                />
                              ) : null}
                              <div className="flex items-center gap-3 px-4 py-3">
                                <div
                                  className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: color.btn }}
                                >
                                  <HabitIconSlot iconValue={habit.iconValue} emojiSizePx={20} circlePx={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500 }}
                                    className="text-foreground truncate"
                                  >
                                    {habit.title}
                                  </p>
                                  {habit.archivedAt ? (
                                    <p
                                      style={{ ...TYPOGRAPHY.micro, marginTop: 1 }}
                                      className="text-muted-foreground"
                                    >
                                      {formatMnMonthDay(habit.archivedAt)} архивласан
                                    </p>
                                  ) : null}
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => handleRestore(habit.id)}
                                  disabled={Boolean(restoringId)}
                                  className={`flex items-center gap-1.5 disabled:opacity-50 ${
                                    buttonStyles({ variant: 'accent', size: 'sm' })
                                  }`}
                                  style={{
                                    backgroundColor: color.btn,
                                    border: `1px solid ${color.accent}30`,
                                  }}
                                >
                                  {isRestoring ? (
                                    <Spinner size={12} color={color.accent} />
                                  ) : (
                                    <RotateCcw className="w-3 h-3" style={{ color: color.accent }} />
                                  )}
                                  <span
                                    style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: color.accent }}
                                  >
                                    {isRestoring ? 'Сэргээж байна…' : 'Сэргээх'}
                                  </span>
                                </motion.button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
        >
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            Байршил
          </p>
          <Card>
            <div className="px-4 py-4">
              <LocationSelector />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            Судалгаа
          </p>
          <Card>
            <div className="px-4 py-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 600 }} className="text-foreground">
                    Судалгаанд оролцоорой
                  </p>
                  <p style={{ ...TYPOGRAPHY.micro, marginTop: 4 }} className="text-muted-foreground">
                    Энэхүү аппыг сайжруулахад таны санал хэрэгтэй байнаа ^^. 2-3 минут л хангалттай. Баярлалаа
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSeqU77MUs0L-7RUtyu4QjqWpDrWZfI2R8qyANKvuRnvjt44YQ/viewform', '_blank', 'noopener,noreferrer')}
                className={`w-full flex items-center justify-center gap-2 ${buttonStyles({ variant: 'default', size: 'default' })}`}
                style={{ backgroundColor: 'var(--primary)', fontWeight: 600, fontSize: 13, color: 'var(--primary-foreground)' }}
              >
                Судалгаа бөглөх
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </motion.button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
        >
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            Цэс
          </p>
          <Card>
            <PushToggleRow
              permission={pushPermission}
              busy={pushBusy}
              subscriptionCount={engagement?.subscriptionCount ?? 0}
              onEnable={handleEnablePush}
              onDisable={handleDisablePush}
            />
            <Divider />
            <MenuItem
              icon={<Bell className="w-4 h-4 text-muted-foreground" />}
              label="Сануулгууд"
              onClick={() => navigate('/reminders')}
            />
            <Divider />
            <MenuItem
              icon={<User className="w-4 h-4 text-muted-foreground" />}
              label="Профайл засах"
              badge="Удахгүй"
              disabled
            />
            <Divider />
            <MenuItem
              icon={<KeyRound className="w-4 h-4 text-muted-foreground" />}
              label="Нууц үг солих"
              onClick={() => setShowChangePassword(true)}
            />
            <Divider />
            <MenuItem
              icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
              label="Санал хүсэлт"
              onClick={() => setShowFeedback(true)}
            />
            <Divider />
            <MenuItem
              icon={<BookOpen className="w-4 h-4 text-muted-foreground" />}
              label="Заавар дахин харах"
              onClick={handleRestartTour}
            />
            <Divider />
            <MenuItem
              icon={<Shield className="w-4 h-4 text-muted-foreground" />}
              label="Нууцлал"
              badge="Удахгүй"
              disabled
            />
            <Divider />
            <MenuItem
              icon={<HelpCircle className="w-4 h-4 text-muted-foreground" />}
              label="Тусламж"
              badge="Удахгүй"
              disabled
            />
            <Divider />
            <MenuItem
              icon={<Info className="w-4 h-4 text-muted-foreground" />}
              label="Хувилбар"
              value={APP_VERSION}
            />
            <Divider />
            <MenuItem
              icon={<LogOut className="w-4 h-4 text-muted-foreground" />}
              label="Гарах"
              onClick={() => setShowLogoutConfirm(true)}
            />
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {showLogoutConfirm ? (
          <ConfirmDialog
            title="Гарах уу?"
            description={
              <>
                Та профайлаасаа гарах гэж байна.
                <br />
                Дараа нь дахин нэвтрэх шаардлагатай.
              </>
            }
            confirmLabel="Тийм, гарах"
            cancelLabel="Болих"
            onConfirm={() => {
              setShowLogoutConfirm(false);
              handleLogout();
            }}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showChangePassword ? (
          <ChangePasswordDialog onClose={() => setShowChangePassword(false)} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback ? (
          <FeedbackDialog onClose={() => setShowFeedback(false)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
