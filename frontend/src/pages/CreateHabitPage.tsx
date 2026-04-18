import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, X, Sparkles, Bell, BellOff, Check, MapPin } from 'lucide-react';
import { LocationMapPicker } from '@/components/LocationMapPicker';
import { getHabitColor, PASTEL_LIST, CTA_DARK } from '@/lib/habit-colors';
import { useAuth } from '@/context/AuthContext';
import { habitsApi, type CreateHabitPayload } from '@/api/habits';
import type { Weekday } from '@/api/types';

const DAYS_MN = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const DAYS_EN: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const UNITS   = ['удаа', 'мин', 'хуудас', 'литр', 'км', 'шил', 'хэсэг'];

const ROUTINES   = ['өглөөний цайгаа уусны дараа', 'унтахын өмнө', 'хичээл дуусаад', 'гэртээ ирэхдээ', 'үдийн хоолны дараа', 'сэрэхдээ'];

const EMOJIS = ['🧘', '💪', '❤️', '📚', '🎨', '⚡', '🤝', '💰', '🏃', '🎵', '🌿', '🍎', '💧', '✍️', '🧠', '😴'];

const BENEFIT_SUGGESTIONS = [
  'Тайвшруулна', 'Төвлөрөл сайжруулна', 'Эрч хүч нэмнэ',
  'Эрүүл мэнд дэмжинэ', 'Өөрийгөө сайжруулна', 'Бүтээмж нэмэгдэнэ',
];

// ── Section wrapper ────────────────────
function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mx-5">
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        marginBottom: 8, paddingLeft: 2,
      }} className="text-muted-foreground">
        {label}
      </p>
      <div className="rounded-[20px] overflow-hidden bg-card" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
        {children}
      </div>
    </div>
  );
}

function FormRow({
  label, sublabel, children, divider = true,
}: {
  label: string; sublabel?: string; children: React.ReactNode; divider?: boolean;
}) {
  return (
    <>
      <div className="flex gap-3 px-4 py-3.5 items-center">
        <div className="shrink-0" style={{ minWidth: 90 }}>
          <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">{label}</p>
          {sublabel && <p style={{ fontSize: 11, marginTop: 1 }} className="text-muted-foreground">{sublabel}</p>}
        </div>
        <div className="flex-1 min-w-0 flex justify-end items-center">{children}</div>
      </div>
      {divider && <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />}
    </>
  );
}

function Divider() {
  return <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 16 }} />;
}

function Chip({ label, active, accentColor, onTap, small }: {
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
      }}
    >
      {label}
    </motion.button>
  );
}

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

function InlineInput({ value, onChange, placeholder, accentColor }: {
  value: string; onChange: (v: string) => void; placeholder: string; accentColor: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-transparent focus:outline-none"
      style={{
        fontSize: 14, fontWeight: 500,
        borderBottom: `1.5px solid ${value ? accentColor + '60' : 'rgba(0,0,0,0.15)'}`,
        paddingBottom: 1, width: Math.max(120, value.length * 9 + 20),
        maxWidth: '70%', color: value ? undefined : 'rgba(0,0,0,0.3)',
      }}
    />
  );
}

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



