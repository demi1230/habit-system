/**
 * HabitFormPage â€” shared form template used by both CreateHabitPage and EditHabitPage.
 * Pass initialValues for edit mode; leave undefined for create mode.
 * onSubmit receives the built payload; return a promise.
 * onSuccess is called after onSubmit resolves successfully.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X, Sparkles, Bell, BellOff, Check, MapPin } from 'lucide-react';
import { LocationMapPicker } from '@/components/LocationMapPicker';
import { getHabitColor, PASTEL_LIST, CTA_DARK } from '@/lib/habit-colors';
import { buildReminderPreview } from '@/lib/reminder-preview';
import { TYPOGRAPHY, SHADOW, buttonStyles, AppPlusIcon } from '@/shared/design';
import type { CreateHabitPayload } from '@/api/habits';
import type { Weekday } from '@/api/types';

const DAYS_MN = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const DAYS_EN: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const UNITS = ['удаа', 'мин', 'хуудас', 'литр', 'км', 'шил', 'хэсэг'];
const EMOJIS = ['🧘', '💪', '❤️', '📚', '🎨', '⚡', '🤝', '💰', '🏃', '🎵', '🌿', '🍎', '💧', '✍️', '🧠', '😴'];
const BENEFIT_SUGGESTIONS = [
  'Тайвшруулна', 'Төвлөрөл сайжруулна', 'Эрч хүч нэмнэ',
  'Эрүүл мэнд дэмжинэ', 'Өөрийгөө сайжруулна', 'Бүтээмж нэмэгдэнэ',
];

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mx-5">
      <p style={{ ...TYPOGRAPHY.groupLabel, marginBottom: 8, paddingLeft: 2 }}
        className="text-muted-foreground">{label}</p>
      <div className="rounded-[20px] overflow-hidden bg-card" style={{ boxShadow: SHADOW.card }}>
        {children}
      </div>
    </div>
  );
}

function FormRow({ label, sublabel, children, divider = true }: {
  label: string; sublabel?: string; children: React.ReactNode; divider?: boolean;
}) {
  return (
    <>
      <div className="flex gap-3 px-4 py-3.5 items-center">
        <div className="shrink-0" style={{ minWidth: 90 }}>
          <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">{label}</p>
          {sublabel && <p style={{ ...TYPOGRAPHY.micro, marginTop: 1 }} className="text-muted-foreground">{sublabel}</p>}
        </div>
        <div className="flex-1 min-w-0 flex justify-end items-center">{children}</div>
      </div>
      {divider && <div style={{ height: 0.5, backgroundColor: 'var(--surface-border-soft)', marginLeft: 16 }} />}
    </>
  );
}

function Divider() {
  return <div style={{ height: 0.5, backgroundColor: 'var(--surface-border-soft)', marginLeft: 16 }} />;
}

function Chip({ label, active, accentColor, onTap, small }: {
  label: string; active: boolean; accentColor: string; onTap: () => void; small?: boolean;
}) {
  return (
    <motion.button whileTap={{ scale: 0.88 }} onClick={onTap} className={`${buttonStyles({ variant: 'chip', size: small ? 'sm' : 'default' })} transition-colors`}
      style={{
        fontSize: small ? 11 : 12, fontWeight: active ? 600 : 400,
        padding: small ? '4px 10px' : '5px 12px',
        backgroundColor: active ? accentColor : 'var(--surface-subtle)',
        color: active ? 'var(--foreground)' : 'var(--text-soft)',
        boxShadow: active ? `0 0 0 1.5px ${accentColor}80` : 'none',
      }}>
      {label}
    </motion.button>
  );
}

function InlineOptions({ options, onSelect, onClose }: {
  options: string[]; onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.16 }} className="overflow-hidden">
      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
        {options.map(o => (
          <button key={o} onClick={() => { onSelect(o); onClose(); }}
            className={`${buttonStyles({ variant: 'secondary', size: 'sm' })} text-left`}
            style={{ fontSize: 12, backgroundColor: 'var(--surface-subtle)', color: 'var(--text-soft)' }}>
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
      style={{ backgroundColor: color, fontSize: 12, color: 'var(--foreground)', fontWeight: 500 }}>
      {label}
      <button onClick={onRemove} className={buttonStyles({ variant: 'secondary', size: 'iconSm' })}
        style={{ backgroundColor: 'var(--surface-strong)' }}>
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

function InlineInput({ value, onChange, placeholder, accentColor }: {
  value: string; onChange: (v: string) => void; placeholder: string; accentColor: string;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="bg-transparent focus:outline-none"
      style={{
        ...TYPOGRAPHY.body,
        fontWeight: 500,
        borderBottom: `1.5px solid ${value ? accentColor + '60' : 'var(--surface-strong)'}`,
        paddingBottom: 1, width: Math.max(120, value.length * 9 + 20),
        maxWidth: '70%', color: value ? undefined : 'var(--text-placeholder)',
      }} />
  );
}

function Toggle({ value, onChange, accentColor }: {
  value: boolean; onChange: (v: boolean) => void; accentColor: string;
}) {
  return (
    <motion.button onClick={() => onChange(!value)} className="relative rounded-full shrink-0"
      style={{ width: 44, height: 26, backgroundColor: value ? accentColor : 'var(--surface-strong)', transition: 'background-color 0.2s' }}>
      <motion.div animate={{ x: value ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.75 w-5 h-5 rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </motion.button>
  );
}

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface HabitFormInitialValues {
  title?: string;
  precedingRoutine?: string;
  reason?: string;
  colorId?: string;
  selectedEmoji?: string;
  benefits?: string[];
  selectedDays?: Weekday[];
  steps?: string[];
  reminderEnabled?: boolean;
  timeWindows?: Array<{ start: string; end: string }>;
  selectedLocations?: Array<{ lat: number; lng: number; label: string }>;
  habitType?: 'binary' | 'measurable';
  targetNum?: string;
  minNum?: string;
  targetUnit?: string;
}

interface HabitFormPageProps {
  /** Header title, e.g. "Дадал нэмэх" or "Дадал засах" */
  pageTitle: string;
  /** Label on the save button */
  submitLabel?: string;
  /** Pre-filled values for edit mode */
  initialValues?: HabitFormInitialValues;
  /** Called with the built payload. Should throw on error. */
  onSubmit: (payload: Partial<CreateHabitPayload>) => Promise<void>;
  /** Called after onSubmit resolves. Defaults to success animation â†’ /dashboard */
  onSuccess?: () => void;
}

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function HabitFormPage({
  pageTitle,
  submitLabel = 'Хадгалах',
  initialValues = {},
  onSubmit,
  onSuccess,
}: HabitFormPageProps) {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(initialValues.title ?? '');
  const [precedingRoutine, setPrecedingRoutine] = useState(initialValues.precedingRoutine ?? '');
  const [reason, setReason] = useState(initialValues.reason ?? '');
  const [colorId, setColorId] = useState(initialValues.colorId ?? 'lavender');
  const [selectedEmoji, setSelectedEmoji] = useState(initialValues.selectedEmoji ?? '🧘');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [benefits, setBenefits] = useState<string[]>(initialValues.benefits ?? []);
  const [benefitInput, setBenefitInput] = useState('');
  const [steps, setSteps] = useState<string[]>(initialValues.steps ?? ['']);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(initialValues.selectedDays ?? [...DAYS_EN]);
  const [reminderEnabled, setReminderEnabled] = useState(initialValues.reminderEnabled ?? false);
  const [timeWindows, setTimeWindows] = useState<Array<{ start: string; end: string }>>(
    initialValues.timeWindows ?? [],
  );
  const [selectedLocations, setSelectedLocations] = useState<Array<{ lat: number; lng: number; label: string }>>(initialValues.selectedLocations ?? []);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [habitType, setHabitType] = useState<'binary' | 'measurable'>(initialValues.habitType ?? 'measurable');
  const [targetNum, setTargetNum] = useState(initialValues.targetNum ?? '1');
  const [minNum, setMinNum] = useState(initialValues.minNum ?? '');
  const [targetUnit, setTargetUnit] = useState(initialValues.targetUnit ?? 'удаа');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const color = getHabitColor(colorId);

  const toggleDay = (day: Weekday) =>
    setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const removeLocation = (label: string) =>
    setSelectedLocations(p => p.filter(l => l.label !== label));

  const addBenefit = (b: string) => {
    if (!benefits.includes(b)) setBenefits(p => [...p, b]);
  };
  const removeBenefit = (b: string) => setBenefits(p => p.filter(x => x !== b));
  const updateStep = (index: number, value: string) =>
    setSteps(prev => prev.map((step, idx) => idx === index ? value : step));
  const addStep = () => setSteps(prev => prev.length >= 5 ? prev : [...prev, '']);
  const removeStep = (index: number) => setSteps(prev => prev.filter((_, idx) => idx !== index));

  const addTimeWindow = () => setTimeWindows(p => [...p, { start: '08:00', end: '10:00' }]);
  const removeTimeWindow = (i: number) => setTimeWindows(p => p.filter((_, idx) => idx !== i));
  const updateTimeWindow = (i: number, field: 'start' | 'end', val: string) =>
    setTimeWindows(p => p.map((tw, idx) => idx === i ? { ...tw, [field]: val } : tw));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setErrorMsg(null);

    const twPayload = timeWindows
      .filter(tw => tw.start && tw.end)
      .map(tw => ({ startTime: tw.start, endTime: tw.end }));

    const today = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const payload: Partial<CreateHabitPayload> = {
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
      // startDate only needed for create; edit will just ignore/override if not provided
      ...(initialValues.title === undefined ? { startDate: today } : {}),
      scheduleDays: selectedDays.map(weekday => ({ weekday })),
      steps: steps
        .map((step, orderIndex) => ({ title: step.trim(), orderIndex }))
        .filter((step) => step.title.length > 0),
      reminder: {
        enabled: reminderEnabled,
        timeWindows: twPayload.length > 0 ? twPayload : undefined,
        locations: selectedLocations.length > 0 ? selectedLocations.map(l => l.label) : undefined,
      },
    };

    try {
      await onSubmit(payload);
      if (onSuccess) {
        onSuccess();
      } else {
        setShowSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1400);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Алдаа гарлаа';
      setErrorMsg(msg);
      setSaving(false);
    }
  };

  const reminderPreview = buildReminderPreview({
    title,
    precedingRoutine,
    reason,
    benefits,
  });

  // â”€â”€ Success screen (create mode default) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: color.btn }}>
            <Sparkles className="w-9 h-9" style={{ color: color.accent }} />
          </motion.div>
          <p style={{ ...TYPOGRAPHY.pageTitle, fontSize: 20, fontWeight: 500 }} className="text-foreground">Дадал нэмэгдлээ! 🌱</p>
          <p style={{ ...TYPOGRAPHY.bodySm, marginTop: 6 }} className="text-muted-foreground">Дадлаа эхлүүлэхэд бэлэн</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-background px-5 pt-13 pb-3"
        style={{ borderBottom: '1px solid var(--surface-border-faint)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
              className={`${buttonStyles({ variant: 'nav', size: 'icon' })} shrink-0`}
              style={{ backgroundColor: 'var(--surface-subtle)' }}>
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <p className="text-foreground"
              style={{ ...TYPOGRAPHY.pageTitle, minWidth: 60, color: title.trim() ? undefined : 'var(--text-placeholder)' }}>
              {title.trim() || pageTitle}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEmojiPicker(p => !p)}
            className={`${buttonStyles({ variant: 'accent', size: 'icon' })} shrink-0`}
            style={{ backgroundColor: color.btn, fontSize: 18 }}>
            {selectedEmoji}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-5">

        {/* Sentence builder */}
        <div className="mx-5">
          <motion.div className="rounded-[20px] bg-card px-4 py-4"
            animate={{ boxShadow: `0 1px 10px ${color.accent}18` }}
            style={{ border: `1.5px solid ${color.accent}30` }}>
            <p style={{ ...TYPOGRAPHY.body, lineHeight: 2.4 }} className="text-foreground">
              <InlineInput value={precedingRoutine} onChange={setPrecedingRoutine}
                placeholder="өмнөх үйлдэл" accentColor={color.accent} />
              <span style={{ fontWeight: 500 }}> дараа </span>
              <InlineInput value={title} onChange={setTitle}
                placeholder="дадал" accentColor={color.accent} />
              <span style={{ fontWeight: 500 }}> дадлыг хийнэ.</span>
            </p>
            <p style={{ ...TYPOGRAPHY.body, lineHeight: 2.4, marginTop: 2 }} className="text-foreground">
              <span style={{ fontWeight: 500 }}>Ингэснээр би: </span>
              <InlineInput value={reason} onChange={setReason}
                placeholder="өдрийг тайван эхлүүлэхийн тулд" accentColor={color.accent} />
            </p>
            <p style={{ ...TYPOGRAPHY.caption, marginTop: 10 }} className="text-muted-foreground">
              Дадлын нэр, ашиг тус, шалтгаанаа үйл үгийн хэлбэрээр бичвэл сануулга илүү утгатай болно.
            </p>
          </motion.div>
        </div>

        <FormSection label="САНУУЛГЫН PREVIEW">
          <div className="px-4 py-3 flex flex-col gap-3">
            {[
              { label: 'Base', text: reminderPreview.base },
              { label: 'Cue + reason', text: reminderPreview.cueAndReason },
              { label: 'Cue + benefits', text: reminderPreview.cueAndBenefits },
            ].map((variant) => (
              <div key={variant.label} className="rounded-[16px] px-3 py-3"
                style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <p style={{ ...TYPOGRAPHY.micro, marginBottom: 6, color: color.accent, fontWeight: 700 }}>
                  {variant.label}
                </p>
                <p style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }} className="text-foreground">
                  {variant.text}
                </p>
              </div>
            ))}
          </div>
        </FormSection>

        {/* ХАРАГДАХ ТӨРХ */}
        <FormSection label="ХАРАГДАХ ТӨРХ">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Дүрс</p>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEmojiPicker(p => !p)}
                className={buttonStyles({ variant: 'accent', size: 'iconLg' })}
                style={{ backgroundColor: color.btn, fontSize: 22 }}>
                {selectedEmoji}
              </motion.button>
            </div>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.16 }} className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 pb-2">
                    {EMOJIS.map(e => (
                      <motion.button key={e} whileTap={{ scale: 0.85 }}
                        onClick={() => { setSelectedEmoji(e); setShowEmojiPicker(false); }}
                        className={`${buttonStyles({ variant: 'plain', size: 'bare' })} w-10 h-10 rounded-full flex items-center justify-center`}
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
          <div className="px-4 py-3">
            <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, marginBottom: 10 }} className="text-foreground">Өнгө</p>
            <div className="flex gap-3">
              {PASTEL_LIST.map(c => {
                const clr = getHabitColor(c.id);
                return (
                  <motion.button key={c.id} whileTap={{ scale: 0.86 }}
                    onClick={() => setColorId(c.id)} className={`${buttonStyles({ variant: 'plain', size: 'bare' })} flex flex-col items-center gap-1.5`}>
                    <div className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                      style={{
                        backgroundColor: clr.btn,
                        boxShadow: colorId === c.id ? `0 0 0 2.5px white, 0 0 0 4px ${clr.accent}` : 'none',
                      }}>
                      {colorId === c.id && <Check className="w-3 h-3" style={{ color: clr.accent }} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: colorId === c.id ? 600 : 400 }} className="text-muted-foreground">
                      {c.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* АШИГ ТУС */}
        <FormSection label="АШИГ ТУС">
          <div className="px-4 py-3 flex flex-col gap-3">
            <p style={TYPOGRAPHY.caption} className="text-muted-foreground">
              Жишээ: толгой сэргээх, эрүүл чийрэг болох, төвлөрөл нэмэгдүүлэх
            </p>
            <div className="flex items-center gap-2">
              <input value={benefitInput} onChange={e => setBenefitInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && benefitInput.trim()) {
                    addBenefit(benefitInput.trim()); setBenefitInput('');
                  }
                }}
                placeholder="Ашиг тус нэмэх..."
                className="flex-1 bg-transparent focus:outline-none text-foreground"
                style={{ ...TYPOGRAPHY.bodySm, borderBottom: '1.5px solid var(--surface-strong)', paddingBottom: 4 }} />
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => { if (benefitInput.trim()) { addBenefit(benefitInput.trim()); setBenefitInput(''); } }}
                className={`${buttonStyles({ variant: 'accent', size: 'iconSm' })} w-7 h-7 rounded-full shrink-0`}
                style={{ backgroundColor: benefitInput.trim() ? color.btn : 'var(--surface-subtle)' }}>
                <AppPlusIcon className="w-3.5 h-3.5" style={{ color: benefitInput.trim() ? color.accent : 'var(--text-disabled)' }} />
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              {BENEFIT_SUGGESTIONS.filter(b => !benefits.includes(b)).map(b => (
                <button key={b} onClick={() => addBenefit(b)} className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                  style={{ fontSize: 12, backgroundColor: 'var(--surface-subtle)', color: 'var(--text-soft)' }}>
                  {b}
                </button>
              ))}
            </div>
            {benefits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {benefits.map(b => <TagPill key={b} label={b} onRemove={() => removeBenefit(b)} color={color.btn} />)}
              </div>
            )}
          </div>
        </FormSection>

        <FormSection label="ЖИЖИГ АЛХАМУУД">
          <div className="px-4 py-3 flex flex-col gap-3">
            <p style={TYPOGRAPHY.caption} className="text-muted-foreground">
              Хүсвэл 1-5 жижиг алхам болгон хувааж хадгалж болно.
            </p>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color.btn, ...TYPOGRAPHY.micro, fontWeight: 700 }}>
                  {index + 1}
                </div>
                <input
                  value={step}
                  onChange={e => updateStep(index, e.target.value)}
                  placeholder={`Алхам ${index + 1}`}
                  className="flex-1 rounded-[14px] px-3 py-2 bg-transparent text-foreground focus:outline-none"
                  style={{ border: '1px solid var(--surface-border-soft)', ...TYPOGRAPHY.bodySm }}
                />
                {steps.length > 1 && (
                  <button onClick={() => removeStep(index)}
                    className={buttonStyles({ variant: 'secondary', size: 'iconSm' })}
                    style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
            {steps.length < 5 && (
              <motion.button whileTap={{ scale: 0.96 }} onClick={addStep}
                className={`${buttonStyles({ variant: 'secondary', size: 'sm' })} w-full justify-center`}
                style={{ backgroundColor: color.btn, color: color.accent, fontWeight: 600 }}>
                <AppPlusIcon className="w-3.5 h-3.5" style={{ color: color.accent }} />
                <span>Алхам нэмэх</span>
              </motion.button>
            )}
          </div>
        </FormSection>

        {/* ХИЙХ ӨДРҮҮД */}
        <FormSection label="ХИЙХ ӨДРҮҮД">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Өдрүүд</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDays([...DAYS_EN])}
                  className={buttonStyles({ variant: 'plain', size: 'bare' })}
                  style={{ ...TYPOGRAPHY.micro, color: color.accent, fontWeight: 600 }}>Бүгд</button>
                <span style={{ fontSize: 11 }} className="text-muted-foreground">·</span>
                <button
                  onClick={() => setSelectedDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'])}
                  className={buttonStyles({ variant: 'plain', size: 'bare' })}
                  style={{ ...TYPOGRAPHY.micro, color: 'var(--text-muted-soft)', fontWeight: 600 }}>Ажлын</button>
              </div>
            </div>
            <div className="flex gap-1">
              {DAYS_MN.map((mn, i) => {
                const en = DAYS_EN[i];
                const active = selectedDays.includes(en);
                return (
                  <motion.button key={en} whileTap={{ scale: 0.82 }} onClick={() => toggleDay(en)}
                    className={`${buttonStyles({ variant: 'chip', size: 'sm' })} flex-1 rounded-[12px] px-0 py-2`}
                    style={{
                      backgroundColor: active ? color.btn : 'var(--surface-muted)',
                      boxShadow: active ? `0 0 0 1.5px ${color.accent}50` : 'none',
                      fontSize: 11, fontWeight: active ? 600 : 400,
                      color: active ? 'var(--foreground)' : 'var(--text-faint)',
                    }}>
                    {mn}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* САНУУЛГА */}
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Цаг</p>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={addTimeWindow}
                      className={buttonStyles({ variant: 'accent', size: 'iconSm' })}
                      style={{ backgroundColor: color.btn }}>
                      <AppPlusIcon className="w-3.5 h-3.5" style={{ color: color.accent }} />
                    </motion.button>
                  </div>
                  {timeWindows.length === 0 && (
                    <p className="text-muted-foreground flex items-center gap-1.5" style={TYPOGRAPHY.caption}>
                      <AppPlusIcon className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted-soft)' }} />
                      <span>дарж цагийн хүрээ нэмнэ</span>
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    {timeWindows.map((tw, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="time" value={tw.start} onChange={e => updateTimeWindow(i, 'start', e.target.value)}
                          className="flex-1 rounded-xl px-3 py-1.5 bg-transparent text-foreground focus:outline-none"
                          style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, border: '1px solid var(--surface-border-soft)' }} />
                        <span className="text-muted-foreground" style={TYPOGRAPHY.caption}>–</span>
                        <input type="time" value={tw.end} onChange={e => updateTimeWindow(i, 'end', e.target.value)}
                          className="flex-1 rounded-xl px-3 py-1.5 bg-transparent text-foreground focus:outline-none"
                          style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, border: '1px solid var(--surface-border-soft)' }} />
                        <button onClick={() => removeTimeWindow(i)}
                          className={`${buttonStyles({ variant: 'secondary', size: 'iconSm' })} shrink-0`}
                          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Divider />
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Байршил</p>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowMapPicker(p => !p)}
                      className={buttonStyles({ variant: 'accent', size: 'sm' })}
                      style={{ fontSize: 12, color: color.accent, fontWeight: 500, backgroundColor: color.btn }}>
                      {showMapPicker ? 'Хаах' : (
                        <>
                          <AppPlusIcon className="w-3.5 h-3.5" style={{ color: color.accent }} />
                          <span>Газрын зургаас</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  {selectedLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedLocations.map(loc => (
                        <div key={loc.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: color.btn, fontSize: 12, color: 'var(--foreground)', fontWeight: 500 }}>
                          <MapPin className="w-3 h-3" style={{ color: color.accent }} />
                          {loc.label}
                          <button onClick={() => removeLocation(loc.label)}
                            className={buttonStyles({ variant: 'secondary', size: 'iconSm' })}
                            style={{ backgroundColor: 'var(--surface-strong)' }}>
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {showMapPicker && (
                    <LocationMapPicker accentColor={color.accent} btnColor={color.btn}
                      onConfirm={(loc) => {
                        if (!selectedLocations.find(l => l.label === loc.label)) {
                          setSelectedLocations(p => [...p, loc]);
                        }
                        setShowMapPicker(false);
                      }}
                      onClose={() => setShowMapPicker(false)} />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

        {/* ХЭМЖИЛТ */}
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                <Divider />
                <FormRow label="Зорилт" sublabel="Дуусгах хэмжээ">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-9 rounded-[12px] flex items-center justify-center"
                      style={{ backgroundColor: 'var(--surface-subtle)' }}>
                      <input type="number" value={targetNum} onChange={e => setTargetNum(e.target.value)}
                        className="bg-transparent focus:outline-none text-center w-full text-foreground"
                        style={{ ...TYPOGRAPHY.body, fontWeight: 500 }} />
                    </div>
                    <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowUnitPicker(p => !p)}
                      className={`${buttonStyles({ variant: 'accent', size: 'sm' })} h-9 flex items-center gap-1`}
                      style={{ backgroundColor: color.btn }}>
                      <span style={{ ...TYPOGRAPHY.bodySm, color: 'var(--foreground)', fontWeight: 500 }}>{targetUnit}</span>
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
                    style={{ backgroundColor: 'var(--surface-subtle)' }}>
                    <input type="number" value={minNum} onChange={e => setMinNum(e.target.value)}
                      placeholder="-"
                      className="bg-transparent focus:outline-none text-center w-full text-foreground"
                      style={{ ...TYPOGRAPHY.body, fontWeight: 500 }} />
                  </div>
                </FormRow>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center pb-10 pt-5 z-20 gap-2"
        style={{ background: 'linear-gradient(to top, var(--background) 65%, transparent)' }}>
        {errorMsg && (
          <div className="mx-5 px-4 py-2 rounded-[14px] text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', maxWidth: 360 }}>
            <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>{errorMsg}</p>
          </div>
        )}
        <motion.button whileTap={{ scale: 0.96 }} onClick={handleSave} disabled={saving}
          className={`${buttonStyles({ variant: 'default', size: 'lg' })} flex items-center justify-center gap-2 disabled:opacity-50`}
          style={{ backgroundColor: CTA_DARK.bg, boxShadow: CTA_DARK.shadow, minWidth: 200 }}>
          <span style={{ ...TYPOGRAPHY.navTitle, fontWeight: 500, color: CTA_DARK.text }}>
            {saving ? '...' : submitLabel}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
