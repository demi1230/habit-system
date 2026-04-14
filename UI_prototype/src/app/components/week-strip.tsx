import { motion } from 'motion/react';
import { useHabits } from '../store';

const MN_DAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

export function WeekStrip() {
  const today = new Date();
  const todayDow = today.getDay(); // 0=Sun
  const habits = useHabits().filter((h) => !h.archived);

  // Monday-first week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((todayDow + 6) % 7));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    const completedCount = habits.filter((h) =>
      h.completions.some((c) => c.date === dateStr && (c.completed || c.partial))
    ).length;
    const allDone = completedCount >= habits.length && habits.length > 0;
    const somePartial = completedCount > 0 && !allDone;
    const isToday = d.toDateString() === today.toDateString();
    const isPast = d < today && !isToday;

    return { label: MN_DAYS[i], date: d.getDate(), isToday, isPast, allDone, somePartial };
  });

  return (
    <div className="flex items-center justify-between">
      {days.map((day, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className="flex flex-col items-center gap-1"
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.4)' }}>
            {day.label}
          </span>
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              day.isToday
                ? 'bg-[#303437]'
                : day.allDone && day.isPast
                ? 'bg-[#6366F1]'
                : ''
            }`}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: day.isToday || (day.allDone && day.isPast) ? 600 : 400,
                color: day.isToday || (day.allDone && day.isPast) ? '#fff' : '#202325',
              }}
            >
              {day.date}
            </span>
          </div>
          <div
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{
              backgroundColor: day.isToday
                ? '#303437'
                : day.allDone && day.isPast
                ? '#6366F1'
                : day.somePartial && day.isPast
                ? '#DADAFE'
                : 'transparent',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
