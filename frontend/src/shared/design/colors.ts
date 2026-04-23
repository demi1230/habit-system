/**
 * Color, surface and shadow design tokens.
 *
 * Usage:
 *   import { SHADOW, SURFACE } from '@/shared/design';
 *   style={{ boxShadow: SHADOW.card }}
 *   style={{ backgroundColor: SURFACE.muted }}
 */

/** Box shadow tokens */
export const SHADOW = {
  card:   '0px 4px 10px rgba(0,0,0,0.07)',
  dark:   '0 4px 14px rgba(48,52,55,0.28)',
  medium: '0 2px 8px rgba(0,0,0,0.12)',
  up:     '0 -6px 32px rgba(0,0,0,0.12)',
} as const;

/** Surface / layer color tokens for overlays, borders and backgrounds */
export const SURFACE = {
  border:  'var(--surface-border-soft)',
  overlay: 'var(--surface-strong)',
  subtle:  'var(--surface-subtle)',
  muted:   'var(--surface-muted)',
} as const;
