import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, BellOff, ChevronLeft, Clock, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useHabitLogs } from '@/context/HabitLogsContext';
import { remindersApi, type Reminder } from '@/api/reminders';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';

// v1 displays reminder times in Asia/Ulaanbaatar regardless of the viewer's
// device locale. Future per-user timezone support can read this from the
// authenticated user instead of hard-coding the constant.
const APP_TIMEZONE = 'Asia/Ulaanbaatar';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TIMEZONE,
  });
}

function ReminderCard({
  reminder,
  delay,
  isAlreadyDone,
  onActionDone,
}: {
  reminder: Reminder;
  delay: number;
  /** True when the habit has already been logged today (via Dashboard or another reminder). */
  isAlreadyDone: boolean;
  onActionDone: () => void;
}) {
  const { userId } = useAuth();
  const [responded, setResponded] = useState(reminder.status === 'ACTED' || reminder.status === 'EXPIRED' || reminder.status === 'CANCELLED');
  const [saving, setSaving] = useState(false);

  const handleAction = async (action: 'DONE' | 'SNOOZE') => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      await remindersApi.submitAction(userId, reminder.id, action, action === 'SNOOZE' ? 5 : undefined);
      setResponded(true);
      if (action === 'DONE') onActionDone();
    } catch (err) { console.error('Reminder action failed:', err); }
    finally { setSaving(false); }
  };

  const statusColor =
    reminder.status === 'ACTED' ? 'var(--text-primary)' :
    reminder.status === 'SENT' ? 'var(--text-primary)' :
    reminder.status === 'CANCELLED' ? 'var(--text-primary)' :
    reminder.status === 'EXPIRED' ? 'var(--text-primary)' : 'var(--text-primary)';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[18px] p-4 bg-card"
      style={{ boxShadow: SHADOW.card }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: statusColor + '18' }}>
          <Bell className="w-4 h-4" style={{ color: statusColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ ...TYPOGRAPHY.sectionTitle, fontWeight: 500, marginBottom: 3 }} className="text-foreground">
            {reminder.explanation?.contentParts?.habit ?? 'Сануулга'}
          </p>
          {reminder.explanation?.body && (
            <p style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.5, color: 'var(--text-muted-soft)', marginBottom: 4 }}>
              {reminder.explanation.body}
            </p>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" style={{ color: 'var(--text-placeholder)' }} />
            <span style={{ ...TYPOGRAPHY.micro, color: 'var(--text-faint)' }}>
              {formatTime(reminder.scheduledFor)}
            </span>
            {reminder.status !== 'PENDING' && reminder.status !== 'SENT' && (
              <span className="ml-2 px-2 py-0.5 rounded-full" style={{
                ...TYPOGRAPHY.micro, fontSize: 10, color: statusColor,
                backgroundColor: statusColor + '15',
              }}>
                {reminder.status === 'ACTED' ? 'Дууссан' :
                 reminder.status === 'CANCELLED' ? 'Цуцлагдсан' : 'Хугацаа дууссан'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Already logged today via Dashboard — show a "done" badge instead of action buttons */}
      {isAlreadyDone && !responded && (
        <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#22c55e20' }}>
            <Check className="w-3 h-3" style={{ color: 'var(--text-primary)' }} strokeWidth={2.5} />
          </div>
          <span style={{ ...TYPOGRAPHY.caption, color: 'var(--text-primary)' }}>Өнөөдөр бүртгэгдсэн</span>
        </div>
      )}

      {!responded && !isAlreadyDone && (reminder.status === 'PENDING' || reminder.status === 'SENT') && (
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('DONE')} disabled={saving}
            className={`flex-1 ${buttonStyles({ variant: 'accent', size: 'default' })}`}
            style={{ backgroundColor: 'var(--text-primary)18' }}>
            <Check className="w-3.5 h-3.5" style={{ color: 'var(--text-primary)' }} strokeWidth={2.5} />
            <span style={{ ...TYPOGRAPHY.caption, color: 'var(--text-primary)' }}>Хийсэн</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('SNOOZE')} disabled={saving}
            className={`flex-1 ${buttonStyles({ variant: 'accent', size: 'default' })}`}
            style={{ backgroundColor: 'var(--text-primary)18' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-primary)' }} />
            <span style={{ ...TYPOGRAPHY.caption, color: 'var(--text-primary)' }}>5 мин хойшлуулах</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export function RemindersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();
  const { todayLogMap, refresh: refreshSharedLogs } = useHabitLogs();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    remindersApi.list(userId)
      .then(setReminders)
      .catch(err => console.error('Failed to load reminders:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-12 pb-2 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => location.key === 'default' ? navigate('/profile') : navigate(-1)}
          className="w-9 h-9 rounded-[18px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
          aria-label="Буцах"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <p style={TYPOGRAPHY.pageTitle} className="text-foreground">Сануулга</p>
      </div>

      <div className="px-5 pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-7 h-7 rounded-full border-2 border-t-transparent border-primary" />
          </div>
        ) : reminders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reminders.map((r, i) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                delay={i * 0.04}
                isAlreadyDone={todayLogMap.get(r.habitId)?.status === 'done'}
                onActionDone={refreshSharedLogs}
              />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface-muted)' }}>
              <BellOff className="w-8 h-8" style={{ color: 'var(--text-disabled)' }} />
            </div>
            <p style={{ ...TYPOGRAPHY.cardTitle, marginTop: 16, fontWeight: 500 }} className="text-foreground">
              Сануулга байхгүй
            </p>
            <p style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6, marginTop: 6 }} className="text-muted-foreground">
              Дадал дээрээ сануулга идэвхжүүлснээр<br />энд харагдах болно.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
