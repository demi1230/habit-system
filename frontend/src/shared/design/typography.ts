/**
 * Typography design tokens — single source of truth for all text styles.
 *
 * Usage:
 *   import { TYPOGRAPHY, getTextStyle } from '@/shared/design';
 *   style={TYPOGRAPHY.pageTitle}
 *   style={getTextStyle('caption')}
 *   style={{ ...TYPOGRAPHY.caption, marginTop: 4 }}
 */

const FF = "'Montserrat', 'Inter', sans-serif";

/** Base font token */
export const FONT = {
  family: FF,
} as const;

export const TYPOGRAPHY = {
  /** Tab page header (Dashboard, Learn, Reminders, Profile) */
  pageTitle: {
    fontFamily: FF,
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.3px',
  },
  /** Sub-page nav bar title between back/action buttons — was: subPageTitle */
  navTitle: {
    fontFamily: FF,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  /** Prominent card or form title (habit name in hero, form header live title) */
  cardTitle: {
    fontFamily: FF,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  /**
   * Section heading — used for both inline card section labels and
   * page-level content section headings.
   * (Merges the former sectionHeading 13px and contentHeading 14px into one 14px token.)
   */
  sectionTitle: {
    fontFamily: FF,
    fontSize: 14,
    fontWeight: 550,
    lineHeight: 1.4,
  },
  /** Small group label above a set of controls */
  groupLabel: {
    fontFamily: FF,
    fontSize: 12,
    fontWeight: 450,
    lineHeight: 1.4,
    letterSpacing: '0.06em',
  },
  /** Primary body text */
  body: {
    fontFamily: FF,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.55,
  },
  /** Secondary / smaller body text — was: bodyMd */
  bodySm: {
    fontFamily: FF,
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  /** Caption / meta text */
  caption: {
    fontFamily: FF,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  /** Tiny label */
  micro: {
    fontFamily: FF,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  /** Large stat / number display */
  statLg: {
    fontFamily: FF,
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  },
  /** Medium stat display */
  statMd: {
    fontFamily: FF,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.2,
  },
} as const;

export type TypographyKey = keyof typeof TYPOGRAPHY;

/** Type-safe accessor — returns the exact static type for each key. */
export function getTextStyle<K extends TypographyKey>(key: K): typeof TYPOGRAPHY[K] {
  return TYPOGRAPHY[key];
}
