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

// ── Calendar-day helpers ────────────────────────────────────────────────────
//
// Day boundaries ("today", "which day was this log", weekday checks) must be
// decided in the application timezone, never with the host's local-time Date
// methods (`getDay`, `setHours`, …). Calendar days are passed around as
// `YYYY-MM-DD` strings so they cannot be silently re-interpreted.

const YMD_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * ISO 8601 date or date-time. Groups: year, month, day, hour, minute, second,
 * fraction, zone (`Z` or `±HH:MM` / `±HHMM` / `±HH`).
 */
const ISO_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d+))?)?)?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i;

/** True when `value` is a real calendar date in `YYYY-MM-DD` form. */
export function isValidYmd(value: string): boolean {
  const match = YMD_PATTERN.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

function parseYmd(ymd: string): [number, number, number] {
  if (!isValidYmd(ymd)) {
    throw new Error(`Invalid calendar date "${ymd}", expected YYYY-MM-DD`);
  }
  const [y, m, d] = ymd.split('-').map(Number);
  return [y, m, d];
}

/** Application-timezone calendar date (`YYYY-MM-DD`) that contains `instant`. */
export function appDateOf(
  instant: Date,
  timeZone: string = APP_TIMEZONE,
): string {
  return nowInAppTz(instant, timeZone).ymd;
}

/** Adds (or with a negative value, subtracts) whole calendar days. */
export function addDaysToYmd(ymd: string, days: number): string {
  const [y, m, d] = parseYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Day of week of a calendar date: 0 = Sunday … 6 = Saturday. */
export function weekdayIndexOfYmd(ymd: string): number {
  const [y, m, d] = parseYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Calendar date of a date-only value. PostgreSQL `DATE` columns are returned
 * by Prisma as midnight UTC, so the UTC components are the stored date.
 */
export function dateOnlyToYmd(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

/** Milliseconds to add to a UTC instant to get the wall-clock time in `timeZone`. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? NaN);
  const hour = get('hour') === 24 ? 0 : get('hour');
  const wallClockAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second'),
  );
  const instantWithoutMs = instant.getTime() - instant.getUTCMilliseconds();
  return wallClockAsUtc - instantWithoutMs;
}

/** Converts a wall-clock time in `timeZone` to the corresponding UTC instant. */
export function zonedWallTimeToInstant(
  wallTime: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
  },
  timeZone: string = APP_TIMEZONE,
): Date {
  const wallClockAsUtc = Date.UTC(
    wallTime.year,
    wallTime.month - 1,
    wallTime.day,
    wallTime.hour ?? 0,
    wallTime.minute ?? 0,
    wallTime.second ?? 0,
    wallTime.millisecond ?? 0,
  );
  // Two passes handle zones whose offset differs on either side of a change.
  const firstOffset = zoneOffsetMs(new Date(wallClockAsUtc), timeZone);
  let instant = wallClockAsUtc - firstOffset;
  const secondOffset = zoneOffsetMs(new Date(instant), timeZone);
  if (secondOffset !== firstOffset) {
    instant = wallClockAsUtc - secondOffset;
  }
  return new Date(instant);
}

/**
 * First and last instant (inclusive, millisecond precision) of an
 * application-timezone calendar day.
 */
export function appDayRange(
  ymd: string,
  timeZone: string = APP_TIMEZONE,
): { start: Date; end: Date } {
  const [year, month, day] = parseYmd(ymd);
  const [nextYear, nextMonth, nextDay] = parseYmd(addDaysToYmd(ymd, 1));
  const start = zonedWallTimeToInstant({ year, month, day }, timeZone);
  const nextStart = zonedWallTimeToInstant(
    { year: nextYear, month: nextMonth, day: nextDay },
    timeZone,
  );
  return { start, end: new Date(nextStart.getTime() - 1) };
}

/**
 * Parses an ISO 8601 timestamp sent by a client.
 *
 * - With `Z` or a numeric offset it is an absolute instant.
 * - Without an offset it is a wall-clock time in the application timezone
 *   (older app versions send local time such as `2026-03-24T07:30:00`).
 * - A date-only value is the start of that application-timezone day.
 *
 * Returns an invalid Date when the value cannot be parsed.
 */
export function parseClientTimestamp(
  value: string,
  timeZone: string = APP_TIMEZONE,
): Date {
  const match = ISO_DATE_TIME_PATTERN.exec(value.trim());
  if (!match) {
    return new Date(value);
  }

  const [, y, mo, d, h, mi, s, fraction, zone] = match;
  if (!isValidYmd(`${y}-${mo}-${d}`)) {
    return new Date(NaN);
  }

  const wallTime = {
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    hour: h ? Number(h) : 0,
    minute: mi ? Number(mi) : 0,
    second: s ? Number(s) : 0,
    millisecond: fraction ? Number(fraction.slice(0, 3).padEnd(3, '0')) : 0,
  };

  if (!zone) {
    return zonedWallTimeToInstant(wallTime, timeZone);
  }

  const wallClockAsUtc = Date.UTC(
    wallTime.year,
    wallTime.month - 1,
    wallTime.day,
    wallTime.hour,
    wallTime.minute,
    wallTime.second,
    wallTime.millisecond,
  );
  if (zone.toUpperCase() === 'Z') {
    return new Date(wallClockAsUtc);
  }

  const sign = zone.startsWith('-') ? -1 : 1;
  const digits = zone.slice(1).replace(':', '');
  const offsetMinutes =
    Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4) || '0');
  return new Date(wallClockAsUtc - sign * offsetMinutes * 60_000);
}
