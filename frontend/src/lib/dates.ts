/**
 * Returns the local-calendar (`YYYY-MM-DD`) date string for a `Date`.
 *
 * Lives outside any component file so React Fast Refresh stays happy and the
 * helper can be imported by both UI components and pure-data utilities.
 */
export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Local midnight of a `YYYY-MM-DD` calendar date. Unlike `new Date('YYYY-MM-DD')`,
 * which JavaScript parses as UTC midnight, this never shifts the day.
 */
export function parseLocalYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/*
 * Calendar dates vs instants when talking to the API:
 * - Timestamps (`completedAt`) are sent as real instants via `toISOString()`.
 * - Calendar days (`?date=`) are sent as the browser-local `YYYY-MM-DD` the user
 *   sees. The backend reads them as Asia/Ulaanbaatar days, which matches the
 *   browser for the app's current (single-timezone) audience.
 */
