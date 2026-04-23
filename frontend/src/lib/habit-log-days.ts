import type { HabitLog, Weekday } from '@/api/types';
import { toLocalDateStr } from '@/components/month-calendar';

const JS_TO_WD: Record<number, Weekday> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

export function toLocalISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function getLatestLogsByDay(logs: HabitLog[]): Map<string, HabitLog> {
  const sorted = [...logs].sort((a, b) => {
    const completedDiff =
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    if (completedDiff !== 0) return completedDiff;
    return new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime();
  });

  const latestByDay = new Map<string, HabitLog>();
  for (const log of sorted) {
    const key = toLocalDateStr(new Date(log.completedAt));
    if (!latestByDay.has(key)) {
      latestByDay.set(key, log);
    }
  }
  return latestByDay;
}

export function countCompletedDays(logs: HabitLog[]): number {
  let count = 0;
  for (const log of getLatestLogsByDay(logs).values()) {
    if (log.status === 'DONE') count += 1;
  }
  return count;
}

export function computeScheduledStreakFromLogs(
  logs: HabitLog[],
  scheduleDays: Array<{ weekday: Weekday }> | Weekday[] | undefined,
): number {
  const latestByDay = getLatestLogsByDay(logs);
  const scheduledWds = new Set(
    (scheduleDays ?? []).map((day) =>
      typeof day === 'string' ? day : day.weekday,
    ),
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i += 1) {
    const weekday = JS_TO_WD[cursor.getDay()];
    if (scheduledWds.size === 0 || scheduledWds.has(weekday)) {
      const key = toLocalDateStr(cursor);
      const latestLog = latestByDay.get(key);

      if (latestLog?.status === 'DONE') {
        streak += 1;
      } else if (!(i === 0 && !latestLog)) {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
