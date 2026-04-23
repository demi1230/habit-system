import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';

interface Props {
  whyLabel: string;
  whyText: string;
}

export function RecommendationWhyToggle({ whyLabel, whyText }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`mt-2.5 hover:opacity-70 transition-opacity ${buttonStyles({ variant: 'ghost', size: 'inline' })}`}
      >
        <span style={TYPOGRAPHY.micro} className="text-foreground/50">
          {whyLabel}
        </span>
        <ChevronDown
          className="w-3 h-3 text-foreground/40 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="why"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p
              style={{ ...TYPOGRAPHY.micro, lineHeight: 1.55, marginTop: 6 }}
              className="text-muted-foreground"
            >
              {whyText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
