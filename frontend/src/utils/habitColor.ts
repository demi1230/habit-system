/**
 * Habit color palette — matches HABIT_COLORS in AddHabitPage
 * Index: 0=purple, 1=pink, 2=green, 3=cyan, 4=yellow, 5=lavender
 */
export const HABIT_PALETTE = [
  { tag: '#b3b3fd', bg: 'rgba(179,179,253,0.22)', light: 'rgba(179,179,253,0.12)' },
  { tag: '#ffbbbb', bg: 'rgba(255,187,187,0.22)', light: 'rgba(255,187,187,0.12)' },
  { tag: '#94fdb0', bg: 'rgba(148,253,176,0.22)', light: 'rgba(148,253,176,0.12)' },
  { tag: '#b3fcff', bg: 'rgba(179,252,255,0.22)', light: 'rgba(179,252,255,0.12)' },
  { tag: '#ffd98c', bg: 'rgba(255,217,140,0.22)', light: 'rgba(255,217,140,0.12)' },
  { tag: '#d28cff', bg: 'rgba(210,140,255,0.22)', light: 'rgba(210,140,255,0.12)' },
] as const;

const storageKey = (userId: string) => `habitColors_${userId}`;

/** Get stored (or hash-derived) color index for a habit */
export function getHabitColorIdx(userId: string, habitId: string): number {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) {
      const map = JSON.parse(raw) as Record<string, number>;
      if (typeof map[habitId] === 'number') return map[habitId];
    }
  } catch { /* ignore */ }
  // Deterministic fallback: hash habitId
  let hash = 0;
  for (const ch of habitId) hash = ((hash * 31) + ch.charCodeAt(0)) >>> 0;
  return hash % HABIT_PALETTE.length;
}

/** Persist a user's chosen color index for a habit */
export function saveHabitColor(userId: string, habitId: string, colorIdx: number): void {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[habitId] = colorIdx;
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch { /* ignore */ }
}
