import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, X, Sparkles, Bell, BellOff, Check } from 'lucide-react';
import { getHabitColor, PASTEL_LIST, CTA_DARK } from '@/lib/habit-colors';
import { useAuth } from '@/context/AuthContext';
import { habitsApi, type CreateHabitPayload } from '@/api/habits';
import type { Weekday } from '@/api/types';

const DAYS_MN = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const DAYS_EN: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const UNITS   = ['удаа', 'мин', 'хуудас', 'литр', 'км', 'шил', 'хэсэг'];
const LOCATIONS  = ['Гэр 🏠', 'Оффис 💼', 'Сургууль 🏫', 'Биеийн тамир 💪', 'Гадаа 🌿'];
const ROUTINES   = ['өглөөний цайгаа уусны дараа', 'унтахын өмнө', 'хичээл дуусаад', 'гэртээ ирэхдээ', 'үдийн хоолны дараа'];
const TIME_SLOTS = ['06:00–08:00', '08:00–10:00', '12:00–14:00', '17:00–19:00', '19:00–21:00', '21:00–23:00'];

const GOAL_TAGS = [
  { id: 'mindfulness', name: 'Анхаарал', emoji: '🧘' },
  { id: 'fitness', name: 'Фитнес', emoji: '💪' },
  { id: 'health', name: 'Эрүүл мэнд', emoji: '❤️' },
  { id: 'learning', name: 'Суралцах', emoji: '📚' },
  { id: 'creativity', name: 'Бүтээлч байдал', emoji: '🎨' },
  { id: 'productivity', name: 'Бүтээмж', emoji: '⚡' },
  { id: 'social', name: 'Харилцаа', emoji: '🤝' },
  { id: 'finance', name: 'Санхүү', emoji: '💰' },
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

function PreviewSentence({ sentence }: { sentence: Array<{ text: string; filled: boolean }> }) {
  return (
    <p style={{ fontSize: 13, lineHeight: 1.75, fontStyle: 'italic' }} className="text-foreground">
      {sentence.map((part, i) => (
        <span key={i} style={{
          color: part.filled ? undefined : 'rgba(0,0,0,0.28)',
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
  const { userId } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Core
  const [title, setTitle]     = useState('');
  const [colorId, setColorId] = useState('lavender');
  const [goalTag, setGoalTag] = useState('mindfulness');

  // Why
  const [reason, setReason] = useState('');

  // Schedule
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([...DAYS_EN]);

  // Time window
  const [selectedTime, setSelectedTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Cue context
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocPicker, setShowLocPicker] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState('');
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);

  // Target
  const [habitType, setHabitType] = useState<'binary' | 'measurable'>('measurable');
  const [targetNum, setTargetNum]   = useState('1');
  const [minNum, setMinNum]           = useState('');
  const [targetUnit, setTargetUnit]   = useState('удаа');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  // Reminder
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const color  = getHabitColor(colorId);

  const toggleDay = (day: Weekday) =>
    setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  // ── Live sentence ────────────────────────────────────────────
  const previewParts = useMemo(() => {
    const titleStr = title.trim();
    const reasonStr = reason.trim();
    const cueStr = selectedRoutine || '';
    const timeStr = selectedTime || '';

    const daysLabel =
      selectedDays.length === 7 ? 'өдөр бүр' :
      selectedDays.length === 0 ? 'ямар ч өдөр' :
      selectedDays.length === 5 && !selectedDays.includes('SATURDAY') && !selectedDays.includes('SUNDAY')
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

  const handleSave = async () => {
    if (!userId || saving) return;
    setSaving(true);

    const cues: CreateHabitPayload['cues'] = [];
    if (selectedTime) {
      const [start, end] = selectedTime.split('–');
      cues.push({ startTime: start, endTime: end, isActive: true });
    }
    if (selectedLocation) {
      cues.push({ coarseLocation: selectedLocation, isActive: true });
    }
    if (selectedRoutine) {
      cues.push({ precedingRoutine: selectedRoutine, isActive: true });
    }

    const payload: CreateHabitPayload = {
      title: title.trim() || 'Шинэ дадал',
      description: reason || undefined,
      measurementUnit: habitType === 'binary' ? 'удаа' : targetUnit,
      targetValue: habitType === 'binary' ? 1 : (parseFloat(targetNum) || 1),
      minimumTarget: (habitType === 'measurable' && minNum) ? parseFloat(minNum) : 1,
      startDate: new Date().toISOString().split('T')[0],
      reminderEnabled,
      scheduleDays: selectedDays.map(weekday => ({ weekday })),
      cues: cues.length > 0 ? cues : undefined,
      motivationProfile: {
        goalTag,
        reason: reason || undefined,
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
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <p style={{ fontSize: 16, fontWeight: 700 }} className="text-foreground">Шинэ дадал</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-5">

        {/* Live preview */}
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

        {/* Section 1: ДАДАЛ */}
        <FormSection label="ДАДАЛ">
          <div className="px-4 py-3.5">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Дадлын нэр..."
              className="w-full bg-transparent focus:outline-none text-foreground"
              style={{ fontSize: 15, fontWeight: 600 }}
              autoFocus
            />
          </div>

          <Divider />

          {/* Color */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Өнгө</p>
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
                    <span style={{ fontSize: 9, fontWeight: colorId === c.id ? 600 : 400 }}
                      className="text-muted-foreground">
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
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }} className="text-foreground">Ангилал</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_TAGS.map(tag => {
                const isActive = goalTag === tag.id;
                return (
                  <motion.button key={tag.id} whileTap={{ scale: 0.9 }}
                    onClick={() => setGoalTag(tag.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: isActive ? color.btn : 'rgba(0,0,0,0.05)',
                      boxShadow: isActive ? `0 0 0 1.5px ${color.accent}60` : 'none',
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

        {/* Section 2: ЯАГААД */}
        <FormSection label="ЯАГААД">
          <div className="px-4 py-3.5">
            <p style={{ fontSize: 11, marginBottom: 6, fontWeight: 500 }} className="text-muted-foreground">
              Энэ дадлыг яагаад хэвшүүлэхийг хүсч байна вэ?
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Жишээ: илүү эрч хүчтэй, эрүүл байхын тулд..."
              rows={2}
              className="w-full bg-transparent focus:outline-none resize-none text-foreground"
              style={{ fontSize: 13, lineHeight: 1.6 }}
            />
          </div>
        </FormSection>

        {/* Section 3: ХУВААРЬ */}
        <FormSection label="ХУВААРЬ">
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

          <Divider />

          {/* Time window */}
          <div>
            <div className="px-4 py-3 flex items-center justify-between">
              <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Цаг</p>
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

        {/* Section 4: ДОХИО */}
        <FormSection label="ДОХИО — КЕН ДАРАА ХИЙХ ВЭ">
          {/* Location */}
          <div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Байршил</p>
                <p style={{ fontSize: 11, marginTop: 1 }} className="text-muted-foreground">Хаана хийх вэ?</p>
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
                <p style={{ fontSize: 13, fontWeight: 500 }} className="text-foreground">Өмнөх хэрэглүүр</p>
                <p style={{ fontSize: 11, marginTop: 1 }} className="text-muted-foreground">Юуны дараа хийх вэ?</p>
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

        {/* Section 5: ЗОРИЛТ */}
        <FormSection label="ЗОРИЛТ">
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

        {/* Section 6: САНУУЛГА */}
        <FormSection label="САНУУЛГА">
          <FormRow label="Сануулга идэвхтэй" divider={false}>
            <div className="flex items-center gap-2">
              {reminderEnabled
                ? <Bell className="w-4 h-4" style={{ color: color.accent }} />
                : <BellOff className="w-4 h-4 text-muted-foreground" />}
              <Toggle value={reminderEnabled} onChange={setReminderEnabled} accentColor={color.accent} />
            </div>
          </FormRow>
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
