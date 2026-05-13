import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Archive,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Info,
  KeyRound,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Sun,
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
import { useTheme, setTheme } from '@/lib/theme-store';
import type { ThemeMode } from '@/lib/theme-store';
import { getHabitColor } from '@/lib/habit-colors';
import { ensurePushSubscription, getNotificationPermission } from '@/lib/push';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';
import type { Habit } from '@/api/types';

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { key: 'light', label: 'Цайвар', icon: <Sun className="w-3.5 h-3.5" /> },
  { key: 'dark', label: 'Бараан', icon: <Moon className="w-3.5 h-3.5" /> },
  { key: 'system', label: 'Систем', icon: <Monitor className="w-3.5 h-3.5" /> },
];

const APP_VERSION = `v${__APP_VERSION__}`;

function formatMnMonthDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}-р сар ${date.getDate()}`;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-card overflow-hidden" style={{ boxShadow: SHADOW.card }}>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ height: 0.5, backgroundColor: 'var(--surface-border-soft)', marginLeft: 60 }} />
  );
}

function MenuItem({
  icon, label, subtitle, value, badge, onClick, danger, disabled,
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
        <p className="text-foreground" style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500, color: danger ? '#ef4444' : undefined }}>
          {label}
        </p>
        {subtitle ? (
          <p className="text-muted-foreground mt-0.5" style={TYPOGRAPHY.micro}>{subtitle}</p>
        ) : null}
      </div>
      {badge ? (
        <span className="shrink-0 rounded-full px-2 py-0.5" style={{ ...TYPOGRAPHY.micro, fontSize: 10.5, backgroundColor: 'var(--surface-muted)', color: 'var(--text-muted-soft)' }}>
          {badge}
        </span>
      ) : null}
      {value ? (
        <span className="text-muted-foreground shrink-0 text-right max-w-[128px] truncate" style={TYPOGRAPHY.caption} title={value}>
          {value}
        </span>
      ) : null}
      {interactive && !danger ? (
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-disabled)' }} />
      ) : null}
    </motion.button>
  );
}

function PushToggleRow({
  permission, busy, subscriptionCount, onEnable, onDisable,
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
        <Bell className="w-4 h-4" style={{ color: isOn ? 'var(--primary)' : 'var(--muted-foreground)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground" style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500 }}>Сануулга</p>
        <p className="text-muted-foreground mt-0.5" style={TYPOGRAPHY.micro}>
          {isDenied ? 'Браузерийн тохиргооноос зөвшөөрнө үү' : isOn ? `${subscriptionCount} төхөөрөмж идэвхтэй` : 'Цагтаа сануулга хүлээн авах'}
        </p>
      </div>
      <motion.button
        whileTap={isDenied || busy ? undefined : { scale: 0.92 }}
        onClick={handleToggle}
        disabled={isDenied || busy}
        className="shrink-0"
        style={{ opacity: isDenied ? 0.4 : 1 }}
      >
        <div className="relative rounded-full transition-colors duration-200" style={{ width: 48, height: 28, backgroundColor: isOn ? 'var(--primary)' : 'var(--surface-strong)' }}>
          {busy ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-t-transparent" style={{ borderColor: isOn ? '#fff' : 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <motion.div className="absolute top-1 rounded-full bg-white" style={{ width: 20, height: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} animate={{ left: isOn ? 24 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
          )}
        </div>
      </motion.button>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { userId, logout } = useAuth();
  const [theme] = useTheme();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [engagementSubCount, setEngagementSubCount] = useState(0);

  const [showArchive, setShowArchive] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const [pushPermission, setPushPermission] = useState(getNotificationPermission());
  const [pushBusy, setPushBusy] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadHabits = useCallback(() => {
    if (!userId) return;
    setHabitsLoading(true);
    habitsApi.list(userId, true).then(setHabits).catch(console.error).finally(() => setHabitsLoading(false));
  }, [userId]);

  const loadEngagement = useCallback(() => {
    if (!userId) return;
    engagementApi.getSummary(userId).then((s) => setEngagementSubCount(s.subscriptionCount)).catch(console.error);
  }, [userId]);

  useEffect(() => {
    loadHabits();
    loadEngagement();
    setPushPermission(getNotificationPermission());
  }, [loadHabits, loadEngagement]);

  const archivedHabits = useMemo(() => habits.filter((h) => h.status === 'ARCHIVED'), [habits]);
  const archivedCount = archivedHabits.length;
  const filteredArchivedHabits = useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    if (!q) return archivedHabits;
    return archivedHabits.filter((h) => h.title.toLowerCase().includes(q));
  }, [archivedHabits, archiveQuery]);

  const handleRestore = async (habitId: string) => {
    if (!userId || restoringId) return;
    setRestoringId(habitId);
    try {
      await habitsApi.updateHabit(userId, habitId, { status: 'ACTIVE' });
      loadHabits();
    } catch (err) {
      console.error('Restore failed:', err);
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
    } catch (err) {
      console.error('Push subscription failed:', err);
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
    } catch (err) {
      console.error('Push unsubscription failed:', err);
    } finally {
      setPushBusy(false);
    }
  };

  const handleRestartTour = useCallback(() => {
    Object.values(PAGE_TOUR_CONFIG).forEach((c) => localStorage.removeItem(c.storageKey));
    navigate('/dashboard');
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="px-5 pt-12 pb-2 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-[18px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
          aria-label="Буцах"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <p style={TYPOGRAPHY.pageTitle} className="text-foreground">
          Тохиргоо
        </p>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-5">

        {/* Ерөнхий */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">Ерөнхий</p>
          <Card>
            <div className="px-3 pt-3 pb-2">
              <p style={{ ...TYPOGRAPHY.micro, marginBottom: 8, paddingLeft: 4 }} className="text-muted-foreground">Харагдац</p>
              <div className="flex gap-2">
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
                      style={{ border: '1.5px solid transparent', fontSize: 12, fontWeight: active ? 600 : 500, color: active ? undefined : 'var(--foreground)' }}
                    >
                      {option.icon}
                      {option.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <Divider />
            <PushToggleRow
              permission={pushPermission}
              busy={pushBusy}
              subscriptionCount={engagementSubCount}
              onEnable={handleEnablePush}
              onDisable={handleDisablePush}
            />
          </Card>
        </motion.div>

        {/* Дадлууд */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">Дадлууд</p>
          <Card>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowArchive((v) => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 ${buttonStyles({ variant: 'ghost', size: 'default' })}`}
            >
              <div className="w-8 h-8 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <Archive className="w-4 h-4 text-muted-foreground" />
              </div>
              <span style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500, flex: 1 }} className="text-foreground text-left">
                Архивласан дадлууд
              </span>
              <span style={{ ...TYPOGRAPHY.caption, marginRight: 4 }} className="text-muted-foreground">
                {habitsLoading ? '—' : archivedCount}
              </span>
              <motion.div animate={{ rotate: showArchive ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {showArchive ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <div style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}>
                    {archivedHabits.length > 4 ? (
                      <div className="px-4 pt-3 pb-1">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted-soft)' }} />
                          <input value={archiveQuery} onChange={(e) => setArchiveQuery(e.target.value)} placeholder="Хайх…"
                            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 12, backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--surface-border-soft)', fontSize: 13, color: 'var(--foreground)', outline: 'none' }}
                          />
                        </div>
                      </div>
                    ) : null}
                    {archivedHabits.length === 0 ? (
                      <div className="text-center px-4 py-6">
                        <p style={{ ...TYPOGRAPHY.bodySm, marginTop: 6 }} className="text-muted-foreground">Архивласан дадал байхгүй</p>
                      </div>
                    ) : filteredArchivedHabits.length === 0 ? (
                      <div className="text-center px-4 py-6">
                        <p style={TYPOGRAPHY.bodySm} className="text-muted-foreground">"{archiveQuery}" олдсонгүй</p>
                      </div>
                    ) : (
                      <div>
                        {filteredArchivedHabits.map((habit, index) => {
                          const color = getHabitColor(habit.color);
                          const isRestoring = restoringId === habit.id;
                          return (
                            <div key={habit.id}>
                              {index > 0 ? <div style={{ height: 0.5, backgroundColor: 'var(--surface-border-soft)', marginLeft: 60 }} /> : null}
                              <div className="flex items-center gap-3 px-4 py-3">
                                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0" style={{ backgroundColor: color.btn }}>
                                  <HabitIconSlot iconValue={habit.iconValue} emojiSizePx={20} circlePx={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500 }} className="text-foreground truncate">{habit.title}</p>
                                  {habit.archivedAt ? (
                                    <p style={{ ...TYPOGRAPHY.micro, marginTop: 1 }} className="text-muted-foreground">{formatMnMonthDay(habit.archivedAt)} архивласан</p>
                                  ) : null}
                                </div>
                                <motion.button whileTap={{ scale: 0.92 }} onClick={() => handleRestore(habit.id)} disabled={Boolean(restoringId)}
                                  className={`flex items-center gap-1.5 disabled:opacity-50 ${buttonStyles({ variant: 'accent', size: 'sm' })}`}
                                  style={{ backgroundColor: color.btn, border: `1px solid ${color.accent}30` }}
                                >
                                  {isRestoring ? <Spinner size={12} color={color.accent} /> : <RotateCcw className="w-3 h-3" style={{ color: color.accent }} />}
                                  <span style={{ ...TYPOGRAPHY.caption, fontWeight: 600, color: color.accent }}>{isRestoring ? 'Сэргээж байна…' : 'Сэргээх'}</span>
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

        {/* Сануулга */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">Сануулга</p>
          <Card>
            <div className="px-4 py-3.5">
              <p style={{ ...TYPOGRAPHY.micro, marginBottom: 8 }} className="text-muted-foreground">Байршил</p>
              <LocationSelector />
            </div>
            <Divider />
            <MenuItem
              icon={<SlidersHorizontal className="w-4 h-4 text-muted-foreground" />}
              label="Дохионы тохиргоо"
              subtitle="Дадлын дохио, trigger тохиргоо"
              badge="Удахгүй"
              disabled
            />
          </Card>
        </motion.div>

        {/* Дэмжлэг */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">Дэмжлэг</p>
          <Card>
            <MenuItem icon={<BookOpen className="w-4 h-4 text-muted-foreground" />} label="Заавар дахин харах" onClick={handleRestartTour} />
            <Divider />
            <MenuItem icon={<HelpCircle className="w-4 h-4 text-muted-foreground" />} label="Тусламж" badge="Удахгүй" disabled />
            <Divider />
            <MenuItem icon={<Shield className="w-4 h-4 text-muted-foreground" />} label="Нууцлал" badge="Удахгүй" disabled />
          </Card>
        </motion.div>

        {/* Тухай */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">Тухай</p>
          <Card>
            <MenuItem icon={<Info className="w-4 h-4 text-muted-foreground" />} label="Хувилбар" value={APP_VERSION} />
            <Divider />
            <MenuItem icon={<FileText className="w-4 h-4 text-muted-foreground" />} label="Үйлчилгээний нөхцөл" badge="Удахгүй" disabled />
          </Card>
        </motion.div>

        {/* Данс */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <p style={TYPOGRAPHY.groupLabel} className="text-muted-foreground mb-2 pl-0.5">Данс</p>
          <Card>
            <MenuItem icon={<KeyRound className="w-4 h-4 text-muted-foreground" />} label="Нууц үг солих" onClick={() => setShowChangePassword(true)} />
            <Divider />
            <MenuItem icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />} label="Санал хүсэлт" onClick={() => setShowFeedback(true)} />
            <Divider />
            <MenuItem icon={<LogOut className="w-4 h-4 text-muted-foreground" />} label="Гарах" onClick={() => setShowLogoutConfirm(true)} />
          </Card>
        </motion.div>

      </div>

      <AnimatePresence>
        {showLogoutConfirm ? (
          <ConfirmDialog
            title="Гарах уу?"
            description={<>Та профайлаасаа гарах гэж байна.<br />Дараа нь дахин нэвтрэх шаардлагатай.</>}
            confirmLabel="Тийм, гарах"
            cancelLabel="Болих"
            onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {showChangePassword ? <ChangePasswordDialog onClose={() => setShowChangePassword(false)} /> : null}
      </AnimatePresence>
      <AnimatePresence>
        {showFeedback ? <FeedbackDialog onClose={() => setShowFeedback(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}