// ── Main ───────────────────────────────────────────────────────
export function CreateHabitPage() {
  const navigate  = useNavigate();
  const { userId } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Core sentence fields
  const [title, setTitle]     = useState('');
  const [precedingRoutine, setPrecedingRoutine] = useState('');
  const [reason, setReason] = useState('');

  // Appearance
  const [colorId, setColorId] = useState('lavender');
  const [selectedEmoji, setSelectedEmoji] = useState('🧘');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Benefits
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState('');

  // Schedule
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([...DAYS_EN]);

  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [timeWindows, setTimeWindows] = useState<Array<{ start: string; end: string }>>([]);
  const [selectedLocations, setSelectedLocations] = useState<Array<{ lat: number; lng: number; label: string }>>([]);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const addTimeWindow = () => setTimeWindows(p => [...p, { start: '08:00', end: '10:00' }]);
  const removeTimeWindow = (i: number) => setTimeWindows(p => p.filter((_, idx) => idx !== i));
  const updateTimeWindow = (i: number, field: 'start' | 'end', val: string) =>
    setTimeWindows(p => p.map((tw, idx) => idx === i ? { ...tw, [field]: val } : tw));

  // Target
  const [habitType, setHabitType] = useState<'binary' | 'measurable'>('measurable');
  const [targetNum, setTargetNum]   = useState('1');
  const [minNum, setMinNum]           = useState('');
  const [targetUnit, setTargetUnit]   = useState('удаа');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const color  = getHabitColor(colorId);

  const toggleDay = (day: Weekday) =>
    setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const removeLocation = (label: string) =>
    setSelectedLocations(p => p.filter(l => l.label !== label));

  const addBenefit = (b: string) => {
    if (!benefits.includes(b)) setBenefits(p => [...p, b]);
  };
  const removeBenefit = (b: string) => setBenefits(p => p.filter(x => x !== b));



  const handleSave = async () => {
    if (!userId || saving) return;
    setSaving(true);

    // Build reminder settings
    const twPayload = timeWindows
      .filter(tw => tw.start && tw.end)
      .map(tw => ({ startTime: tw.start, endTime: tw.end }));

    const payload: CreateHabitPayload = {
      title: title.trim() || 'Шинэ дадал',
      precedingRoutine: precedingRoutine || undefined,
      reason: reason || undefined,
      color: colorId,
      iconType: 'EMOJI',
      iconValue: selectedEmoji,
      benefits: benefits.length > 0 ? benefits : undefined,
      measurementUnit: habitType === 'binary' ? 'удаа' : targetUnit,
      targetValue: habitType === 'binary' ? 1 : (parseFloat(targetNum) || 1),
      minimumTarget: (habitType === 'measurable' && minNum) ? parseFloat(minNum) : 1,
      startDate: new Date().toISOString().split('T')[0],
      scheduleDays: selectedDays.map(weekday => ({ weekday })),
      reminder: {
        enabled: reminderEnabled,
        timeWindows: twPayload.length > 0 ? twPayload : undefined,
        locations: selectedLocations.length > 0 ? selectedLocations.map(l => l.label) : undefined,
      },
    };

    try {
      await habitsApi.createHabit(userId, payload);
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1400);
    } catch (err) {
      console.error('Failed to create habit:', err);
      setSaving(false);
    }
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
          <p style={{ fontSize: 20, fontWeight: 700 }} className="text-foreground">
            Дадал нэмэгдлээ! 🌱
          </p>
          <p style={{ fontSize: 13, marginTop: 6 }} className="text-muted-foreground">
            Дадлаа эхлүүлэхэд бэлэн
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background px-5 pt-13 pb-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full shrink-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <p className="text-foreground" style={{ fontSize: 16, fontWeight: 700, minWidth: 60, color: title.trim() ? undefined : 'rgba(0,0,0,0.3)' }}>
              {title.trim() || 'Дадлын нэр'}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmojiPicker(p => !p)}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: color.btn, fontSize: 18 }}>
            {selectedEmoji}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-5">

        {/* Sentence builder — flat inline words */}
        <div className="mx-5">
          <motion.div
            className="rounded-[20px] bg-card px-4 py-4"
            animate={{ boxShadow: `0 1px 10px ${color.accent}18` }}
            style={{ border: `1.5px solid ${color.accent}30` }}
          >
            <p style={{ fontSize: 14, lineHeight: 2.4 }} className="text-foreground">
              <InlineInput
                value={precedingRoutine}
                onChange={setPrecedingRoutine}
                placeholder="өмнөх үйлдэл"
                accentColor={color.accent}
              />
              <span style={{ fontWeight: 700 }}> дараа </span>
              <InlineInput
                value={title}
                onChange={setTitle}
                placeholder="дадал"
                accentColor={color.accent}
              />
              <span style={{ fontWeight: 700 }}> хийнэ.</span>
            </p>
            <p style={{ fontSize: 14, lineHeight: 2.4, marginTop: 2 }} className="text-foreground">
              <span style={{ fontWeight: 700 }}>Ингэснээр би: </span>
              <InlineInput
                value={reason}
                onChange={setReason}
                placeholder="өдрийг тайван эхлүүлэхийн тулд"
                accentColor={color.accent}
              />
            </p>
          </motion.div>
        </div>

        {/* Section 2: ХАРАГДАХ ТӨРХ */}
        <FormSection label="ХАРАГДАХ ТӨРХ">
          {/* Emoji */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Дүрс</p>
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(p => !p)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color.btn, fontSize: 22 }}>
                {selectedEmoji}
              </motion.button>
            </div>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.16 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 pb-2">
                    {EMOJIS.map(e => (
                      <motion.button key={e} whileTap={{ scale: 0.85 }}
                        onClick={() => { setSelectedEmoji(e); setShowEmojiPicker(false); }}
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          fontSize: 20,
                          backgroundColor: selectedEmoji === e ? color.btn : 'rgba(0,0,0,0.04)',
                          boxShadow: selectedEmoji === e ? `0 0 0 2px ${color.accent}60` : 'none',
                        }}>
                        {e}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Divider />

          {/* Color */}
          <div className="px-4 py-3">
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }} className="text-foreground">Өнгө</p>
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
                    <span style={{ fontSize: 9, fontWeight: colorId === c.id ? 600 : 400 }}
                      className="text-muted-foreground">
                      {c.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* Section 3: АШИГ ТУС */}
        <FormSection label="АШИГ ТУС">
          <div className="px-4 py-3 flex flex-col gap-3">

            {/* Custom text input */}
            <div className="flex items-center gap-2">
              <input
                value={benefitInput}
                onChange={e => setBenefitInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && benefitInput.trim()) {
                    addBenefit(benefitInput.trim());
                    setBenefitInput('');
                  }
                }}
                placeholder="Ашиг тус нэмэх..."
                className="flex-1 bg-transparent focus:outline-none text-foreground"
                style={{ fontSize: 13, borderBottom: '1.5px solid rgba(0,0,0,0.12)', paddingBottom: 4 }}
              />
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (benefitInput.trim()) {
                    addBenefit(benefitInput.trim());
                    setBenefitInput('');
                  }
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: benefitInput.trim() ? color.btn : 'rgba(0,0,0,0.05)' }}>
                <Plus className="w-3.5 h-3.5" style={{ color: benefitInput.trim() ? color.accent : 'rgba(0,0,0,0.25)' }} />
              </motion.button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2">
              {BENEFIT_SUGGESTIONS.filter(b => !benefits.includes(b)).map(b => (
                <button key={b} onClick={() => addBenefit(b)}
                  className="px-3 py-1.5 rounded-full"
                  style={{ fontSize: 12, backgroundColor: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.7)' }}>
                  {b}
                </button>
              ))}
            </div>

            {/* Selected */}
            {benefits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {benefits.map(b => (
                  <TagPill key={b} label={b} onRemove={() => removeBenefit(b)} color={color.btn} />
                ))}
              </div>
            )}
          </div>
        </FormSection>

        {/* Section 4: ХИЙХ ӨДРҮҮД */}
        <FormSection label="ХИЙХ ӨДРҮҮД">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Өдрүүд</p>
              <div className="flex gap-2">
                <button onClick={() => setSelectedDays([...DAYS_EN])}
                  style={{ fontSize: 11, color: color.accent, fontWeight: 600 }}>
                  Бүгд
                </button>
                <span style={{ fontSize: 11 }} className="text-muted-foreground">·</span>
                <button onClick={() => setSelectedDays(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'])}
                  style={{ fontSize: 11, fontWeight: 500 }} className="text-muted-foreground">
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
                    }}>
                    {mn}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* Section 5: САНУУЛГА */}
        <FormSection label="САНУУЛГА">
          <FormRow label="Сануулга идэвхтэй">
            <div className="flex items-center gap-2">
              {reminderEnabled
                ? <Bell className="w-4 h-4" style={{ color: color.accent }} />
                : <BellOff className="w-4 h-4 text-muted-foreground" />}
              <Toggle value={reminderEnabled} onChange={setReminderEnabled} accentColor={color.accent} />
            </div>
          </FormRow>

          <AnimatePresence>
            {reminderEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                {/* Time windows — multiple */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Цаг</p>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={addTimeWindow}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: color.btn }}>
                      <Plus className="w-3.5 h-3.5" style={{ color: color.accent }} />
                    </motion.button>
                  </div>

                  {timeWindows.length === 0 && (
                    <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                      + дарж цагийн хүрээ нэмнэ
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    {timeWindows.map((tw, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="time" value={tw.start}
                          onChange={e => updateTimeWindow(i, 'start', e.target.value)}
                          className="flex-1 rounded-xl px-3 py-1.5 bg-transparent text-foreground focus:outline-none"
                          style={{ fontSize: 13, fontWeight: 600, border: '1px solid rgba(0,0,0,0.1)' }} />
                        <span className="text-muted-foreground" style={{ fontSize: 12 }}>–</span>
                        <input type="time" value={tw.end}
                          onChange={e => updateTimeWindow(i, 'end', e.target.value)}
                          className="flex-1 rounded-xl px-3 py-1.5 bg-transparent text-foreground focus:outline-none"
                          style={{ fontSize: 13, fontWeight: 600, border: '1px solid rgba(0,0,0,0.1)' }} />
                        <button onClick={() => removeTimeWindow(i)}
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Map-based location picker */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Байршил</p>
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => setShowMapPicker(p => !p)}
                      className="px-3 py-1.5 rounded-full"
                      style={{ fontSize: 12, color: color.accent, fontWeight: 600, backgroundColor: color.btn }}>
                      {showMapPicker ? 'Хаах' : '+ Газрын зургаас'}
                    </motion.button>
                  </div>

                  {/* Selected locations */}
                  {selectedLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedLocations.map(loc => (
                        <div key={loc.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: color.btn, fontSize: 12, color: '#202325', fontWeight: 500 }}>
                          <MapPin className="w-3 h-3" style={{ color: color.accent }} />
                          {loc.label}
                          <button onClick={() => removeLocation(loc.label)}
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showMapPicker && (
                    <LocationMapPicker
                      accentColor={color.accent}
                      btnColor={color.btn}
                      onConfirm={(loc) => {
                        if (!selectedLocations.find(l => l.label === loc.label)) {
                          setSelectedLocations(p => [...p, loc]);
                        }
                        setShowMapPicker(false);
                      }}
                      onClose={() => setShowMapPicker(false)}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

        {/* Section 6: ХЭМЖИЛТ */}
        <FormSection label="ХЭМЖИЛТ">
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

          <AnimatePresence>
            {habitType === 'measurable' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <Divider />

                <FormRow label="Зорилт" sublabel="Дуусгах хэмжээ">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-9 rounded-[12px] flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                      <input
                        type="number"
                        value={targetNum}
                        onChange={e => setTargetNum(e.target.value)}
                        className="bg-transparent focus:outline-none text-center w-full text-foreground"
                        style={{ fontSize: 14, fontWeight: 600 }}
                      />
                    </div>
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

                <FormRow label="Хамгийн бага" sublabel="Ядаж энэ" divider={false}>
                  <div className="w-16 h-9 rounded-[12px] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                    <input
                      type="number"
                      value={minNum}
                      onChange={e => setMinNum(e.target.value)}
                      placeholder="—"
                      className="bg-transparent focus:outline-none text-center w-full text-foreground"
                      style={{ fontSize: 14, fontWeight: 600 }}
                    />
                  </div>
                </FormRow>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-10 pt-5 z-20"
        style={{ background: 'linear-gradient(to top, var(--background) 65%, transparent)' }}>
        <motion.button
          whileTap={{ scale: 0.96 }} onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-10 py-3.5 rounded-full disabled:opacity-50"
          style={{ backgroundColor: CTA_DARK.bg, boxShadow: CTA_DARK.shadow, minWidth: 200 }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: CTA_DARK.text }}>
            {saving ? '...' : 'Хадгалах'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
