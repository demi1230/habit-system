/**
 * Application-wide time / timezone helpers.
 *
 * Scope (v1): the app currently targets a single locale — Asia/Ulaanbaatar.
 * All "what hour is it for the user?" decisions go through `nowInAppTz()` so
 * the codebase works regardless of where the server is hosted (e.g. Railway
 * runs in UTC).
 *
 * Future work: replace the constant with `user.timezone` from the database.
 * Every consumer should already call `nowInAppTz(tz?)` with an optional tz
 * argument, so the migration to per-user timezone is a localized refactor.
 */

export const APP_TIMEZONE = 'Asia/Ulaanbaatar';

export interface AppLocalTime {
  /** 0–23, in the application timezone */
  hour: number;
  /** 0–59, in the application timezone */
  minute: number;
  /** Local-day ISO date (YYYY-MM-DD) in the application timezone */
  ymd: string;
  /** Local hourly bucket (YYYY-MM-DDTHH) in the application timezone */
  ymdh: string;
}

/**
 * Returns the current wall-clock time interpreted in the application timezone,
 * computed from the real UTC instant via `Intl.DateTimeFormat`. This is robust
 * to the host server's timezone (UTC on most cloud providers).
 */
export function nowInAppTz(
  date: Date = new Date(),
  timeZone: string = APP_TIMEZONE,
): AppLocalTime {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): string => {
    const found = parts.find((p) => p.type === type);
    if (!found) {
      throw new Error(`Missing "${type}" part in Intl.DateTimeFormat output`);
    }
    return found.value;
  };

  const year = get('year');
  const month = get('month');
  const day = get('day');
  // Intl returns "24" for midnight in some runtimes; normalize to "00".
  const rawHour = get('hour');
  const hourStr = rawHour === '24' ? '00' : rawHour;
  const minuteStr = get('minute');

  return {
    hour: Number(hourStr),
    minute: Number(minuteStr),
    ymd: `${year}-${month}-${day}`,
    ymdh: `${year}-${month}-${day}T${hourStr}`,
  };
}
