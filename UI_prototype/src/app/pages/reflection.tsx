import canvasConfetti from 'canvas-confetti';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useHabit } from '../store';
import { useT } from '../i18n';
import { getHabitColor, CTA_DARK } from '../lib/habit-colors';

// ── Options data ───────────────────────────────────────────────
const moodOptions = [
  { id: 'great',    emoji: '😊', label: 'Гайхалтай' },
  { id: 'good',     emoji: '🙂', label: 'Сайн' },
  { id: 'okay',     emoji: '😐', label: 'Дунд' },
  { id: 'low',      emoji: '😔', label: 'Уйтгартай' },
  { id: 'stressed', emoji: '😤', label: 'Стресстэй' },
];

const energyOptions = [
  { id: 'high',     emoji: '⚡', label: 'Өндөр' },
  { id: 'moderate', emoji: '🔋', label: 'Дунд' },
  { id: 'low',      emoji: '🪫', label: 'Бага' },
  { id: 'drained',  emoji: '😴', label: 'Хэт ядарсан' },
];

const focusOptions = [
  { id: 'sharp',     emoji: '🎯', label: 'Тодорхой' },
  { id: 'present',   emoji: '🧘', label: 'Одоо дор' },
  { id: 'scattered', emoji: '💭', label: 'Тархай' },
  { id: 'foggy',     emoji: '🌫️', label: 'Бүдэг' },
];

const celebrationMessages = [
  { title: 'Чи үнэхээр гайхалтай зүйл байгуулж байна', sub: 'Эргэцүүлэл бүр өөрийгөө илүү гүнзгий таниулна.' },
  { title: 'Ухамсар бол дэлхийн хамгийн хүчтэй зүйл', sub: 'Өөрийгөө ажиглах нь өсөлтийн эхний алхам.' },
  { title: 'Энэ мөч чухал', sub: 'Чи ирээдүйн өөртөө хөрөнгө оруулалт хийлээ.' },
];

type Step = 'mood' | 'energy-focus' | 'note' | 'celebrate';

// ── Option button ──────────────────────────────────────────────
function OptionBtn({
  emoji, label, selected, onSelect, color,
}: {
  emoji: string; label: string; selected: boolean;
  onSelect: () => void;
  color: { btn: string; accent: string; ring: string };
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onSelect}
      className="flex flex-col items-center gap-2 p-3.5 rounded-[20px] transition-all"
      style={{
        backgroundColor: selected ? color.btn : 'rgba(0,0,0,0.04)',
        boxShadow: selected ? `0 0 0 2px ${color.accent}` : 'none',
        minWidth: 68,
      }}
    >
      <span style={{ fontSize: '26px' }}>{emoji}</span>
      <span style={{
        fontSize: '11px', fontWeight: selected ? 700 : 400,
        color: selected ? color.accent : 'rgba(0,0,0,0.45)',
        textAlign: 'center',
      }}>
        {label}
      </span>
    </motion.button>
  );
}

