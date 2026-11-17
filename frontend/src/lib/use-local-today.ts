import { useEffect, useState } from 'react';
import { toLocalDateStr } from './dates';

/**
 * Browser-local calendar date (`YYYY-MM-DD`) that stays correct while the app
 * is left open: it updates just after local midnight and whenever the tab
 * becomes visible or focused again (timers are paused on sleeping devices).
 */
export function useLocalToday(): string {
  const [today, setToday] = useState(() => toLocalDateStr(new Date()));

  useEffect(() => {
    let timer: number | undefined;

    const update = () => setToday(toLocalDateStr(new Date()));

    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      timer = window.setTimeout(() => {
        update();
        scheduleMidnightUpdate();
      }, nextMidnight.getTime() - now.getTime());
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') update();
    };

    scheduleMidnightUpdate();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return today;
}
