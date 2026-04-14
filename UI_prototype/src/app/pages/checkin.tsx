import { useHabit, getTagById, logCompletion, trackEvent, type CompletionLog } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { useT } from '../i18n';
import { ArrowLeft, Check, Plus, Minus, SkipForward, Zap, Delete } from 'lucide-react';
import { getHabitColor, CTA_DARK } from '../lib/habit-colors';

type CheckInStatus = 'input' | 'chunks' | 'difficulty' | 'done' | 'partial' | 'skipped';

const encouragements = {
  done: [
    { emoji: '✨', title: 'Гайхалтай!', sub: 'Тогтмол байдал бол амжилтын нууц.' },
    { emoji: '🌟', title: 'Чи ирлээ!', sub: 'Хамгийн хэцүү нь эхлэх — чи даалаа.' },
    { emoji: '💫', title: 'Сайхан!', sub: 'Энд л шидэт зүйл болдог.' },
  ],
  partial: [
    { emoji: '🌱', title: 'Бага ч гэсэн — хийсэн!', sub: 'Хэсэгчилсэн ахиц ч гэсэн ахиц.' },
    { emoji: '🌿', title: 'Бүх хүчин чармайлт тооцогдоно', sub: 'Орхисонгүй — энэ нь хүч чадал.' },
  ],
  skipped: [
    { emoji: '💛', title: 'Зүгээр ээ', sub: 'Амрах нь замын нэг хэсэг. Маргааш шинэ эхлэл.' },
    { emoji: '🤗', title: 'Шүүмжлэлгүй', sub: 'Завсарлага авах нь өөрийгөө хайрлах хэлбэр.' },
  ],
};

const difficultyOptions = [
  { id: 'easy',      emoji: '😌', label: 'Хялбар',    color: '#6BC98A' },
  { id: 'moderate',  emoji: '🙂', label: 'Дунд',      color: '#C9A86B' },
  { id: 'hard',      emoji: '😤', label: 'Хэцүү',     color: '#C9886B' },
  { id: 'very-hard', emoji: '🥵', label: 'Маш хэцүү', color: '#C96B6B' },
];

