import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, BellOff, Clock, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { remindersApi, type Reminder } from '@/api/reminders';
import { TYPOGRAPHY, SHADOW, buttonStyles } from '@/shared/design';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

function ReminderCard({ reminder, delay }: { reminder: Reminder; delay: number }) {
  const { userId } = useAuth();
  const [responded, setResponded] = useState(reminder.status === 'ACTED' || reminder.status === 'EXPIRED' || reminder.status === 'CANCELLED');
  const [saving, setSaving] = useState(false);

  const handleAction = async (action: 'DONE' | 'SNOOZE') => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      await remindersApi.submitAction(userId, reminder.id, action, action === 'SNOOZE' ? 5 : undefined);
      setResponded(true);
    } catch (err) { console.error('Reminder action failed:', err); }
    finally { setSaving(false); }
  };

  const statusColor =
    reminder.status === 'ACTED' ? '#22c55e' :
    reminder.status === 'SENT' ? '#8B7EC8' :
    reminder.status === 'CANCELLED' ? '#ef4444' :
    reminder.status === 'EXPIRED' ? '#9ca3af' : '#8B7EC8';

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
            Сануулга
          </p>
          {reminder.decisionReason && (
            <p style={{ ...TYPOGRAPHY.caption, lineHeight: 1.5, color: 'var(--text-muted-soft)', marginBottom: 4 }}>{reminder.decisionReason}</p>
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

      {!responded && (reminder.status === 'PENDING' || reminder.status === 'SENT') && (
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '0.5px solid var(--surface-border-soft)' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('DONE')} disabled={saving}
            className={`flex-1 ${buttonStyles({ variant: 'accent', size: 'default' })}`}
            style={{ backgroundColor: '#22c55e18' }}>
            <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} strokeWidth={2.5} />
            <span style={{ ...TYPOGRAPHY.caption, color: '#22c55e' }}>Хийлээ</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('SNOOZE')} disabled={saving}
            className={`flex-1 ${buttonStyles({ variant: 'accent', size: 'default' })}`}
            style={{ backgroundColor: '#f59e0b18' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            <span style={{ ...TYPOGRAPHY.caption, color: '#f59e0b' }}>5 мин</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export function RemindersPage() {
  const { userId } = useAuth();
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
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid var(--surface-border-faint)' }}>
        <div className="flex items-center gap-3 px-5 pt-13 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-primary" />
            <p style={TYPOGRAPHY.pageTitle} className="text-foreground">Сануулга</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-7 h-7 rounded-full border-2 border-t-transparent border-primary" />
          </div>
        ) : reminders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reminders.map((r, i) => <ReminderCard key={r.id} reminder={r} delay={i * 0.04} />)}
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
