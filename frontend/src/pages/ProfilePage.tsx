import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Archive,
  Bell,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  Share2,
  Shield,
  Sun,
  Trophy,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import { engagementApi } from '@/api/engagement';
import { authApi } from '@/api/auth';
import { pushApi } from '@/api/push';
import { LocationSelector } from '@/components/LocationSelector';
import { useLang, setLang } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
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

const LANG_OPTIONS: { key: Lang; label: string; flag: string }[] = [
  { key: 'mn', label: 'Монгол', flag: 'MN' },
  { key: 'en', label: 'English', flag: 'EN' },
];

const BADGE_LABELS: Record<string, string> = {
  FIRST_DONE: 'Анхны амжилт',
  STREAK_7: '7 өдрийн дараалал',
  STREAK_21: '21 өдрийн дараалал',
  TOTAL_30: '30 удаагийн гүйцэтгэл',
};

const BADGE_ICONS: Record<string, string> = {
  FIRST_DONE: '🥇',
  STREAK_7: '🔥',
  STREAK_21: '⚡',
  TOTAL_30: '🏆',
};

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
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${
        buttonStyles({ variant: danger ? 'destructive' : 'ghost', size: 'default' })
      }`}
    >
      <div
        className="w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: danger ? '#ef444415' : 'rgba(0,0,0,0.05)' }}
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
      {value ? (
        <span
          className="text-muted-foreground shrink-0 text-right max-w-[128px] truncate"
          style={TYPOGRAPHY.caption}
          title={value}
        >
          {value}
        </span>
      ) : null}
      {onClick && !danger ? (
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
        style={{ backgroundColor: isOn ? 'var(--primary-translucent, rgba(var(--primary-rgb,99,102,241),0.12))' : 'rgba(0,0,0,0.05)' }}
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
  const lang = useLang();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [engagement, setEngagement] = useState<EngagementSummary | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState(getNotificationPermission());
  const [pushBusy, setPushBusy] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [shareBusyId, setShareBusyId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState(false);

  const loadHabits = () => {
    if (!userId) return;
    habitsApi.list(userId, true).then(setHabits).catch(console.error);
  };

  const loadEngagement = () => {
    if (!userId) return;
    engagementApi.getSummary(userId).then(setEngagement).catch(console.error);
  };

  useEffect(() => {
    loadHabits();
    loadEngagement();
    setPushPermission(getNotificationPermission());
  }, [userId]);

  useEffect(() => {
    if (selectedBadgeId && !engagement?.badges.some((badge) => badge.id === selectedBadgeId)) {
      setSelectedBadgeId(null);
      setShareStatus(null);
    }
  }, [engagement, selectedBadgeId]);

  const activeCount = habits.filter((habit) => habit.status === 'ACTIVE').length;
  const archivedHabits = habits.filter((habit) => habit.status === 'ARCHIVED');
  const archivedCount = archivedHabits.length;
  const selectedBadge = selectedBadgeId
    ? engagement?.badges.find((badge) => badge.id === selectedBadgeId) ?? null
    : null;

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
    const badgeIcon = BADGE_ICONS[badge.badgeCode] ?? '🏅';
    const color = getHabitColor(badge.habitColor);
    setShareBusyId(badge.id);
    setShareStatus(null);
    try {
      const result = await shareAchievement({
        title: badgeLabel,
        subtitle: badge.habitTitle
          ? `${badge.habitTitle} дадал дээр шинэ амжилт нээгдлээ.`
          : 'Шинэ амжилт нээгдлээ.',
        accentColor: color.accent,
        badgeIcon,
        badgeLabel,
        xpLabel: engagement ? `${engagement.totalXp} XP` : null,
        text: badge.habitTitle
          ? `${badge.habitTitle} дадал дээр ${badgeLabel} амжилтыг нээлээ.`
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setCpError('');
    if (cpNew !== cpConfirm) { setCpError('Шинэ нууц үг таарахгүй байна.'); return; }
    if (cpNew.length < 8) { setCpError('Нууц үг хамгийн багадаа 8 тэмдэгт байна.'); return; }
    setCpLoading(true);
    try {
      await authApi.changePassword(userId, cpCurrent, cpNew);
      setCpSuccess(true);
      setCpCurrent(''); setCpNew(''); setCpConfirm('');
      setTimeout(() => { setShowChangePassword(false); setCpSuccess(false); }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setCpError(err?.message || 'Нууц үг солиход алдаа гарлаа.');
    } finally {
      setCpLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* <div
        className="sticky top-0 z-20 bg-background"
        style={{ borderBottom: '1px solid var(--surface-border-faint)' }}
      >
        <div className="flex items-center gap-3 px-5 pt-13 pb-3">
          <p style={TYPOGRAPHY.pageTitle} className="text-foreground">
            Профайл
          </p>
        </div>
      </div> */}

      <div className="px-5 pt-12 flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-5 bg-card"
          style={{ boxShadow: SHADOW.card }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <User className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div className="min-w-0">
              <p style={TYPOGRAPHY.pageTitle} className="text-foreground truncate">
                {displayName || 'Хэрэглэгч'}
              </p>
              <p style={TYPOGRAPHY.caption} className="text-muted-foreground mt-1">
                {engagement?.unlockedBadgeCount ?? 0} амжилт · {engagement?.totalXp ?? 0} XP
              </p>
            </div>
          </div>
          <div
            className="flex justify-center gap-6 pt-4"
            style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}
          >
            <div className="text-center">
              <p style={TYPOGRAPHY.statLg} className="text-foreground">
                {activeCount}
              </p>
              <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                Идэвхтэй
              </p>
            </div>
            <div style={{ width: 1, backgroundColor: 'var(--surface-border-soft)' }} />
            <div className="text-center">
              <p style={TYPOGRAPHY.statLg} className="text-foreground">
                {archivedCount}
              </p>
              <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                Архив
              </p>
            </div>
            <div style={{ width: 1, backgroundColor: 'var(--surface-border-soft)' }} />
            <div className="text-center">
              <p style={TYPOGRAPHY.statLg} className="text-foreground">
                {engagement?.totalXp ?? 0}
              </p>
              <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                XP
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            АМЖИЛТ
          </p>
          <Card>
            <MenuItem
              icon={<Trophy className="w-4 h-4 text-muted-foreground" />}
              label="Нийт XP"
              subtitle="Дадал хийж цуглуулсан нийт оноо"
              value={`${engagement?.totalXp ?? 0}`}
            />
            <Divider />
            <PushToggleRow
              permission={pushPermission}
              busy={pushBusy}
              subscriptionCount={engagement?.subscriptionCount ?? 0}
              onEnable={handleEnablePush}
              onDisable={handleDisablePush}
            />
            <Divider />
            <div className="px-4 py-3.5">
              <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2.5">
                НЭЭГДСЭН АМЖИЛТУУД
              </p>
              {engagement?.badges?.length ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    {engagement.badges.slice(0, 6).map((badge) => {
                      const isSelected = selectedBadgeId === badge.id;
                      const label = BADGE_LABELS[badge.badgeCode] ?? badge.badgeCode;
                      const icon = BADGE_ICONS[badge.badgeCode] ?? '🏅';
                      const palette = getHabitColor(badge.habitColor);

                      return (
                        <motion.button
                          key={badge.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShareStatus(null);
                            setSelectedBadgeId(isSelected ? null : badge.id);
                          }}
                          className="rounded-[18px] p-3 text-left min-h-[132px] flex flex-col"
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
                              <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
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
                            >
                              {badge.habitTitle ? `${badge.habitTitle} дадал` : 'Системийн амжилт'}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span style={TYPOGRAPHY.micro} className="text-muted-foreground">
                              {isSelected ? 'Сонгогдсон' : 'Сонгох'}
                            </span>
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: isSelected ? palette.accent : 'var(--surface-muted)',
                                color: isSelected ? '#fff' : 'var(--text-muted-soft)',
                              }}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedBadge && (() => {
                      const label = BADGE_LABELS[selectedBadge.badgeCode] ?? selectedBadge.badgeCode;
                      const icon = BADGE_ICONS[selectedBadge.badgeCode] ?? '🏅';
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
                              <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 600 }} className="text-foreground">
                                {label}
                              </p>
                              <p style={TYPOGRAPHY.bodySm} className="text-muted-foreground mt-1">
                                {selectedBadge.habitTitle
                                  ? `${selectedBadge.habitTitle} дадал дээр нээгдсэн.`
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
                              <Share2 className="w-4 h-4" />
                              <span style={{ ...TYPOGRAPHY.bodySm, fontWeight: 600 }}>
                                {shareBusyId === selectedBadge.id ? 'Бэлтгэж байна...' : 'Хуваалцах'}
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
            ХАРАГДАЦ
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
          transition={{ delay: 0.07 }}
        >
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            ХЭЛ
          </p>
          <Card>
            <div className="p-3 flex gap-2">
              {LANG_OPTIONS.map((option) => {
                const active = lang === option.key;
                return (
                  <motion.button
                    key={option.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLang(option.key)}
                    className={`flex-1 flex items-center justify-center gap-2 ${
                      buttonStyles({ variant: active ? 'default' : 'secondary', size: 'default' })
                    }`}
                    style={{
                      border: '1.5px solid transparent',
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <span>{option.flag}</span>
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
            АРХИВ
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
                  {archivedHabits.length === 0 ? (
                    <div className="text-center px-4 py-6">
                      <p style={{ ...TYPOGRAPHY.bodySm, marginTop: 6 }} className="text-muted-foreground">
                        Архивласан дадал байхгүй
                      </p>
                    </div>
                  ) : (
                    <div style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}>
                      {archivedHabits.map((habit, index) => {
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
                                <span style={{ fontSize: 20 }}>{habit.iconValue || '📦'}</span>
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
                                <RotateCcw className="w-3 h-3" style={{ color: color.accent }} />
                                <span
                                  style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: color.accent }}
                                >
                                  {isRestoring ? '...' : 'Сэргээх'}
                                </span>
                              </motion.button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
            БАЙРШИЛ
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
          transition={{ delay: 0.13 }}
        >
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">
            ЦЭС
          </p>
          <Card>
            <MenuItem
              icon={<Bell className="w-4 h-4 text-muted-foreground" />}
              label="Мэдэгдэл"
              onClick={() => navigate('/reminders')}
            />
            <Divider />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowChangePassword(v => !v); setCpError(''); setCpSuccess(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${buttonStyles({ variant: 'ghost', size: 'default' })}`}
            >
              <div className="w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                <KeyRound className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground" style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500 }}>Нууц үг солих</p>
              </div>
              <motion.div animate={{ rotate: showChangePassword ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-disabled)' }} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showChangePassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1" style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}>
                    {cpSuccess ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-3 text-center">
                        <p style={{ ...TYPOGRAPHY.bodySm, color: '#22c55e', fontWeight: 600 }}>✓ Нууц үг амжилттай солигдлоо</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleChangePassword} className="flex flex-col gap-3 pt-3">
                        {cpError && (
                          <p style={{ ...TYPOGRAPHY.caption, color: 'var(--destructive, #ef4444)' }}>{cpError}</p>
                        )}
                        {/* Current password */}
                        <div className="relative">
                          <input
                            type={cpShowCurrent ? 'text' : 'password'}
                            value={cpCurrent}
                            onChange={e => setCpCurrent(e.target.value)}
                            placeholder="Одоогийн нууц үг"
                            required
                            autoComplete="current-password"
                            style={{
                              width: '100%', padding: '11px 40px 11px 14px',
                              borderRadius: 12, backgroundColor: 'var(--surface-muted)',
                              border: '1.5px solid var(--surface-border-soft)',
                              fontSize: 14, color: 'var(--foreground)', fontFamily: "'Inter', sans-serif", outline: 'none',
                            }}
                          />
                          <button type="button" onClick={() => setCpShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted-soft)', lineHeight: 0 }}>
                            {cpShowCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* New password */}
                        <div className="relative">
                          <input
                            type={cpShowNew ? 'text' : 'password'}
                            value={cpNew}
                            onChange={e => setCpNew(e.target.value)}
                            placeholder="Шинэ нууц үг (8+ тэмдэгт)"
                            required
                            autoComplete="new-password"
                            style={{
                              width: '100%', padding: '11px 40px 11px 14px',
                              borderRadius: 12, backgroundColor: 'var(--surface-muted)',
                              border: '1.5px solid var(--surface-border-soft)',
                              fontSize: 14, color: 'var(--foreground)', fontFamily: "'Inter', sans-serif", outline: 'none',
                            }}
                          />
                          <button type="button" onClick={() => setCpShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted-soft)', lineHeight: 0 }}>
                            {cpShowNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Confirm */}
                        <input
                          type="password"
                          value={cpConfirm}
                          onChange={e => setCpConfirm(e.target.value)}
                          placeholder="Шинэ нууц үгийг давтах"
                          required
                          autoComplete="new-password"
                          style={{
                            width: '100%', padding: '11px 14px',
                            borderRadius: 12, backgroundColor: 'var(--surface-muted)',
                            border: '1.5px solid var(--surface-border-soft)',
                            fontSize: 14, color: 'var(--foreground)', fontFamily: "'Inter', sans-serif", outline: 'none',
                          }}
                        />
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          disabled={cpLoading}
                          className={`w-full ${buttonStyles({ variant: 'default', size: 'default' })}`}
                          style={{ fontSize: 14, fontWeight: 600, opacity: cpLoading ? 0.7 : 1 }}
                        >
                          {cpLoading ? '...' : 'Хадгалах'}
                        </motion.button>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Divider />
            <MenuItem icon={<Shield className="w-4 h-4 text-muted-foreground" />} label="Нууцлал" />
            <Divider />
            <MenuItem icon={<HelpCircle className="w-4 h-4 text-muted-foreground" />} label="Тусламж" />
            <Divider />
            <MenuItem
              icon={<Info className="w-4 h-4 text-muted-foreground" />}
              label="Хувилбар"
              value="v1.0.0"
            />
            <Divider />
            <MenuItem
              icon={<LogOut className="w-4 h-4 text-muted-foreground" />}
              label="Гарах"
              onClick={handleLogout}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
