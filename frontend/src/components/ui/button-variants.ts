import { buttonStyles } from '@/shared/design';

/**
 * Re-export of `buttonStyles` under the shadcn-conventional name
 * `buttonVariants`. Lives in its own file (not `button.tsx`) so React Fast
 * Refresh stays happy: components and helper exports must not share a file.
 */
export const buttonVariants = buttonStyles;