// ── Component ──────────────────────────────────────────────────
export function ReflectionPage() {
  const navigate     = useNavigate();
  const { id }       = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const habit        = useHabit(id);
  const t            = useT();

  const color = getHabitColor(habit ?? undefined);

  const [step, setStep]   = useState<Step>('mood');
  const [mood, setMood]   = useState('');
  const [energy, setEnergy] = useState('');
  const [focus, setFocus]   = useState('');
  const [note, setNote]     = useState('');
  const confettiRef         = useRef(false);

  const celebration = celebrationMessages[Math.floor(Date.now() / 86400000) % celebrationMessages.length];

  // Confetti on celebrate step
  useEffect(() => {
    if (step === 'celebrate' && !confettiRef.current) {
      confettiRef.current = true;
      const colors = [color.btn, color.ring, '#ffffff', color.btn];
      canvasConfetti({ particleCount: 70, spread: 80, origin: { y: 0.6 }, colors, gravity: 0.6, ticks: 120, shapes: ['circle'], scalar: 0.9 });
      setTimeout(() => {
        canvasConfetti({ particleCount: 35, spread: 50, origin: { y: 0.5, x: 0.3 }, colors, gravity: 0.5, ticks: 100, shapes: ['circle'], scalar: 0.65 });
      }, 320);
    }
  }, [step]);

  const goNext = () => {
    if (step === 'mood')          setStep('energy-focus');
    else if (step === 'energy-focus') setStep('note');
    else if (step === 'note')     setStep('celebrate');
    else navigate('/dashboard');
  };

  const goBack = () => {
    if (step === 'mood')          navigate(-1);
    else if (step === 'energy-focus') setStep('mood');
    else if (step === 'note')     setStep('energy-focus');
  };

  const canProceed = () => {
    if (step === 'mood')          return !!mood;
    if (step === 'energy-focus')  return !!energy || !!focus;
    return true;
  };

  const stepIndex = ['mood', 'energy-focus', 'note'].indexOf(step);
  const progress  = step === 'celebrate' ? 100 : ((stepIndex + 1) / 3) * 100;

  // ── SCREEN: Celebrate ───────────────────────────────────────
  if (step === 'celebrate') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ backgroundColor: color.btn + '55' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className="text-center max-w-[300px]"
        >
          {/* Glow ring */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1.1] }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color.btn }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color.ring}60` }} />
            <motion.div
              initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 0.2 }}
              className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: '44px' }}>🌟</span>
            </motion.div>
          </div>

          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }} style={{ color: '#202325' }}>
            {celebration.title}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(0,0,0,0.55)', marginTop: 8 }}>
            {celebration.sub}
          </motion.p>

          {/* Summary pills */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap justify-center gap-2 mt-5">
            {mood && (
              <span className="px-3 py-1.5 rounded-full"
                style={{ fontSize: '12px', backgroundColor: color.btn, color: color.accent, fontWeight: 600 }}>
                {moodOptions.find(m => m.id === mood)?.emoji} {moodOptions.find(m => m.id === mood)?.label}
              </span>
            )}
            {energy && (
              <span className="px-3 py-1.5 rounded-full"
                style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.7)', color: '#202325' }}>
                {energyOptions.find(e => e.id === energy)?.emoji} {energyOptions.find(e => e.id === energy)?.label}
              </span>
            )}
            {focus && (
              <span className="px-3 py-1.5 rounded-full"
                style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.7)', color: '#202325' }}>
                {focusOptions.find(f => f.id === focus)?.emoji} {focusOptions.find(f => f.id === focus)?.label}
              </span>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
            className="mt-8 w-full py-4 rounded-[24px]"
            style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, boxShadow: CTA_DARK.shadow, fontSize: 15, fontWeight: 600 }}>
            Дашбоард руу буцах
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── SCREEN: Main flow ───────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ backgroundColor: color.btn + '44' }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1"
            style={{ fontSize: '13px', color: 'rgba(0,0,0,0.45)' }}>
            Алгасах <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.10)' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color.accent }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 flex flex-col">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Mood ── */}
          {step === 'mood' && (
            <motion.div key="mood"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
              className="flex-1 flex flex-col">
              <div className="text-center mt-5 mb-7">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  <Sparkles className="w-6 h-6" style={{ color: color.accent }} />
                </div>
                <h2 style={{ color: '#202325' }}>{t('refl.howFeeling')}</h2>
                <p className="mt-1" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)' }}>
                  {t('refl.checkInSelf')}
                </p>
              </div>

              <div className="flex justify-center gap-2.5 flex-wrap">
                {moodOptions.map((opt, i) => (
                  <motion.div key={opt.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}>
                    <OptionBtn emoji={opt.emoji} label={opt.label}
                      selected={mood === opt.id}
                      onSelect={() => setMood(opt.id)} color={color} />
                  </motion.div>
                ))}
              </div>

              {mood && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center mt-5"
                  style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>
                  {mood === 'great'    && 'Гайхалтай — энэ эрч хүчийг авч яв! ✨'}
                  {mood === 'good'     && 'Сайн газарт байна 🌿'}
                  {mood === 'okay'     && 'Дундаж ч болно, өөр зүйл болох шаардлагагүй.'}
                  {mood === 'low'      && 'Шударга байдалд баярлалаа. Чи ирсэн — энэ чухал 💛'}
                  {mood === 'stressed' && 'Стрессийг анзаарах нь тайлуулахын эхний алхам 🤗'}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Energy & Focus ── */}
          {step === 'energy-focus' && (
            <motion.div key="energy-focus"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
              className="flex-1 flex flex-col">
              <div className="text-center mt-5 mb-7">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.7)', fontSize: 24 }}>
                  🔋
                </div>
                <h2 style={{ color: '#202325' }}>{t('refl.energyFocus')}</h2>
                <p className="mt-1" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)' }}>
                  {t('refl.bodyMind')}
                </p>
              </div>

              {/* Energy */}
              <div className="mb-6">
                <p className="mb-3" style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                  {t('refl.energyLevel')}
                </p>
                <div className="flex gap-2.5">
                  {energyOptions.map((opt, i) => (
                    <motion.div key={opt.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }} className="flex-1">
                      <OptionBtn emoji={opt.emoji} label={opt.label}
                        selected={energy === opt.id}
                        onSelect={() => setEnergy(opt.id)} color={color} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Focus */}
              <div>
                <p className="mb-3" style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                  {t('refl.mentalClarity')}
                </p>
                <div className="flex gap-2.5">
                  {focusOptions.map((opt, i) => (
                    <motion.div key={opt.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }} className="flex-1">
                      <OptionBtn emoji={opt.emoji} label={opt.label}
                        selected={focus === opt.id}
                        onSelect={() => setFocus(opt.id)} color={color} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {(energy || focus) && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center mt-5"
                  style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>
                  Хэв маягийг хянах нь хамгийн сайн хэмнэлийг олоход тусална 🌱
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Note ── */}
          {step === 'note' && (
            <motion.div key="note"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}
              className="flex-1 flex flex-col">
              <div className="text-center mt-5 mb-7">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.7)', fontSize: 24 }}>
                  📝
                </div>
                <h2 style={{ color: '#202325' }}>{t('refl.anythingElse')}</h2>
                <p className="mt-1" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)' }}>
                  {t('refl.quickNote')}
                </p>
              </div>

              <div className="rounded-[20px] overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t('refl.notePlaceholder')}
                  rows={5}
                  autoFocus
                  className="w-full px-5 py-4 bg-transparent focus:outline-none resize-none"
                  style={{ fontSize: '14px', lineHeight: 1.65, color: '#202325' }}
                />
              </div>

              <div className="flex items-start gap-2 mt-4 px-1">
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: color.accent }} />
                <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(0,0,0,0.4)', lineHeight: 1.5 }}>
                  Өдөр тутмын тэмдэглэл бичих нь өөрийгөө таних чадварыг 42%-иар нэмэгдүүлдэг
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-auto pb-10 pt-6 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goNext}
            disabled={!canProceed()}
            className="w-full py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all"
            style={canProceed()
              ? { backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, boxShadow: CTA_DARK.shadow, fontSize: 15, fontWeight: 600 }
              : { backgroundColor: 'rgba(0,0,0,0.07)', color: 'rgba(0,0,0,0.3)', fontSize: 15 }}>
            <span>{step === 'note' ? t('refl.finishReflection') : t('common.continue')}</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {step !== 'mood' && (
            <button onClick={goNext}
              className="w-full py-3 text-center"
              style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)' }}>
              {t('refl.skipStep')}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
