/**
 * WelcomePage — App intro / onboarding landing screen
 *
 * Shown to unauthenticated users before they reach login/signup.
 * Three slides introduce the core value propositions, then CTA buttons
 * navigate to /login or /signup.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Bell, TrendingUp, type LucideIcon } from 'lucide-react';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';
import { CTA_DARK } from '@/lib/habit-colors';

// ── Slide content ─────────────────────────────────────────────────────────────
const SLIDES: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: Sprout,
    title: 'Дадлаа бүтээ',
    body: 'Өдөр бүрийн жижиг алхамуудаар томоохон өөрчлөлтийг бий болго. Зорилгоо тодорхойлж, дадлаа системтэй хөгжүүл.',
  },
  {
    Icon: Bell,
    title: 'Цагтаа сануул',
    body: 'Ухаалаг сануулга таны хуваарь, байршил, өдөөгч нөхцөлд тулгуурлан зөв цагт мэдэгдэл илгээнэ.',
  },
  {
    Icon: TrendingUp,
    title: 'Ахицаа хяна',
    body: 'Гүйцэтгэлийн статистик, цуваа бүртгэл, суралцах зөвлөмжөөр хувийн өсөлтөө тасралтгүй хянаарай.',
  },
];

export function WelcomePage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [auto, setAuto] = useState(true);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => {
      setSlide(s => (s + 1) % SLIDES.length);
    }, 5000);
    return () => clearTimeout(t);
  }, [slide, auto]);

  const goTo = (i: number) => {
    setAuto(false);
    setSlide(i);
  };

  const current = SLIDES[slide];

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Top decorative blob — neutral system tone */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '70vh', zIndex: 0 }}
      >
        <div
          className="absolute inset-0 rounded-b-[80px]"
          style={{ backgroundColor: 'var(--muted)' }}
        />
      </div>

      {/* App name */}
      <div className="relative z-10 px-6 pt-16 pb-2 text-center">
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: 'var(--text-muted-soft)',
          }}
        >
          Dadal App
        </motion.p>
      </div>

      {/* Slide area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* Lucide icon */}
            <div
              className="flex items-center justify-center mb-8"
              style={{
                width: 96,
                height: 96,
                borderRadius: 28,
                backgroundColor: 'var(--card)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
                border: '1.5px solid var(--surface-border-soft)',
              }}
            >
              <current.Icon
                style={{ width: 40, height: 40, color: 'var(--foreground)', strokeWidth: 1.5 }}
              />
            </div>

            <h1
              style={{
                ...TYPOGRAPHY.pageTitle,
                fontSize: 26,
                fontWeight: 700,
                marginBottom: 16,
                color: 'var(--foreground)',
              }}
            >
              {current.title}
            </h1>
            <p
              style={{
                ...TYPOGRAPHY.bodySm,
                lineHeight: 1.7,
                color: 'var(--text-soft)',
                maxWidth: 200,
              }}
            >
              {current.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === slide ? 20 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor:
                  i === slide
                    ? 'var(--foreground)'
                    : 'var(--surface-strong)',
                transition: 'width 0.3s ease, background-color 0.3s ease',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="relative z-10 px-6 pb-14 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/signup')}
          className={`w-full ${buttonStyles({ variant: 'default', size: 'lg' })}`}
          style={{
            backgroundColor: CTA_DARK.bg,
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            boxShadow: CTA_DARK.shadow,
          }}
        >
          Эхлэх
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/login')}
          className={`w-full ${buttonStyles({ variant: 'default', size: 'lg' })}`}
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            fontWeight: 500,
            fontSize: 15,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            border: '1px solid var(--surface-border-soft)',
          }}
        >
          Нэвтрэх
        </motion.button>
      </div>
    </div>
  );
}
