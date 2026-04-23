import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Shared button tokens for system-wide button normalization.
 *
 * Usage:
 *   className={buttonStyles({ variant: 'default', size: 'lg' })}
 *   className={buttonStyles({ variant: 'nav', size: 'icon' })}
 */
export const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#303437]/15 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-[#303437] text-white shadow-[0_4px_14px_rgba(48,52,55,0.28)] hover:bg-[#262a2d]',
        secondary:
          'rounded-full bg-[rgba(0,0,0,0.05)] text-[#474747] hover:bg-[rgba(0,0,0,0.08)]',
        destructive:
          'rounded-full bg-[rgba(239,68,68,0.10)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.14)]',
        outline:
          'rounded-full border border-[rgba(0,0,0,0.10)] bg-transparent text-[#474747] hover:bg-[rgba(0,0,0,0.03)]',
        ghost:
          'rounded-full text-[#474747] hover:bg-[rgba(0,0,0,0.05)] shadow-none',
        link:
          'rounded-none p-0 h-auto text-primary underline-offset-4 hover:underline shadow-none',
        accent:
          'rounded-full border border-transparent shadow-none',
        chip:
          'rounded-full border border-transparent shadow-none',
        nav:
          'rounded-full bg-[rgba(0,0,0,0.05)] text-[#474747] hover:bg-[rgba(0,0,0,0.08)] shadow-none',
        plain:
          'bg-transparent text-inherit shadow-none hover:bg-transparent',
      },
      size: {
        default: 'px-4 py-2.5 text-[13px] font-medium',
        sm: 'px-3 py-2 text-[12px] font-medium',
        lg: 'px-6 py-3.5 text-[14px] font-semibold',
        icon: 'size-9',
        iconSm: 'size-8',
        iconLg: 'size-10',
        chip: 'px-3.5 py-2 text-[13px] font-medium',
        nav: 'px-3.5 py-2.5 text-[13px] font-medium',
        inline: 'p-0 h-auto text-[13px] font-medium',
        bare: 'p-0 h-auto text-[13px] font-medium',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  },
);

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
