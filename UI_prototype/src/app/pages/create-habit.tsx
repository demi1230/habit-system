import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, X, Sparkles, Bell, BellOff, Check } from 'lucide-react';
import { addHabit, getGoalTags, type HabitChunk } from '../store';
import { getHabitColor, PASTEL_LIST, CTA_DARK } from '../lib/habit-colors';

const DAYS_MN = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const UNITS   = ['удаа', 'мин', 'хуудас', 'литр', 'км', 'шил', 'хэсэг'];
const LOCATIONS  = ['Гэр 🏠', 'Оффис 💼', 'Сургууль 🏫', 'Биеийн тамир 💪', 'Гадаа 🌿'];
const ROUTINES   = ['өглөөний цайгаа уусны дараа', 'унтахын өмнө', 'хичээл дуусаад', 'гэртээ ирэхдээ', 'үдийн хоолны дараа'];
const TIME_SLOTS = ['06:00–08:00', '08:00–10:00', '12:00–14:00', '17:00–19:00', '19:00–21:00', '21:00–23:00'];

// ── Section wrapper (label + grouped card) ────────────────────
function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mx-5">
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        color: 'rgba(0,0,0,0.35)', marginBottom: 8, paddingLeft: 2,
      }}>
        {label}
      </p>
      <div className="rounded-[20px] overflow-hidden bg-card" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
        {children}
      </div>
    </div>
  );
}

// ── Row inside a section ──────────────────────────────────────
function FormRow({
  label, sublabel, children, divider = true, alignTop = false,
}: {
  label: string; sublabel?: string; children: React.ReactNode; divider?: boolean; alignTop?: boolean;
}) {
  return (
    <>
      <div className={`flex gap-3 px-4 py-3.5 ${alignTop ? 'items-start' : 'items-center'}`}>
        <div className="shrink-0" style={{ minWidth: 90 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#202325' }}>{label}</p>
          {sublabel && <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 1 }}>{sublabel}</p>}
        </div>
        <div className="flex-1 min-w-0 flex justify-end items-center">{children}</div>
      </div>
      {divider && <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />}
    </>
  );
}

// ── Thin separator within a section ──────────────────────────
function Divider() {
  return <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />;
}

// ── Chip pill ─────────────────────────────────────────────────
function Chip({
  label, active, accentColor, onTap, small,
}: {
  label: string; active: boolean; accentColor: string; onTap: () => void; small?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }} onClick={onTap}
      className="rounded-full transition-colors"
      style={{
        fontSize: small ? 11 : 12, fontWeight: active ? 600 : 400,
        padding: small ? '4px 10px' : '5px 12px',
        backgroundColor: active ? accentColor : 'rgba(0,0,0,0.06)',
        color: active ? '#202325' : 'rgba(0,0,0,0.5)',
        boxShadow: active ? `0 0 0 1.5px ${accentColor}80` : 'none',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </motion.button>
  );
}

