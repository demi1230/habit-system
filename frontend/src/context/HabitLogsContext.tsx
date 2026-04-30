/**
 * HabitLogsContext — shared source of truth for today's HabitLog status.
 *
 * Motivation: Dashboard, Reminders, and Calendar all need to agree on
 * which habits are "done" today. Without a shared store each page does
 * its own fetch, so after pressing "Хийлээ" in Reminders the Dashboard
 * card still shows undone (and vice-versa).
 *
 * This context:
 *  - Fetches today's habits (+ todayLog) once on mount.
 *  - Exposes `todayLogMap: Map<habitId, TodayLogStatus>`.
 *  - Exposes `refresh()` so any page can force a re-fetch after a mutation.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { habitsApi } from '@/api/habits';
import { useAuth } from './AuthContext';

export interface TodayLogStatus {
  logId: string;
  status: 'done' | 'partial';
  actualValue: number;
}

interface HabitLogsContextValue {
  /** Maps habitId → today's log status. Empty map = nothing logged today. */
  todayLogMap: Map<string, TodayLogStatus>;
  /** Re-fetch today's habits + logs. Call after any log mutation. */
  refresh: () => Promise<void>;
}

const HabitLogsContext = createContext<HabitLogsContextValue | null>(null);

/**
 * Pure helper: turns the `listToday` response into a Map<habitId, status>.
 * Extracted so the effect (initial load) and the imperative `refresh()` use
 * exactly the same projection logic.
 */
function buildTodayLogMap(
  data: Awaited<ReturnType<typeof habitsApi.listToday>>,
): Map<string, TodayLogStatus> {
  const map = new Map<string, TodayLogStatus>();
  for (const habit of data) {
    const log = habit.todayLog;
    if (!log) continue;
    // Trust the server-side status field.
    // Reminder-created logs have status = DONE but actualValue = null.
    if (log.status === 'DONE') {
      map.set(habit.id, {
        logId: log.id,
        status: 'done',
        actualValue: log.actualValue ?? habit.targetValue ?? 1,
      });
    } else if ((log.actualValue ?? 0) > 0) {
      map.set(habit.id, {
        logId: log.id,
        status: 'partial',
        actualValue: log.actualValue!,
      });
    }
  }
  return map;
}

export function HabitLogsProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [todayLogMap, setTodayLogMap] = useState<Map<string, TodayLogStatus>>(
    new Map(),
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await habitsApi.listToday(userId);
      setTodayLogMap(buildTodayLogMap(data));
    } catch (err) {
      console.error('[HabitLogsContext] Failed to load today logs:', err);
    }
  }, [userId]);

  // Initial / userId-change load. Inlined (rather than calling `refresh()`)
  // with a cancellation flag so the lint check sees a guarded async setter
  // instead of a synchronous trampoline through a memoized callback.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    habitsApi
      .listToday(userId)
      .then((data) => {
        if (!cancelled) setTodayLogMap(buildTodayLogMap(data));
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[HabitLogsContext] Failed to load today logs:', err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <HabitLogsContext.Provider value={{ todayLogMap, refresh }}>
      {children}
    </HabitLogsContext.Provider>
  );
}

// See comment in `AuthContext.tsx` — colocated hook export, intentional.
// eslint-disable-next-line react-refresh/only-export-components
export function useHabitLogs(): HabitLogsContextValue {
  const ctx = useContext(HabitLogsContext);
  if (!ctx)
    throw new Error('useHabitLogs must be used within HabitLogsProvider');
  return ctx;
}
