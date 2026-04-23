export const HABIT_COLORS = {
  lavender: {
    card: 'rgba(209,209,255,0.42)',
    btn:  '#e8e8fe',
    accent: '#7C70E8',
    ring:   '#8B79F5',
    soft:   'rgba(139,121,245,0.12)',
  },
  pink: {
    card: 'rgba(255,210,210,0.42)',
    btn:  '#ffd6d6',
    accent: '#D94F6E',
    ring:   '#E8607A',
    soft:   'rgba(232,96,122,0.12)',
  },
  mint: {
    card: 'rgba(195,255,213,0.42)',
    btn:  '#baffd0',
    accent: '#18A68A',
    ring:   '#1AAF91',
    soft:   'rgba(26,175,145,0.12)',
  },
  sky: {
    card: 'rgba(180,232,255,0.42)',
    btn:  '#b8eaff',
    accent: '#3B8FD4',
    ring:   '#3B9ED8',
    soft:   'rgba(59,142,212,0.12)',
  },
  peach: {
    card: 'rgba(255,228,200,0.42)',
    btn:  '#ffe4be',
    accent: '#D4650A',
    ring:   '#E07820',
    soft:   'rgba(208,101,10,0.12)',
  },
  yellow: {
    card: 'rgba(255,244,190,0.42)',
    btn:  '#fff0a8',
    accent: '#B8880A',
    ring:   '#C89810',
    soft:   'rgba(184,136,10,0.12)',
  },
} as const;

export type HabitColorKey = keyof typeof HABIT_COLORS;

export const PASTEL_LIST = [
  { id: 'lavender' as HabitColorKey, label: 'Нил' },
  { id: 'pink'     as HabitColorKey, label: 'Ягаан' },
  { id: 'mint'     as HabitColorKey, label: 'Ногоон' },
  { id: 'sky'      as HabitColorKey, label: 'Цэнхэр' },
  { id: 'peach'    as HabitColorKey, label: 'Персик' },
  { id: 'yellow'   as HabitColorKey, label: 'Шар' },
];

/** Resolve color palette from a stored color key (e.g. "lavender", "pink"). */
export function getHabitColor(colorKey?: string | null) {
  return HABIT_COLORS[(colorKey as HabitColorKey) ?? 'lavender'] ?? HABIT_COLORS.lavender;
}

/** Return the stored emoji/icon for a habit, with a safe fallback. */
export function getHabitIcon(habit?: { iconValue?: string | null } | null): string {
  return habit?.iconValue || '✨';
}

export const ALL_COLOR = {
  card:   '',
  btn:    '#e8e8ec',
  accent: '#303437',
  ring:   '#303437',
  soft:   'rgba(48,52,55,0.09)',
};

export const CTA_DARK = {
  bg:     '#303437',
  shadow: '0 4px 14px rgba(48,52,55,0.28)',
  text:   '#F8FAFC',
};

// ── Shared design tokens (now in src/shared/design/) ────────────────────────
export {
  TYPOGRAPHY, FONT, SHADOW, SURFACE,
  getTextStyle,
  type TypographyKey,
} from '@/shared/design';
