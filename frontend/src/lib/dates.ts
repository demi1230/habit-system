/**
 * Returns the local-calendar (`YYYY-MM-DD`) date string for a `Date`.
 *
 * Lives outside any component file so React Fast Refresh stays happy and the
 * helper can be imported by both UI components and pure-data utilities.
 */
export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
