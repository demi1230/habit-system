/**
 * OnboardingPage — post-signup welcome flow
 *
 * Shown to newly registered users to explain the app's core idea and guide
 * them into creating their first habit. The CTA on the last slide opens
 * the habit template picker (`/create`). Any user can skip to /dashboard.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Target, Bell, Rocket, type LucideIcon } from 'lucide-react';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';
import { CTA_DARK } from '@/lib/habit-colors';

interface Slide {
  Icon: LucideIcon;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    Icon: Sparkles,
    title: 'Тавтай морил',
    body: 'Сайн уу, Дэми байна. Миний бүтээсэн энэ жижиг аппыг туршиж үзэх гэж байгаад баярлалаа. ',
  },
  {
    Icon: Target,
    title: 'Дадал яагаад чухал вэ?',
    body: 'Өдөр бүрийн жижиг үйлдэл таны амьдралыг өөрчилдөг. Амжилт нэг том шийдвэрээс бус, давтагдсан жижиг үйлдлээс буюу дадал, зуршлаас бүрддэг.',
  },
  {
    Icon: Bell,
    title: 'Дадал хэрхэн үүсдэг вэ?',
    body: 'Тархи давтагдсан үйлдлийг автомат болгож дадал болгодог. Байнга давтагдаж байдаг үйлдэл ихэнхдээ эхлүүлэхэд хялбар, хийхэд амархан, аз жаргалын даавар ялгаруулдаг, таатай мэдрэмж төрүүлдэг байдаг',
  },
  {
    Icon: Rocket,
    title: 'Эхний дадлаа үүсгэцгээе',
    body: 'Дадал АПП танд хэрэгтэй дадлыг аажмаар, тогтвортой бий болгоход туслана. Өдөр бүр бага багаар. Хамтдаа илүү сайн хувилбарлуугаа ойртоцгооё.',
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      navigate('/create');
    } else {
      setIdx(i => i + 1);
    }
  };

  const handleBack = () => {
    if (idx > 0) setIdx(i => i - 1);
  };

  const handleSkip = () => navigate('/dashboard');

  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
    <div className="w-full max-w-[430px] relative flex flex-col min-h-screen overflow-hidden">
      {/* Top decorative blob */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '70vh', zIndex: 0 }}
      >
        <div
          className="absolute inset-0 rounded-b-[80px]"
          style={{ backgroundColor: 'var(--muted)' }}
        />
      </div>

      {/* Top bar — skip + progress */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === idx ? 22 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor:
                  i <= idx ? 'var(--foreground)' : 'var(--surface-strong)',
                transition: 'width 0.3s ease, background-color 0.3s ease',
                display: 'inline-block',
              }}
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSkip}
          className={buttonStyles({ variant: 'nav', size: 'icon' })}
          aria-label="Алгасах"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
        >
          <X className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </motion.button>
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
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
              <slide.Icon
                style={{ width: 40, height: 40, color: 'var(--foreground)', strokeWidth: 1.5 }}
              />
            </div>

            <h1
              style={{
                ...TYPOGRAPHY.pageTitle,
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 14,
                color: 'var(--foreground)',
              }}
            >
              {slide.title}
            </h1>
            <p
              style={{
                ...TYPOGRAPHY.bodySm,
                lineHeight: 1.7,
                color: 'var(--text-soft)',
                maxWidth: 280,
              }}
            >
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 pb-14 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className={`w-full ${buttonStyles({ variant: 'default', size: 'lg' })}`}
          style={{
            backgroundColor: CTA_DARK.bg,
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            boxShadow: CTA_DARK.shadow,
          }}
        >
          {isLast ? 'Эхний дадлаа үүсгэе' : 'Дараах'}
        </motion.button>

        {idx > 0 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBack}
            className={`w-full ${buttonStyles({ variant: 'secondary', size: 'lg' })}`}
            style={{
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--foreground)',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Буцах
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSkip}
            className={`w-full ${buttonStyles({ variant: 'secondary', size: 'lg' })}`}
            style={{
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--foreground)',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Алгасах
          </motion.button>
        )}
      </div>
    </div>
    </div>
  );
}
