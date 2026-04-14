import { motion } from 'motion/react';
import { BottomNav } from '../components/bottom-nav';
import { useHabits } from '../store';

export function RemindersPage() {
  const allHabits = useHabits();

  const reminders = allHabits
    .filter((h) => !h.archived && h.reminderEnabled)
    .map((h) => ({
      id: h.id,
      habit: h.title,
      window: h.reminderWindow || '—',
      implementationIntention: h.implementationIntention,
    }));

  // Static fallback if no habits have reminders
  const displayReminders =
    reminders.length > 0
      ? reminders
      : [
          {
            id: 's1',
            habit: 'Өдрийн ажлаа төлөвлөх',
            window: '2026.03.05',
            implementationIntention:
              'Ажлаа хийх гээд суух үйлдлийг хийхээсээ өмнө өдрийн ажлаа төлөх',
          },
        ];

  return (
    <div className="min-h-screen bg-background pb-36 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 pt-12 pb-4"
      >
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#202325' }}>Сануулгууд</p>
      </motion.div>

      {/* Reminder cards */}
      <div className="px-5 flex flex-col gap-3">
        {displayReminders.map((reminder, i) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.06 }}
          >
            <div
              className="bg-[#E3EBFE] rounded-[24px] p-4"
              style={{ boxShadow: '0px 4px 10px rgba(0,0,0,0.07)' }}
            >
              <p
                style={{ fontSize: '14px', fontWeight: 700, color: '#303437' }}
                className="mb-2"
              >
                {reminder.habit}
              </p>
              <div className="flex items-start justify-between gap-3">
                <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.5, flex: 1 }}>
                  {reminder.implementationIntention ||
                    `${reminder.window} сануулга идэвхтэй байна`}
                </p>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(0,0,0,0.45)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {reminder.window}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {displayReminders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <span style={{ fontSize: '48px' }} className="mb-3">
              🔔
            </span>
            <p
              style={{ fontSize: '16px', fontWeight: 600, color: '#202325' }}
              className="mb-1"
            >
              Сануулга байхгүй
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)' }}>
              Дадалдаа сануулга нэмж болно
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
