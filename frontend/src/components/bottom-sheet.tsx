import { motion } from 'motion/react';

interface BottomSheetProps {
  onClose: () => void;
  busy?: boolean;
  children: React.ReactNode;
}

/**
 * Reusable bottom-sheet shell for form dialogs (matches ConfirmDialog visual style).
 * Renders a dim backdrop + a spring-animated card rising from the bottom.
 */
export function BottomSheet({ onClose, busy = false, children }: BottomSheetProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/35 z-[100] backdrop-blur-[3px]"
        onClick={busy ? undefined : onClose}
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
          {children}
        </div>
      </motion.div>
    </>
  );
}