// ── Inline options (expandable) ───────────────────────────────
function InlineOptions({ options, onSelect, onClose }: {
  options: string[]; onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.16 }}
      className="overflow-hidden"
    >
      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
        {options.map(o => (
          <button key={o} onClick={() => { onSelect(o); onClose(); }}
            className="px-3 py-1.5 rounded-full text-left"
            style={{ fontSize: 12, backgroundColor: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.7)' }}>
            {o}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Selected tag pill ─────────────────────────────────────────
function TagPill({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: color, fontSize: 12, color: '#202325', fontWeight: 500 }}>
      {label}
      <button onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ value, onChange, accentColor }: {
  value: boolean; onChange: (v: boolean) => void; accentColor: string;
}) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative rounded-full shrink-0"
      style={{
        width: 44, height: 26,
        backgroundColor: value ? accentColor : 'rgba(0,0,0,0.15)',
        transition: 'background-color 0.2s',
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-[3px] w-5 h-5 rounded-full bg-white"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
      />
    </motion.button>
  );
}

// ── Live Preview Sentence ──────────────────────────────────────
function PreviewSentence({ sentence }: { sentence: Array<{ text: string; filled: boolean }> }) {
  return (
    <p style={{ fontSize: 13, lineHeight: 1.75, fontStyle: 'italic', color: '#202325' }}>
      {sentence.map((part, i) => (
        <span key={i} style={{
          color: part.filled ? '#202325' : 'rgba(0,0,0,0.28)',
          transition: 'color 0.2s',
        }}>
          {part.text}
        </span>
      ))}
    </p>
  );
}

// ── Main ───────────────────────────────────────────────────────
export function CreateHabitPage() {
  const navigate  = useNavigate();
  const goalTags  = getGoalTags();
  const [showSuccess, setShowSuccess] = useState(false);

  // Core
  const [title, setTitle]     = useState('');
  const [colorId, setColorId] = useState('lavender');
  const [goalTag, setGoalTag] = useState('mindfulness');

  // Why
  const [reason, setReason] = useState('');

  // Schedule
  const [selectedDays, setSelectedDays] = useState<string[]>([...DAYS_EN]);

  // Time window
  const [selectedTime, setSelectedTime]     = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Cue context
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocPicker, setShowLocPicker]       = useState(false);
  const [selectedRoutine, setSelectedRoutine]   = useState('');
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);

  // Target
  const [habitType, setHabitType]     = useState<'binary' | 'measurable'>('measurable');
  const [targetNum, setTargetNum]     = useState('1');
  const [minNum, setMinNum]           = useState('');
  const [targetUnit, setTargetUnit]   = useState('удаа');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  // Reminder
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime]       = useState('');
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  // Small steps
  const [chunks, setChunks]             = useState<HabitChunk[]>([]);
  const [showAddChunk, setShowAddChunk] = useState(false);
  const [newChunkName, setNewChunkName] = useState('');

  const color    = getHabitColor(colorId);
  const tagObj   = goalTags.find(t => t.id === goalTag);

  const toggleDay = (en: string) =>
    setSelectedDays(p => p.includes(en) ? p.filter(d => d !== en) : [...p, en]);

  const addChunk = () => {
    if (!newChunkName.trim()) return;
    setChunks(p => [...p, { id: Date.now().toString(), name: newChunkName.trim() }]);
    setNewChunkName('');
    setShowAddChunk(false);
  };

  // ── Live sentence ────────────────────────────────────────────
  const previewParts = useMemo(() => {
    const titleStr = title.trim();
    const reasonStr = reason.trim();
    const cueStr = selectedRoutine || '';
    const timeStr = selectedTime || '';

    const daysLabel =
      selectedDays.length === 7 ? 'өдөр бүр' :
      selectedDays.length === 0 ? 'ямар ч өдөр' :
      selectedDays.length === 5 && !selectedDays.includes('Sat') && !selectedDays.includes('Sun')
        ? 'ажлын өдрүүдэд' :
      `долоо хоногт ${selectedDays.length} өдөр`;

    const targetLabel = habitType === 'binary'
      ? '1 удаа'
      : `${targetNum || '…'} ${targetUnit}`;

    return [
      { text: 'Би ', filled: true },
      { text: titleStr || '(дадлын нэр)', filled: !!titleStr },
      { text: ' хийнэ', filled: true },
      { text: reasonStr ? ` — ${reasonStr} учраас` : ' — (яагаад?)', filled: !!reasonStr },
      { text: '. ', filled: true },
      { text: daysLabel.charAt(0).toUpperCase() + daysLabel.slice(1), filled: selectedDays.length > 0 },
      { text: cueStr ? `, ${cueStr} дараа` : timeStr ? `, ${timeStr}` : '', filled: !!(cueStr || timeStr) },
      { text: ' ', filled: true },
      { text: targetLabel, filled: !!(targetNum && habitType) },
      { text: ' хийхийг зорьж байна.', filled: true },
    ].filter(p => p.text !== '');
  }, [title, reason, selectedDays, selectedRoutine, selectedTime, habitType, targetNum, targetUnit]);

  const handleSave = () => {
    addHabit({
      id: Date.now().toString(),
      title: title.trim() || 'Шинэ дадал',
      description: reason || '',
      goalTag,
      habitColor: colorId,
      type: habitType,
      unit: habitType === 'measurable' ? targetUnit : undefined,
      targetValue: habitType === 'measurable' ? (parseFloat(targetNum) || 1) : undefined,
      minValue: (habitType === 'measurable' && minNum) ? parseFloat(minNum) : undefined,
      frequency: 'daily',
      days: selectedDays.length > 0 ? selectedDays : [...DAYS_EN],
      startDate: new Date().toISOString().split('T')[0],
      timeWindow: selectedTime || undefined,
      location: selectedLocation || undefined,
      precedingRoutine: selectedRoutine || undefined,
      personalReason: reason || undefined,
      chunks: chunks.length > 0 ? chunks : undefined,
      reminderEnabled,
      reminderWindow: reminderEnabled ? (reminderTime || selectedTime || undefined) : undefined,
      archived: false,
      createdAt: new Date().toISOString().split('T')[0],
      streak: 0,
      completionRate: 0,
      completions: [],
    });
    setShowSuccess(true);
    setTimeout(() => navigate('/dashboard'), 1400);
  };

  // ── Success screen ────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: color.btn }}
          >
            <Sparkles className="w-9 h-9" style={{ color: color.accent }} />
          </motion.div>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>
            Дадал нэмэгдлээ! 🌱
          </p>
          <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.42)', marginTop: 6 }}>
            Дадлаа эхлүүлэхэд бэлэн
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-background px-5 pt-13 pb-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#202325' }}>Шинэ дадал</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-5">

        {/* ── Live preview ── */}
        <div className="mx-5">
          <motion.div
            className="rounded-[20px] px-4 py-3.5"
            animate={{ backgroundColor: color.btn + 'cc' }}
            transition={{ duration: 0.4 }}
            style={{ border: `1px solid ${color.accent}28` }}
          >
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              color: color.accent, marginBottom: 6, opacity: 0.9,
            }}>
              УРЬДЧИЛСАН ХАРАГДАЦ
            </p>
            <PreviewSentence sentence={previewParts} />
          </motion.div>
        </div>

        {/* ── Section 1: Дадал ── */}
        <FormSection label="ДАДАЛ">
          {/* Name */}
          <div className="px-4 py-3.5">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Дадлын нэр..."
              className="w-full bg-transparent focus:outline-none"
              style={{ fontSize: 15, fontWeight: 600, color: '#202325' }}
              autoFocus
            />
          </div>

          <Divider />

          {/* Color */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ fontSize: 13, fontWeight: 500, color: '#202325' }}>Өнгө</p>
            </div>
            <div className="flex gap-3">
              {PASTEL_LIST.map(c => {
                const clr = getHabitColor(c.id);
                return (
                  <motion.button key={c.id} whileTap={{ scale: 0.86 }}
                    onClick={() => setColorId(c.id)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                      style={{
                        backgroundColor: clr.btn,
                        boxShadow: colorId === c.id ? `0 0 0 2.5px white, 0 0 0 4px ${clr.accent}` : 'none',
                      }}>
                      {colorId === c.id && (
                        <Check className="w-3 h-3" style={{ color: clr.accent }} strokeWidth={3} />
                      )}
                    </div>
                    <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', fontWeight: colorId === c.id ? 600 : 400 }}>
                      {c.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* Category */}
          <div className="px-4 py-3">
            <p style={{ fontSize: 13, fontWeight: 500, color: '#202325', marginBottom: 10 }}>Ангилал</p>
            <div className="flex flex-wrap gap-2">
              {goalTags.map(tag => {
                const isActive = goalTag === tag.id;
                return (
                  <motion.button key={tag.id} whileTap={{ scale: 0.9 }}
                    onClick={() => setGoalTag(tag.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: isActive ? color.btn : 'rgba(0,0,0,0.05)',
                      boxShadow: isActive ? `0 0 0 1.5px ${color.accent}60` : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{tag.emoji}</span>
                    <span style={{
                      fontSize: 12, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#202325' : 'rgba(0,0,0,0.5)',
                    }}>{tag.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* ── Section 2: Яагаад ── */}
        <FormSection label="ЯАГААД">
          <div className="px-4 py-3.5">
            <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginBottom: 6, fontWeight: 500 }}>
              Энэ дадлыг яагаад хэвшүүлэхийг хүсч байна вэ?
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Жишээ: илүү эрч хүчтэй, эрүүл байхын тулд..."
              rows={2}
              className="w-full bg-transparent focus:outline-none resize-none"
              style={{ fontSize: 13, color: '#202325', lineHeight: 1.6 }}
            />
          </div>
        </FormSection>

        {/* ── Section 3: Хуваарь ── */}
        <FormSection label="ХУВААРЬ">
          {/* Day selector */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ fontSize: 13, fontWeight: 500, color: '#202325' }}>Өдрүүд</p>
              <div className="flex gap-2">
                <button onClick={() => setSelectedDays([...DAYS_EN])}
                  style={{ fontSize: 11, color: color.accent, fontWeight: 600 }}>
                  Бүгд
                </button>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>·</span>
                <button onClick={() => setSelectedDays(['Mon','Tue','Wed','Thu','Fri'])}
                  style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                  Ажлын
                </button>
              </div>
            </div>
            <div className="flex gap-1">
              {DAYS_MN.map((mn, i) => {
                const en = DAYS_EN[i];
                const active = selectedDays.includes(en);
                return (
                  <motion.button key={en} whileTap={{ scale: 0.82 }}
                    onClick={() => toggleDay(en)}
                    className="flex-1 py-2 rounded-[12px] flex items-center justify-center"
                    style={{
                      backgroundColor: active ? color.btn : 'rgba(0,0,0,0.04)',
                      boxShadow: active ? `0 0 0 1.5px ${color.accent}50` : 'none',
                      fontSize: 11, fontWeight: active ? 700 : 400,
                      color: active ? '#202325' : 'rgba(0,0,0,0.38)',
                      transition: 'all 0.14s',
                    }}>
                    {mn}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* Time window */}
          <div>
            <div className="px-4 py-3 flex items-center justify-between">
              <p style={{ fontSize: 13, fontWeight: 500, color: '#202325' }}>Цаг</p>
              <div className="flex items-center gap-2">
                {selectedTime ? (
                  <TagPill label={selectedTime} onRemove={() => setSelectedTime('')} color={color.btn} />
                ) : (
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTimePicker(p => !p)}
                    className="px-3 py-1.5 rounded-full"
                    style={{ fontSize: 12, color: color.accent, fontWeight: 600, backgroundColor: color.btn }}>
                    + Нэмэх
                  </motion.button>
                )}
              </div>
            </div>
            <AnimatePresence>
              {showTimePicker && (
                <InlineOptions options={TIME_SLOTS}
                  onSelect={v => { setSelectedTime(v); setShowTimePicker(false); }}
                  onClose={() => setShowTimePicker(false)} />
              )}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* ── Section 4: Дохио ── */}
        <FormSection label="ДОХИО — КЕН ДАРАА ХИЙХ ВЭ">
          {/* Location */}
          <div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#202325' }}>Байршил</p>
                <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 1 }}>Хаана хийх вэ?</p>
              </div>
              <div>
                {selectedLocation ? (
                  <TagPill label={selectedLocation} onRemove={() => setSelectedLocation('')} color={color.btn} />
                ) : (
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => { setShowLocPicker(p => !p); setShowRoutinePicker(false); }}
                    className="px-3 py-1.5 rounded-full"
                    style={{ fontSize: 12, color: color.accent, fontWeight: 600, backgroundColor: color.btn }}>
                    + Нэмэх
                  </motion.button>
                )}
              </div>
            </div>
            <AnimatePresence>
              {showLocPicker && (
                <InlineOptions options={LOCATIONS}
                  onSelect={v => { setSelectedLocation(v); setShowLocPicker(false); }}
                  onClose={() => setShowLocPicker(false)} />
              )}
            </AnimatePresence>
          </div>

          <Divider />

          {/* Preceding routine */}
          <div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#202325' }}>Өмнөх хэрэглүүр</p>
                <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 1 }}>Юуны дараа хийх вэ?</p>
              </div>
              <div>
                {selectedRoutine ? (
                  <TagPill label={selectedRoutine} onRemove={() => setSelectedRoutine('')} color={color.btn} />
                ) : (
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => { setShowRoutinePicker(p => !p); setShowLocPicker(false); }}
                    className="px-3 py-1.5 rounded-full"
                    style={{ fontSize: 12, color: color.accent, fontWeight: 600, backgroundColor: color.btn }}>
                    + Нэмэх
                  </motion.button>
                )}
              </div>
            </div>
            <AnimatePresence>
              {showRoutinePicker && (
                <InlineOptions options={ROUTINES}
                  onSelect={v => { setSelectedRoutine(v); setShowRoutinePicker(false); }}
                  onClose={() => setShowRoutinePicker(false)} />
              )}
            </AnimatePresence>
          </div>
        </FormSection>

        {/* ── Section 5: Зорилт ── */}
        <FormSection label="ЗОРИЛТ">
          {/* Type toggle */}
          <FormRow label="Төрөл">
            <div className="flex gap-1.5">
              {(['binary', 'measurable'] as const).map(t => (
                <Chip key={t}
                  label={t === 'binary' ? 'Тийм/Үгүй' : 'Хэмжигдэхүйц'}
                  active={habitType === t} accentColor={color.btn} small
                  onTap={() => setHabitType(t)} />
              ))}
            </div>
          </FormRow>

          {/* Target + min (only for measurable) */}
          <AnimatePresence>
            {habitType === 'measurable' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <Divider />

                {/* Target number */}
                <FormRow label="Зорилт" sublabel="Дуусгах хэмжээ">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-9 rounded-[12px] flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                      <input
                        type="number"
                        value={targetNum}
                        onChange={e => setTargetNum(e.target.value)}
                        className="bg-transparent focus:outline-none text-center w-full"
                        style={{ fontSize: 14, fontWeight: 600, color: '#202325' }}
                      />
                    </div>
                    {/* Unit picker */}
                    <motion.button whileTap={{ scale: 0.92 }}
                      onClick={() => setShowUnitPicker(p => !p)}
                      className="h-9 px-3 rounded-[12px] flex items-center gap-1"
                      style={{ backgroundColor: color.btn }}>
                      <span style={{ fontSize: 13, color: '#202325', fontWeight: 500 }}>{targetUnit}</span>
                    </motion.button>
                  </div>
                </FormRow>

                <AnimatePresence>
                  {showUnitPicker && (
                    <InlineOptions options={UNITS}
                      onSelect={v => { setTargetUnit(v); setShowUnitPicker(false); }}
                      onClose={() => setShowUnitPicker(false)} />
                  )}
                </AnimatePresence>

                <Divider />

                {/* Min target */}
                <FormRow label="Хамгийн бага" sublabel="Ядаж энэ" divider={false}>
                  <div className="w-16 h-9 rounded-[12px] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                    <input
                      type="number"
                      value={minNum}
                      onChange={e => setMinNum(e.target.value)}
                      placeholder="—"
                      className="bg-transparent focus:outline-none text-center w-full"
                      style={{ fontSize: 14, fontWeight: 600, color: '#202325' }}
                    />
                  </div>
                </FormRow>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

        {/* ── Section 6: Сануулга ── */}
        <FormSection label="САНУУЛГА">
          <FormRow label="Сануулга идэвхтэй" divider={reminderEnabled}>
            <div className="flex items-center gap-2">
              {reminderEnabled
                ? <Bell className="w-4 h-4" style={{ color: color.accent }} />
                : <BellOff className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.3)' }} />}
              <Toggle value={reminderEnabled} onChange={setReminderEnabled} accentColor={color.accent} />
            </div>
          </FormRow>

          <AnimatePresence>
            {reminderEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.16 }}
                className="overflow-hidden"
              >
                <div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#202325' }}>Цагийн хүрээ</p>
                    <div>
                      {reminderTime ? (
                        <TagPill label={reminderTime} onRemove={() => setReminderTime('')} color={color.btn} />
                      ) : (
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => setShowReminderPicker(p => !p)}
                          className="px-3 py-1.5 rounded-full"
                          style={{ fontSize: 12, color: color.accent, fontWeight: 600, backgroundColor: color.btn }}>
                          + Сонгох
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {showReminderPicker && (
                      <InlineOptions options={TIME_SLOTS}
                        onSelect={v => { setReminderTime(v); setShowReminderPicker(false); }}
                        onClose={() => setShowReminderPicker(false)} />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

        {/* ── Section 7: Жижиглэх алхмуудад ── */}
        <FormSection label="ЖИЖИГЛЭХ АЛХМУУДАД">
          {/* Steps list */}
          <div className="px-4 pt-3.5">
            <AnimatePresence>
              {chunks.map((c, i) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex items-center gap-3 mb-2.5"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color.btn, fontSize: 11, fontWeight: 700, color: color.accent }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: '#202325', flex: 1 }}>{c.name}</span>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setChunks(p => p.filter(x => x.id !== c.id))}
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
                    <X className="w-3 h-3" style={{ color: '#474747' }} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            {chunks.length === 0 && !showAddChunk && (
              <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.32)', marginBottom: 10, lineHeight: 1.55 }}>
                Том зорилтыг жижиг алхмуудад хувааж дадлыг хялбар болгоно.
              </p>
            )}
          </div>

          {/* Add chunk input */}
          <AnimatePresence>
            {showAddChunk && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-4"
              >
                <div className="flex items-center gap-2 pb-3">
                  <input
                    value={newChunkName}
                    onChange={e => setNewChunkName(e.target.value)}
                    placeholder="Алхмын нэр..."
                    onKeyDown={e => e.key === 'Enter' && addChunk()}
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-[14px] focus:outline-none"
                    style={{
                      fontSize: 13, backgroundColor: 'rgba(0,0,0,0.05)',
                      border: `1.5px solid ${color.btn}`, color: '#202325',
                    }}
                  />
                  <motion.button whileTap={{ scale: 0.88 }} onClick={addChunk}
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color.btn }}>
                    <Plus className="w-4 h-4" style={{ color: color.accent }} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add button */}
          <div>
            {(chunks.length > 0 || showAddChunk) && <Divider />}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddChunk(p => !p)}
              className="w-full px-4 py-3.5 flex items-center gap-2.5"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color.btn }}>
                <Plus className="w-3.5 h-3.5" style={{ color: color.accent }} />
              </div>
              <span style={{ fontSize: 13, color: color.accent, fontWeight: 600 }}>
                {showAddChunk ? 'Болих' : 'Алхам нэмэх'}
              </span>
            </motion.button>
          </div>
        </FormSection>
      </div>

      {/* ── Save button ── */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-10 pt-5 z-20"
        style={{ background: 'linear-gradient(to top, var(--background) 65%, transparent)' }}>
        <motion.button
          whileTap={{ scale: 0.96 }} onClick={handleSave}
          className="flex items-center justify-center gap-2 px-10 py-3.5 rounded-full"
          style={{ backgroundColor: CTA_DARK.bg, boxShadow: CTA_DARK.shadow, minWidth: 200 }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: CTA_DARK.text }}>Хадгалах</span>
        </motion.button>
      </div>
    </div>
  );
}