// ── Number Pad for measurable input ───────────────────────────
function NumberPad({
  input, onKey, color,
}: { input: string; onKey: (k: string) => void; color: { btn: string; accent: string } }) {
  const keys = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['.','0','⌫'],
  ];
  return (
    <div className="px-1">
      {keys.map((row, ri) => (
        <div key={ri} className="flex gap-3 mb-3">
          {row.map(key => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.88 }}
              onClick={() => onKey(key)}
              className="flex-1 h-14 rounded-[18px] flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                fontSize: 20,
                fontWeight: 600,
                color: '#202325',
              }}
            >
              {key === '⌫'
                ? <Delete className="w-5 h-5" style={{ color: '#474747' }} />
                : key}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CheckInPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const fromReminder = searchParams.get('source') === 'reminder';
  const t = useT();

  const habit = useHabit(id) || {
    id: '1', title: 'Дадал', description: '', goalTag: 'mindfulness',
    type: 'binary' as const, frequency: 'daily' as const, days: [],
    startDate: '', reminderEnabled: false, archived: false, createdAt: '',
    streak: 0, completionRate: 0, completions: [],
  };

  const tag = getTagById(habit.goalTag);
  const color = getHabitColor(habit);

  const [status, setStatus]         = useState<CheckInStatus>('input');
  const [numInput, setNumInput]      = useState('');
  const [chunkSteps, setChunkSteps] = useState<Record<string, boolean>>({});
  const [difficulty, setDifficulty] = useState('');
  const [completionType, setCompletionType] = useState<'done' | 'partial' | 'skipped'>('done');
  const [xpGained, setXpGained]     = useState(0);

  const hasChunks = (habit.chunks?.length ?? 0) > 0;
  const target    = habit.targetValue || 1;
  const min       = habit.minValue ?? 0;
  const numValue  = parseFloat(numInput) || 0;
  const progressPct = Math.min((numValue / target) * 100, 100);
  const isAtTarget  = numValue >= target;
  const isAboveMin  = numValue > 0 && numValue >= (min || 1);
  const autoStatus: 'done' | 'partial' = isAtTarget ? 'done' : 'partial';

  const chunksCompleted = hasChunks ? Object.values(chunkSteps).filter(Boolean).length : 0;
  const totalChunks     = habit.chunks?.length || 0;

  // Number pad handler
  const handleNumKey = (key: string) => {
    if (key === '⌫') { setNumInput(p => p.slice(0, -1)); return; }
    if (key === '.' && numInput.includes('.')) return;
    if (key === '.' && numInput === '') { setNumInput('0.'); return; }
    if (numInput.length >= 5) return;
    setNumInput(p => p === '0' && key !== '.' ? key : p + key);
  };

  const toggleChunk = (cid: string) =>
    setChunkSteps(prev => ({ ...prev, [cid]: !prev[cid] }));

  const proceedAfterInput = (type: 'done' | 'partial' | 'skipped') => {
    setCompletionType(type);
    trackEvent('ui_event', `checkin_status_${type}`, habit.id);
    if (type === 'skipped') {
      logCompletion(habit.id, 'skipped', { trigger_source: fromReminder ? 'reminder' : 'manual' });
      setStatus('skipped');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    setStatus(hasChunks ? 'chunks' : 'difficulty');
  };

  const proceedAfterChunks    = () => setStatus('difficulty');

  const finishAndLog = (withDifficulty: boolean) => {
    const earnedXp = completionType === 'done' ? 15 : 5;
    setXpGained(earnedXp);
    logCompletion(habit.id, completionType, {
      value: numValue,
      trigger_source: fromReminder ? 'reminder' : 'manual',
      difficulty: withDifficulty ? (difficulty as CompletionLog['difficulty']) : undefined,
      chunkSteps: hasChunks ? chunkSteps : undefined,
    });
    trackEvent('completion_log', `checkin_${completionType}`, habit.id, { value: numValue, difficulty });
    setStatus(completionType);
    setTimeout(() => navigate(`/reflection/${habit.id}?status=${completionType}&value=${numValue}`), 2200);
  };

  const proceedMeasurable = () => { if (numValue > 0) proceedAfterInput(autoStatus); };

  // ── SCREEN: Chunk steps ────────────────────────────────────
  if (status === 'chunks' && hasChunks) {
    return (
      <div className="min-h-screen flex flex-col overflow-x-hidden"
        style={{ backgroundColor: color.btn + '55' }}>
        <div className="px-5 pt-10 pb-2">
          <button onClick={() => setStatus('input')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex-1 px-5 flex flex-col">
          <div className="text-center mt-4 mb-5">
            <span style={{ fontSize: '32px' }}>🧩</span>
            <h2 className="mt-3" style={{ color: '#202325' }}>{t('checkin.routineSteps')}</h2>
            <p className="mt-1" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)' }}>
              {t('checkin.checkOffCompleted')}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)' }}>{chunksCompleted}/{totalChunks} алхам</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: color.accent }}>
                {Math.round((chunksCompleted / totalChunks) * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.10)' }}>
              <motion.div
                animate={{ width: `${(chunksCompleted / totalChunks) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color.accent }}
              />
            </div>
          </div>

          {/* Chunk items */}
          <div className="flex flex-col gap-2.5">
            {habit.chunks!.map((chunk, i) => {
              const isDone = chunkSteps[chunk.id] || false;
              return (
                <motion.button key={chunk.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => toggleChunk(chunk.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-[20px] text-left transition-all"
                  style={{
                    backgroundColor: isDone ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                    boxShadow: isDone ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  <motion.div animate={{ scale: isDone ? 1 : 0.9 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      backgroundColor: isDone ? color.btn : 'rgba(0,0,0,0.08)',
                      border: isDone ? 'none' : '2px solid rgba(0,0,0,0.15)',
                    }}>
                    {isDone && <Check className="w-4 h-4" style={{ color: color.accent }} />}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p style={{
                      fontSize: '14px', color: isDone ? 'rgba(0,0,0,0.4)' : '#202325',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {chunk.name}
                    </p>
                    {chunk.duration && (
                      <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)' }}>{chunk.duration}</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {chunksCompleted > 0 && chunksCompleted < totalChunks && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center mt-4"
              style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)' }}>
              {totalChunks - chunksCompleted} алхам үлдлээ — чи чадна! 💪
            </motion.p>
          )}
          {chunksCompleted === totalChunks && totalChunks > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center mt-4"
              style={{ fontSize: '13px', color: color.accent, fontWeight: 600 }}>
              Бүх алхам дууслаа — гайхалтай! ✨
            </motion.p>
          )}

          <div className="mt-auto pb-10 pt-6">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={proceedAfterChunks}
              className="w-full py-4 rounded-[24px] flex items-center justify-center"
              style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, boxShadow: CTA_DARK.shadow, fontSize: 15, fontWeight: 600 }}>
              Үргэлжлүүлэх
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── SCREEN: Difficulty ────────────────────────────────────
  if (status === 'difficulty') {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <div className="px-5 pt-10 pb-2">
          <button onClick={() => setStatus(hasChunks ? 'chunks' : 'input')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex-1 px-5 flex flex-col">
          <div className="text-center mt-4 mb-8">
            <span style={{ fontSize: '32px' }}>🤔</span>
            <h2 className="mt-3">{t('checkin.howDidThatFeel')}</h2>
            <p className="mt-1" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)' }}>
              {t('checkin.helpsRhythm')}
            </p>
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            {difficultyOptions.map((opt, i) => {
              const isSelected = difficulty === opt.id;
              return (
                <motion.button key={opt.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setDifficulty(opt.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-[20px] transition-all w-[76px]"
                  style={{
                    backgroundColor: isSelected ? color.btn : 'rgba(0,0,0,0.04)',
                    boxShadow: isSelected ? `0 0 0 2px ${color.accent}` : 'none',
                  }}>
                  <span style={{ fontSize: '28px' }}>{opt.emoji}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? color.accent : 'rgba(0,0,0,0.45)',
                  }}>
                    {opt.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {difficulty && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center mt-5"
              style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>
              {difficulty === 'easy'      && 'Гоё урсгал — дадал улам хялбар болж байна! 🌿'}
              {difficulty === 'moderate'  && 'Сайн хүчин чармайлт — тогтмол байдал нь улам хялбар болгоно.'}
              {difficulty === 'hard'      && 'Хэцүү нь хамгийн их хүч чадал өгдөг. Ирлээ. 💪'}
              {difficulty === 'very-hard' && 'Чиний шударга байдал чухал. Илүү тохиромжтой болгож чадна.'}
            </motion.p>
          )}

          <div className="mt-auto pb-10 pt-6 flex flex-col gap-2">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => finishAndLog(true)}
              disabled={!difficulty}
              className="w-full py-4 rounded-[24px] flex items-center justify-center transition-all"
              style={difficulty
                ? { backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, boxShadow: CTA_DARK.shadow, fontSize: 15, fontWeight: 600 }
                : { backgroundColor: 'rgba(0,0,0,0.07)', color: 'rgba(0,0,0,0.3)', fontSize: 15 }}>
              {t('common.continue')}
            </motion.button>
            <button onClick={() => finishAndLog(false)}
              className="w-full py-3 text-center"
              style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)' }}>
              {t('checkin.skipThis')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── SCREEN: Result (done / partial / skipped) ─────────────
  if (status === 'done' || status === 'partial' || status === 'skipped') {
    const enc = encouragements[status][Math.floor(Math.random() * encouragements[status].length)];
    return (
      <div className="min-h-screen flex items-center justify-center px-6 overflow-hidden"
        style={{ backgroundColor: color.btn + '55' }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center max-w-[300px]"
        >
          {/* Emoji ring */}
          <div className="relative w-28 h-28 mx-auto mb-5">
            <motion.div
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.35, 1.1], opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color.btn }}
            />
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color.ring}55` }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span style={{ fontSize: '52px' }}>{enc.emoji}</span>
            </motion.div>
          </div>

          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }} style={{ color: '#202325' }}>
            {enc.title}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 }}
            style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(0,0,0,0.55)', marginTop: 8 }}>
            {enc.sub}
          </motion.p>

          {/* XP badge */}
          {xpGained > 0 && status !== 'skipped' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62 }}
              className="mt-5 flex justify-center">
              <div className="px-5 py-2.5 rounded-full flex items-center gap-2"
                style={{ backgroundColor: color.btn, boxShadow: `0 2px 12px ${color.ring}55` }}>
                <Zap className="w-4 h-4" style={{ color: color.accent }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: color.accent }}>
                  +{xpGained} XP
                </span>
              </div>
            </motion.div>
          )}

          {/* Dots loader */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            className="mt-7 flex items-center justify-center gap-1.5">
            {[0, 0.2, 0.4].map((d, i) => (
              <motion.div key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color.accent }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── SCREEN: Main input ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ backgroundColor: color.btn + '44' }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex-1 px-5 flex flex-col">

        {/* Habit identity */}
        <div className="text-center mt-3 mb-6">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="w-16 h-16 rounded-[20px] mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <span style={{ fontSize: '32px' }}>{tag?.emoji || '✨'}</span>
          </motion.div>
          <h2 style={{ color: '#202325' }}>{habit.title}</h2>
          <p className="mt-1" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.5)' }}>
            {t('checkin.howDidItGo')}
          </p>
          {habit.personalReason && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-3 px-4"
              style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>
              "{habit.personalReason}"
            </motion.p>
          )}
        </div>

        {/* ── Measurable: big number + pad ── */}
        {habit.type === 'measurable' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="flex flex-col gap-4 mb-4">

            {/* Number display */}
            <div className="rounded-[24px] p-5 text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.80)', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              <div className="flex items-end justify-center gap-2 mb-3">
                <span style={{
                  fontSize: 52, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1,
                  color: isAtTarget ? color.accent : numValue > 0 ? '#202325' : 'rgba(0,0,0,0.25)',
                  transition: 'color 0.2s',
                }}>
                  {numInput || '0'}
                </span>
                {habit.unit && (
                  <span style={{ fontSize: 18, color: 'rgba(0,0,0,0.4)', paddingBottom: 7 }}>
                    {habit.unit}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden mb-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                <motion.div
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.15 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: isAtTarget ? color.accent : color.ring }}
                />
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)' }}>хамгийн бага {min}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: isAtTarget ? color.accent : 'rgba(0,0,0,0.35)' }}>
                  {isAtTarget ? '✓ зорилт хүрлээ' : `зорилт: ${target}`}
                </span>
              </div>

              {/* Auto-status badge */}
              {numValue > 0 && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 pt-3 border-t flex items-center justify-center gap-2 px-3 py-2 rounded-[14px]"
                  style={{
                    borderColor: 'rgba(0,0,0,0.06)',
                    backgroundColor: isAtTarget ? color.soft : 'rgba(0,0,0,0.04)',
                  }}>
                  {isAtTarget
                    ? <Check className="w-4 h-4" style={{ color: color.accent }} />
                    : <Minus className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.4)' }} />}
                  <span style={{
                    fontSize: '13px', fontWeight: 600,
                    color: isAtTarget ? color.accent : 'rgba(0,0,0,0.5)',
                  }}>
                    {isAtTarget
                      ? t('checkin.doneForToday')
                      : `${t('checkin.partialStillCounts')} (${numValue}/${target})`}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Number pad */}
            <NumberPad input={numInput} onKey={handleNumKey} color={color} />
          </motion.div>
        ) : (
          /* ── Binary: simple description card ── */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[24px] p-6 mb-5 text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.80)', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.6)' }}>{t('checkin.didYouComplete')}</p>
            <p className="mt-1" style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)' }}>
              {t('checkin.anyEffort')}
            </p>
          </motion.div>
        )}

        {/* ── Action buttons ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-2.5 mt-auto pb-10">
          {habit.type === 'measurable' ? (
            <>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={proceedMeasurable}
                disabled={numValue <= 0}
                className="w-full py-4 rounded-[24px] flex items-center justify-center gap-2.5 transition-all"
                style={numValue > 0
                  ? { backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, boxShadow: CTA_DARK.shadow, fontSize: 15, fontWeight: 600 }
                  : { backgroundColor: 'rgba(0,0,0,0.07)', color: 'rgba(0,0,0,0.3)', fontSize: 15 }}>
                <Check className="w-5 h-5" />
                <span>{numValue > 0 ? t('checkin.logValue') : t('checkin.enterValue')}</span>
              </motion.button>
              <button onClick={() => proceedAfterInput('skipped')}
                className="w-full py-3 flex items-center justify-center gap-2"
                style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)' }}>
                <SkipForward className="w-4 h-4" />
                <span>{t('checkin.skipToday')}</span>
              </button>
            </>
          ) : (
            <>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => proceedAfterInput('done')}
                className="w-full py-4 rounded-[24px] flex items-center justify-center gap-2.5"
                style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text, boxShadow: CTA_DARK.shadow, fontSize: 15, fontWeight: 600 }}>
                <Check className="w-5 h-5" />
                <span>{t('checkin.doneForToday')}</span>
              </motion.button>
              <button onClick={() => proceedAfterInput('skipped')}
                className="w-full py-3 flex items-center justify-center gap-2"
                style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)' }}>
                <SkipForward className="w-4 h-4" />
                <span>{t('checkin.skipToday')}</span>
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
