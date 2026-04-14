import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, BellOff, Clock, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { remindersApi, type Reminder } from '@/api/reminders';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

function ReminderCard({ reminder, delay }: { reminder: Reminder; delay: number }) {
  const { userId } = useAuth();
  const [responded, setResponded] = useState(reminder.status !== 'PENDING');
  const [saving, setSaving] = useState(false);

  const handleAction = async (action: 'DONE' | 'SNOOZE') => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      await remindersApi.submitAction(userId, reminder.id, action);
      setResponded(true);
    } catch (err) { console.error('Reminder action failed:', err); }
    finally { setSaving(false); }
  };

  const statusColor =
    reminder.status === 'DONE' ? '#22c55e' :
    reminder.status === 'SNOOZED' ? '#f59e0b' :
    reminder.status === 'CANCELLED' ? '#ef4444' : '#8B7EC8';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[18px] p-4 bg-card"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: statusColor + '18' }}>
          <Bell className="w-4 h-4" style={{ color: statusColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 3 }} className="text-foreground">
            Сануулга
          </p>
          {reminder.triggerReason && (
            <p style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(0,0,0,0.52)', marginBottom: 4 }}>{reminder.triggerReason}</p>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.3)' }} />
            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', fontWeight: 500 }}>
              {formatTime(reminder.scheduledFor)}
            </span>
            {reminder.status !== 'PENDING' && (
              <span className="ml-2 px-2 py-0.5 rounded-full" style={{
                fontSize: 10, fontWeight: 600, color: statusColor,
                backgroundColor: statusColor + '15',
              }}>
                {reminder.status === 'DONE' ? 'Дууссан' :
                 reminder.status === 'SNOOZED' ? 'Хойшлуулсан' :
                 reminder.status === 'CANCELLED' ? 'Цуцлагдсан' : 'Хугацаа дууссан'}
              </span>
            )}
          </div>
        </div>
      </div>

      {!responded && reminder.status === 'PENDING' && (
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(0,0,0,0.07)' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('DONE')} disabled={saving}
            className="flex-1 py-2.5 rounded-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: '#22c55e18' }}>
            <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} strokeWidth={2.5} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>Хийлээ</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('SNOOZE')} disabled={saving}
            className="flex-1 py-2.5 rounded-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: '#f59e0b18' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>5 мин</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export function RemindersPage() {
  const navigate = useNavigate();
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
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 px-5 pt-13 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-primary" />
            <p style={{ fontSize: 17, fontWeight: 700 }} className="text-foreground">Сануулга</p>
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
              style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
              <BellOff className="w-8 h-8" style={{ color: 'rgba(0,0,0,0.2)' }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, marginTop: 16 }} className="text-foreground">
              Сануулга байхгүй
            </p>
            <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6 }} className="text-muted-foreground">
              Дадал дээрээ сануулга идэвхжүүлснээр<br />энд харагдах болно.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
