import { motion } from 'motion/react';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';

export type ConfirmTone = 'default' | 'danger';

interface ConfirmDialogProps {
  /** Decorative emoji prefix; omit to show title only. */
  emoji?: string | null;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Bottom-sheet confirmation dialog for destructive or significant actions.
 * Reusable across logout, delete, discard-changes flows.
 */
export function ConfirmDialog({
  emoji,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Болих',
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBg = tone === 'danger' ? '#EF4444' : 'var(--foreground)';
  const confirmColor = tone === 'danger' ? '#fff' : 'var(--background)';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/35 z-[100] backdrop-blur-[3px]"
        onClick={busy ? undefined : onCancel}
        aria-hidden
      />
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center isolate"
      >
        <div
          className="w-full max-w-[430px] bg-card rounded-t-[28px] px-6 pb-[max(2.75rem,env(safe-area-inset-bottom))] pt-5"
          style={{ boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}
        >
          <div
            className="w-9 h-[3px] rounded-full mx-auto mb-5"
            style={{ backgroundColor: 'var(--surface-strong)' }}
          />
          <div className="text-center mb-6">
            {emoji ? <p style={{ fontSize: 40, lineHeight: 1 }}>{emoji}</p> : null}
            <p
              style={{
                ...TYPOGRAPHY.pageTitle,
                fontWeight: 500,
                marginTop: emoji ? 12 : 4,
              }}
              className="text-foreground"
            >
              {title}
            </p>
            {description ? (
              <div
                className="mt-2 text-muted-foreground"
                style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }}
              >
                {description}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-2.5">
            <motion.button
              whileTap={busy ? undefined : { scale: 0.97 }}
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center justify-center w-full whitespace-nowrap select-none rounded-full px-6 py-3.5 text-[14px] font-semibold disabled:pointer-events-none disabled:opacity-50 border-none ring-0 shadow-none outline-none focus-visible:ring-0 transition-all duration-200"
              style={{
                backgroundColor: confirmBg,
                color: confirmColor,
                fontSize: 15,
                fontWeight: 500,
                opacity: busy ? 0.6 : 1,
                boxShadow:
                  tone === 'danger'
                    ? '0 4px 14px rgba(239,68,68,0.25)'
                    : '0 4px 14px rgba(48,52,55,0.28)',
              }}
            >
              {confirmLabel}
            </motion.button>
            <motion.button
              whileTap={busy ? undefined : { scale: 0.97 }}
              onClick={onCancel}
              disabled={busy}
              className={`w-full ${buttonStyles({ variant: 'secondary', size: 'lg' })}`}
              style={{
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--foreground)',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {cancelLabel}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
