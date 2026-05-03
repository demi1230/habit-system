/**
 * HabitFormPage — shared form template used by both CreateHabitPage and EditHabitPage.
 * Pass initialValues for edit mode; leave undefined for create mode.
 * onSubmit receives the built payload; return a promise.
 * onSuccess is called after onSubmit resolves successfully.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X, Sparkles, Bell, BellOff, Check, MapPin, Loader2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { LocationMapPicker } from '@/components/LocationMapPicker';
import { WeekdayStrip, WEEKDAY_KEYS, WORKDAY_KEYS } from '@/components/weekday-strip';
import { getHabitColor, PASTEL_LIST, CTA_DARK } from '@/lib/habit-colors';
import { buildReminderPreview } from '@/lib/reminder-preview';
import { TYPOGRAPHY, SHADOW, buttonStyles, AppPlusIcon } from '@/shared/design';
import type { CreateHabitPayload } from '@/api/habits';
import type { Weekday } from '@/api/types';

const UNITS = ['удаа', 'мин', 'хуудас', 'литр', 'км', 'шил', 'хэсэг', 'цаг', 'г'];
const EMOJIS = ['🧘', '💪', '❤️', '📚', '🎨', '⚡', '🤝', '💰', '🏃', '🎵', '🌿', '🍎', '💧', '✍️', '🧠', '😴', '🦷', '🚿', '🥗', '☕', '🌅', '🛏️', '📖', '🧹'];
const BENEFIT_SUGGESTIONS = [
  'Тайвшруулах', 'Төвлөрөл сайжруулах', 'Эрч хүч нэмэх',
  'Эрүүл мэнд дэмжих', 'Анхаарал төвлөрүүлэх', 'Бүтээмж нэмэх',
];

const ROUTINE_HINTS: ReadonlyArray<{ cue: string; routine: string; reason: string }> = [
  { cue: 'Орондоо орсныхоо',    routine: 'ном унших',         reason: 'олон зүйлийн талаар мэдлэгээ нэмэгдүүлнэ' },
  { cue: 'Кофе уусаныхаа',      routine: 'бясалгал хийх',     reason: 'илүү тайван болж, төвлөрөө сайжруулна' },
  { cue: 'Өглөө сэрснийхээ',    routine: '1 аяга ус уух',     reason: 'ходоодоо цочроолгүйгээр өглөөг эхлүүлнэ ' },
  { cue: 'Хоолоо идсэнийхээ',   routine: 'аягаа угаах',       reason: 'бөөгнөрсөн аяга тавагнаас болж стрессдэхгүй' },
  { cue: 'Гэртээ ирсэнийхээ',   routine: 'гэрээ цэвэрлэх',    reason: 'тав тухтай, цэвэр орчин бүрдүүлнэ' },
];

const MIN_REMINDER_DURATION_MIN = 10;
const DEFAULT_REMINDER_DURATION_MIN = 120;
const MAX_STEPS = 5;

// ── Time helpers ─────────────────────────────────────────────────────────────

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minToTime(min: number): string {
  const safe = Math.max(0, Math.min(min, 24 * 60 - 1));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Default time window: next 30-min boundary from now, +2h end (clamped to today). */
function getDefaultTimeWindow(): { start: string; end: string } {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = Math.min(Math.ceil((nowMin + 5) / 30) * 30, 22 * 60);
  const endMin = Math.min(startMin + DEFAULT_REMINDER_DURATION_MIN, 24 * 60 - 1);
  return { start: minToTime(startMin), end: minToTime(endMin) };
}

/** Ensure end ≥ start + MIN_REMINDER_DURATION_MIN. Clamps the *other* field of the one the user changed. */
function clampTimeWindow(
  tw: { start: string; end: string },
  changedField: 'start' | 'end',
): { start: string; end: string } {
  const startMin = timeToMin(tw.start);
  const endMin = timeToMin(tw.end);
  if (endMin >= startMin + MIN_REMINDER_DURATION_MIN) return tw;
  if (changedField === 'start') {
    return { start: tw.start, end: minToTime(startMin + MIN_REMINDER_DURATION_MIN) };
  }
  return { start: minToTime(endMin - MIN_REMINDER_DURATION_MIN), end: tw.end };
}

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FormSection({ label, children, id }: { label: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="mx-5">
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
        color: active ? '#202325' : 'var(--text-soft)',
        boxShadow: active ? `0 0 0 1.5px ${accentColor}80` : 'none',
      }}>
      {label}
    </motion.button>
  );
}

/**
 * Inline picker for short string options (e.g. measurement units). When
 * `allowCustom` is true, an "Өөр…" chip reveals a free-text input for users
 * who need a unit that's not in the preset list.
 */
function InlineOptions({ options, onSelect, onClose, allowCustom, customPlaceholder, accentBg }: {
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
  accentBg?: string;
}) {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customMode) inputRef.current?.focus();
  }, [customMode]);

  const submitCustom = () => {
    const v = customValue.trim();
    if (!v) return;
    onSelect(v);
    setCustomMode(false);
    setCustomValue('');
    onClose();
  };

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
        {allowCustom && !customMode && (
          <button onClick={() => setCustomMode(true)}
            className={`${buttonStyles({ variant: 'secondary', size: 'sm' })} text-left`}
            style={{ fontSize: 12, backgroundColor: 'var(--surface-subtle)', color: 'var(--text-soft)', fontStyle: 'italic' }}>
            Өөр…
          </button>
        )}
      </div>
      {allowCustom && customMode && (
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          <input
            ref={inputRef}
            value={customValue}
            onChange={e => setCustomValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitCustom(); }}
            placeholder={customPlaceholder}
            maxLength={20}
            className="flex-1 rounded-[14px] px-3 py-2 bg-transparent text-foreground focus:outline-none"
            style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, border: '1px solid var(--surface-border-soft)' }}
          />
          <motion.button whileTap={{ scale: 0.94 }} onClick={submitCustom}
            disabled={!customValue.trim()}
            className={`${buttonStyles({ variant: 'default', size: 'sm' })} disabled:opacity-50`}
            style={{ backgroundColor: accentBg ?? 'var(--surface-strong)', color: '#202325', fontWeight: 600, fontSize: 12 }}>
            Сонгох
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

function TagPill({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: color, fontSize: 12, color: '#202325', fontWeight: 500 }}>
      {label}
      <button onClick={onRemove} className={buttonStyles({ variant: 'secondary', size: 'iconSm' })}
        style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: '#202325' }}>
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

/**
 * Auto-sizing inline input — uses an `inline-grid` with a single cell so the
 * mirror span (sizing), the animated placeholder overlay, and the real `<input>`
 * all occupy the *exact same* grid area. This guarantees identical baseline,
 * padding, and line-box across all three layers, fixing alignment drift that
 * absolute-positioning otherwise causes when the parent has a tall line-height.
 *
 * When `value` is empty, the `placeholder` is rendered as a cross-fading overlay
 * (AnimatePresence keyed on the placeholder string), so rotating examples
 * animate smoothly. As soon as the user types, the overlay is unmounted and
 * only the plain `<input>` is on screen — typing stays completely native and
 * unaffected by any animation.
 */
function InlineInput({ value, onChange, placeholder, accentColor, invalid }: {
  value: string; onChange: (v: string) => void; placeholder: string; accentColor: string; invalid?: boolean;
}) {
  const sharedTextStyle: React.CSSProperties = {
    ...TYPOGRAPHY.body,
    fontWeight: 500,
    paddingLeft: 2,
    paddingRight: 2,
  };
  const display = value || placeholder;
  const underline = invalid
    ? '#ef4444'
    : value ? accentColor + '60' : 'var(--surface-strong)';
  const cellStyle: React.CSSProperties = { gridArea: '1 / 1' };

  return (
    <span
      className="align-baseline"
      style={{ display: 'inline-grid', maxWidth: '100%' }}>
      {/* Mirror span sizes the grid cell to fit the current text. */}
      <span aria-hidden className="invisible whitespace-pre"
        style={{ ...sharedTextStyle, ...cellStyle }}>
        {display}
      </span>
      {/* Animated placeholder overlay — only when value is empty. */}
      {!value && (
        <AnimatePresence>
          <motion.span
            key={placeholder}
            aria-hidden
            className="pointer-events-none whitespace-pre"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ ...sharedTextStyle, ...cellStyle, color: 'var(--text-placeholder)' }}>
            {placeholder}
          </motion.span>
        </AnimatePresence>
      )}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        // Native placeholder is intentionally omitted — we render our own animated overlay above.
        className="bg-transparent focus:outline-none"
        style={{
          ...sharedTextStyle,
          ...cellStyle,
          width: '100%',
          borderBottom: `1.5px solid ${underline}`,
        }}
      />
    </span>
  );
}

function MultilineInlineInput({ value, onChange, placeholder, accentColor }: {
  value: string; onChange: (v: string) => void; placeholder: string; accentColor: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value, placeholder]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent focus:outline-none resize-none overflow-hidden"
      style={{
        ...TYPOGRAPHY.body,
        fontWeight: 500,
        lineHeight: 1.7,
        minHeight: 32,
        color: 'var(--foreground)',
        borderBottom: `1.5px solid ${value ? accentColor + '60' : 'var(--surface-strong)'}`,
      }}
    />
  );
}

// ── Tiny helpers ─────────────────────────────────────────────────────────────

function Spinner({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <Loader2
      className="animate-spin"
      style={{ width: size, height: size, color: color ?? 'currentColor' }}
    />
  );
}

/**
 * Bottom-sheet emoji picker — single source of truth for choosing the habit
 * emoji. Triggered by either the header button or the appearance row.
 * Includes a free-text custom emoji input so the 24 presets aren't a hard limit.
 */
function EmojiPickerSheet({
  value, onSelect, onClose, accentColor, accentBg,
}: {
  value: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  accentColor: string;
  accentBg: string;
}) {
  const [custom, setCustom] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirmCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    onSelect(trimmed);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/25 z-40 backdrop-blur-[2px]" onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      >
        <div className="w-full max-w-[430px] rounded-t-[28px] overflow-hidden bg-card"
          style={{ boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}>
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-9 h-[3px] rounded-full" style={{ backgroundColor: 'var(--surface-strong)' }} />
          </div>
          <div className="px-5 pb-2 flex items-center justify-between">
            <p style={{ ...TYPOGRAPHY.cardTitle, fontWeight: 500 }} className="text-foreground">
              Дүрс сонгох
            </p>
            <button onClick={onClose} className={buttonStyles({ variant: 'secondary', size: 'iconSm' })}
              style={{ backgroundColor: 'var(--surface-subtle)' }}
              aria-label="Хаах">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="px-5 pt-2 pb-3">
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map(e => {
                const selected = value === e;
                return (
                  <motion.button key={e} whileTap={{ scale: 0.85 }}
                    onClick={() => { onSelect(e); onClose(); }}
                    className={`${buttonStyles({ variant: 'plain', size: 'bare' })} h-12 rounded-2xl flex items-center justify-center`}
                    style={{
                      fontSize: 24,
                      backgroundColor: selected ? accentBg : 'var(--surface-subtle)',
                      boxShadow: selected ? `0 0 0 2px ${accentColor}60` : 'none',
                    }}>
                    {e}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="px-5 pt-1 pb-5">
            <p style={{ ...TYPOGRAPHY.micro, marginBottom: 6 }} className="text-muted-foreground">
              Эсвэл өөрийн дүрс оруулах
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleConfirmCustom(); }}
                placeholder="🦷"
                maxLength={4}
                className="flex-1 rounded-[14px] px-3 py-2 bg-transparent text-foreground focus:outline-none text-center"
                style={{ ...TYPOGRAPHY.body, fontWeight: 500, border: '1px solid var(--surface-border-soft)' }}
              />
              <motion.button whileTap={{ scale: 0.94 }} onClick={handleConfirmCustom}
                disabled={!custom.trim()}
                className={`${buttonStyles({ variant: 'default', size: 'sm' })} disabled:opacity-50`}
                style={{ backgroundColor: accentBg, color: '#202325', fontWeight: 600, fontSize: 13 }}>
                Сонгох
              </motion.button>
            </div>
          </div>
          <div style={{ height: 'max(20px, env(safe-area-inset-bottom))' }} />
        </div>
      </motion.div>
    </>
  );
}

/**
 * Unsaved-changes confirmation modal. Reuses the same motion pattern as
 * `HabitDetailPage`'s archive sheet for consistency.
 */
function UnsavedChangesDialog({
  onDiscard, onCancel,
}: {
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
        onClick={onCancel} />
      <motion.div
        initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] bg-card rounded-t-[28px] px-6 pb-10 pt-5"
          style={{ boxShadow: '0 -6px 32px rgba(0,0,0,0.12)' }}>
          <div className="w-9 h-[3px] rounded-full mx-auto mb-5" style={{ backgroundColor: 'var(--surface-strong)' }} />
          <div className="text-center mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(245,158,11,0.16)' }}>
              <AlertTriangle className="w-8 h-8" strokeWidth={2} style={{ color: '#d97706' }} />
            </div>
            <p style={{ ...TYPOGRAPHY.pageTitle, fontWeight: 500 }} className="text-foreground">
              Хадгалаагүй өөрчлөлт
            </p>
            <p className="mt-2 text-muted-foreground" style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }}>
              Хийсэн өөрчлөлтөө хадгалаагүй байна.<br />Энэ өөрчлөлтээ хаях уу?
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <motion.button whileTap={{ scale: 0.97 }} onClick={onDiscard}
              className={`w-full ${buttonStyles({ variant: 'default', size: 'lg' })}`}
              style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', fontSize: 15, fontWeight: 500 }}>
              Тийм, хаях
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel}
              className={`w-full ${buttonStyles({ variant: 'secondary', size: 'lg' })}`}
              style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--foreground)', fontSize: 14, fontWeight: 500 }}>
              Болих
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
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
  /** Pre-filled values for edit mode or template-driven create mode */
  initialValues?: HabitFormInitialValues;
  /**
   * Whether this form is in create or edit mode. Defaults to 'create'.
   * Used so that template-prefilled create forms (where `initialValues.title`
   * is set) still behave like a create — e.g. startDate is attached on submit.
   */
  mode?: 'create' | 'edit';
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
  mode = 'create',
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
  const [steps, setSteps] = useState<string[]>(initialValues.steps ?? []);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(initialValues.selectedDays ?? [...WEEKDAY_KEYS]);
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
  const [showPreview, setShowPreview] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);

  const color = getHabitColor(colorId);
  const isCreate = mode === 'create';
  const titleValid = title.trim().length > 0;
  const showTitleError = attemptedSave && !titleValid;
  const stepRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Rotate the cue/routine example placeholders inside the sentence builder
  // every 5s. Only matters while at least one of the inputs is empty, but the
  // interval is tiny so we don't bother gating it.
  useEffect(() => {
    const id = setInterval(() => setHintIdx(i => (i + 1) % ROUTINE_HINTS.length), 5000);
    return () => clearInterval(id);
  }, []);
  const currentHint = ROUTINE_HINTS[hintIdx];

  // ── Dirty tracking ──────────────────────────────────────────────────────
  // Snapshot the initial state once on mount so we can compare for unsaved changes.
  // We don't include transient UI state (showEmojiPicker, etc.) — only data fields.
  const initialSnapshot = useMemo(() => JSON.stringify({
    title: initialValues.title ?? '',
    precedingRoutine: initialValues.precedingRoutine ?? '',
    reason: initialValues.reason ?? '',
    colorId: initialValues.colorId ?? 'lavender',
    selectedEmoji: initialValues.selectedEmoji ?? '🧘',
    benefits: initialValues.benefits ?? [],
    steps: initialValues.steps ?? [],
    selectedDays: initialValues.selectedDays ?? [...WEEKDAY_KEYS],
    reminderEnabled: initialValues.reminderEnabled ?? false,
    timeWindows: initialValues.timeWindows ?? [],
    selectedLocations: initialValues.selectedLocations ?? [],
    habitType: initialValues.habitType ?? 'measurable',
    targetNum: initialValues.targetNum ?? '1',
    minNum: initialValues.minNum ?? '',
    targetUnit: initialValues.targetUnit ?? 'удаа',
  }), [initialValues]);
  const currentSnapshot = JSON.stringify({
    title, precedingRoutine, reason, colorId, selectedEmoji,
    benefits, steps, selectedDays, reminderEnabled,
    timeWindows, selectedLocations, habitType, targetNum, minNum, targetUnit,
  });
  const isDirty = currentSnapshot !== initialSnapshot;

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedConfirm(true);
    } else {
      navigate(-1);
    }
  };

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
  const addStep = () => {
    setSteps(prev => {
      if (prev.length >= MAX_STEPS) return prev;
      // If the last step is still empty, focus it instead of adding another blank row.
      if (prev.length > 0 && prev[prev.length - 1].trim() === '') {
        const lastIdx = prev.length - 1;
        setTimeout(() => stepRefs.current[lastIdx]?.focus(), 0);
        return prev;
      }
      const next = [...prev, ''];
      setTimeout(() => stepRefs.current[next.length - 1]?.focus(), 0);
      return next;
    });
  };
  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, idx) => idx !== index));
    stepRefs.current.splice(index, 1);
  };

  const addTimeWindow = () => setTimeWindows(p => [...p, getDefaultTimeWindow()]);
  const removeTimeWindow = (i: number) => setTimeWindows(p => p.filter((_, idx) => idx !== i));
  const updateTimeWindow = (i: number, field: 'start' | 'end', val: string) =>
    setTimeWindows(p => p.map((tw, idx) =>
      idx === i ? clampTimeWindow({ ...tw, [field]: val }, field) : tw,
    ));

  const handleSave = async () => {
    if (saving) return;
    setAttemptedSave(true);
    setErrorMsg(null);

    if (!titleValid) {
      // Scroll to top so the user sees the highlighted title field.
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    const twPayload = timeWindows
      .filter(tw => tw.start && tw.end)
      .map(tw => ({ startTime: tw.start, endTime: tw.end }));

    const today = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const payload: Partial<CreateHabitPayload> = {
      title: title.trim(),
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
      ...(isCreate ? { startDate: today } : {}),
      scheduleDays: selectedDays.map(weekday => ({ weekday })),
      steps: steps
        .map((step, orderIndex) => ({ title: step.trim(), orderIndex }))
        .filter((step) => step.title.length > 0),
      reminder: {
        enabled: reminderEnabled,
        timeWindows: twPayload.length > 0 ? twPayload : undefined,
        locations: selectedLocations.length > 0
          ? selectedLocations.map(l => ({ lat: l.lat, lng: l.lng, label: l.label }))
          : undefined,
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
          <p style={{ ...TYPOGRAPHY.pageTitle, fontSize: 20, fontWeight: 500 }} className="text-foreground">Дадал нэмэгдлээ!</p>
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
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleBack}
              aria-label="Буцах"
              className={`${buttonStyles({ variant: 'nav', size: 'icon' })} shrink-0`}
              style={{ backgroundColor: 'var(--surface-subtle)' }}>
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <p className="text-foreground"
              style={{ ...TYPOGRAPHY.pageTitle, minWidth: 60 }}>
              {pageTitle}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEmojiPicker(true)}
            aria-label="Дадлын дүрс сонгох"
            className={`${buttonStyles({ variant: 'accent', size: 'icon' })} shrink-0`}
            style={{ backgroundColor: color.btn, fontSize: 18 }}>
            {selectedEmoji}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-5">

        {/* ── 1. Sentence builder (identity in narrative form) ── */}
        <div id="tour-form-sentence" className="mx-5">
          <motion.div className="rounded-[20px] bg-card px-4 py-4"
            animate={{
              boxShadow: showTitleError
                ? '0 1px 10px rgba(239,68,68,0.18)'
                : `0 1px 10px ${color.accent}18`,
            }}
            style={{
              border: `1.5px solid ${showTitleError ? '#ef444466' : color.accent + '30'}`,
            }}>
            <p style={{ ...TYPOGRAPHY.body, lineHeight: 2.4 }} className="text-foreground">
              <InlineInput value={precedingRoutine} onChange={setPrecedingRoutine}
                placeholder={currentHint.cue} accentColor={color.accent} />
              <span style={{ fontWeight: 500 }}> дараа </span>
              <InlineInput value={title} onChange={setTitle}
                placeholder={currentHint.routine} accentColor={color.accent} invalid={showTitleError} />
              <span style={{ fontWeight: 500 }}> дадлыг хийнэ.</span>
            </p>
            <div className="mt-2">
              <p style={{ ...TYPOGRAPHY.body, fontWeight: 500, marginBottom: 4 }} className="text-foreground">
                Ингэснээр би:
              </p>
              <MultilineInlineInput value={reason} onChange={setReason}
                placeholder={currentHint.reason} accentColor={color.accent} />
            </div>
            {showTitleError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ ...TYPOGRAPHY.caption, marginTop: 8, color: '#ef4444', fontWeight: 600 }}>
                Дадлын нэрээ оруулна уу
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* ── 2. Харагдах төрх (visual identity) ── */}
        <FormSection id="tour-form-appearance" label="Харагдац">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Дүрс</p>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEmojiPicker(true)}
                aria-label="Дадлын дүрс сонгох"
                className={buttonStyles({ variant: 'accent', size: 'iconLg' })}
                style={{ backgroundColor: color.btn, fontSize: 22 }}>
                {selectedEmoji}
              </motion.button>
            </div>
          </div>
          <Divider />
          <div className="px-4 py-3">
            <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, marginBottom: 10 }} className="text-foreground">Өнгө</p>
            <div className="flex gap-3">
              {PASTEL_LIST.map(c => {
                const clr = getHabitColor(c.id);
                return (
                  <motion.button key={c.id} whileTap={{ scale: 0.86 }}
                    onClick={() => setColorId(c.id)}
                    aria-label={`Өнгө: ${c.label}`}
                    className={`${buttonStyles({ variant: 'plain', size: 'bare' })} flex flex-col items-center gap-1.5`}>
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

        {/* ── 3. Хэмжилт (fundamental tracking decision — moved up) ── */}
        <FormSection id="tour-form-measurement" label="Хэмжилт">
          <FormRow label="Төрөл">
            <div className="flex gap-1.5">
              {(['binary', 'measurable'] as const).map(t => (
                <Chip key={t}
                  label={t === 'binary' ? 'Хийсэн/Хийгээгүй' : 'Хэмжигдэхүйц'}
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
                <FormRow label="Зорилт" sublabel="Зорилтот хэмжээ">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-9 rounded-[12px] flex items-center justify-center"
                      style={{ backgroundColor: 'var(--surface-subtle)' }}>
                      <input type="number" value={targetNum} onChange={e => setTargetNum(e.target.value)}
                        aria-label="Зорилтот хэмжээ"
                        className="bg-transparent focus:outline-none text-center w-full text-foreground"
                        style={{ ...TYPOGRAPHY.body, fontWeight: 500 }} />
                    </div>
                    <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowUnitPicker(p => !p)}
                      className={`${buttonStyles({ variant: 'accent', size: 'sm' })} h-9 flex items-center gap-1`}
                      style={{ backgroundColor: color.btn }}>
                      <span style={{ ...TYPOGRAPHY.bodySm, color: '#202325', fontWeight: 500 }}>{targetUnit}</span>
                    </motion.button>
                  </div>
                </FormRow>
                <AnimatePresence>
                  {showUnitPicker && (
                    <InlineOptions options={UNITS} allowCustom customPlaceholder="ж: цаг"
                      accentBg={color.btn}
                      onSelect={v => { setTargetUnit(v); setShowUnitPicker(false); }}
                      onClose={() => setShowUnitPicker(false)} />
                  )}
                </AnimatePresence>
                <Divider />
                <FormRow label="Хамгийн багадаа" sublabel="Ядаж энэ хэмжээтэй хийх" divider={false}>
                  <div className="w-16 h-9 rounded-[12px] flex items-center justify-center"
                    style={{ backgroundColor: 'var(--surface-subtle)' }}>
                    <input type="number" value={minNum} onChange={e => setMinNum(e.target.value)}
                      placeholder="-"
                      aria-label="Хамгийн бага хэмжээ"
                      className="bg-transparent focus:outline-none text-center w-full text-foreground"
                      style={{ ...TYPOGRAPHY.body, fontWeight: 500 }} />
                  </div>
                </FormRow>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

        {/* ── 4. Хийх өдрүүд (schedule) ── */}
        <FormSection id="tour-form-schedule" label="Хийх өдрүүд">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <p style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500 }} className="text-foreground">Өдрүүд</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDays([...WEEKDAY_KEYS])}
                  className={buttonStyles({ variant: 'plain', size: 'bare' })}
                  style={{ ...TYPOGRAPHY.micro, color: color.accent, fontWeight: 600 }}>Бүгд</button>
                <span style={{ fontSize: 11 }} className="text-muted-foreground">·</span>
                <button
                  onClick={() => setSelectedDays([...WORKDAY_KEYS])}
                  className={buttonStyles({ variant: 'plain', size: 'bare' })}
                  style={{ ...TYPOGRAPHY.micro, color: 'var(--text-muted-soft)', fontWeight: 600 }}>Ажлын</button>
              </div>
            </div>
            <WeekdayStrip
              selectedDays={selectedDays}
              accentBg={color.btn}
              accentRing={color.accent}
              onToggle={toggleDay}
            />
          </div>
        </FormSection>

        {/* ── 5. Ашиг тус (the why) ── */}
        <FormSection id="tour-form-benefits" label="Ашиг тус (Заавал биш)">
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
                aria-label="Ашиг тус нэмэх"
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

        {/* ── 6. Жижиг алхмууд (steps — no preseed, X/MAX counter) ── */}
        <FormSection id="tour-form-steps" label="Жижиг алхмууд (Заавал биш)">
          <div className="px-4 py-3 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <p style={TYPOGRAPHY.caption} className="text-muted-foreground flex-1">
                Жижиг алхмуудыг тодорхой болгосноор дадал илүү бодитой, амархан эхлэх боломжтой болно.
              </p>
              {steps.length > 0 && (
                <span style={{ ...TYPOGRAPHY.micro, fontWeight: 600 }} className="text-muted-foreground shrink-0">
                  {steps.length}/{MAX_STEPS}
                </span>
              )}
            </div>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color.btn, color: '#202325', ...TYPOGRAPHY.micro, fontWeight: 700 }}>
                  {index + 1}
                </div>
                <input
                  ref={(el) => { stepRefs.current[index] = el; }}
                  value={step}
                  onChange={e => updateStep(index, e.target.value)}
                  placeholder={`Алхам ${index + 1}`}
                  className="flex-1 rounded-[14px] px-3 py-2 bg-transparent text-foreground focus:outline-none"
                  style={{ border: '1px solid var(--surface-border-soft)', ...TYPOGRAPHY.bodySm }}
                />
                <button onClick={() => removeStep(index)}
                  aria-label={`Алхам ${index + 1} устгах`}
                  className={buttonStyles({ variant: 'secondary', size: 'iconSm' })}
                  style={{ backgroundColor: 'var(--surface-subtle)' }}>
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            ))}
            {steps.length < MAX_STEPS && (
              <motion.button whileTap={{ scale: 0.96 }} onClick={addStep}
                className={`${buttonStyles({ variant: 'secondary', size: 'sm' })} w-full justify-center`}
                style={{ backgroundColor: color.btn, color: color.accent, fontWeight: 600 }}>
                <AppPlusIcon className="w-3.5 h-3.5" style={{ color: color.accent }} />
                <span>{steps.length === 0 ? 'Эхний алхам нэмэх' : 'Алхам нэмэх'}</span>
              </motion.button>
            )}
          </div>
        </FormSection>

        {/* ── 7. Сануулга (reminders) ── */}
        <div id="tour-form-reminder">
        <FormSection label="Сануулга">
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
                      aria-label="Цагийн хүрээ нэмэх"
                      className={buttonStyles({ variant: 'accent', size: 'iconSm' })}
                      style={{ backgroundColor: color.btn }}>
                      <AppPlusIcon className="w-3.5 h-3.5" style={{ color: color.accent }} />
                    </motion.button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {timeWindows.map((tw, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="time" value={tw.start} onChange={e => updateTimeWindow(i, 'start', e.target.value)}
                          aria-label="Эхлэх цаг"
                          className="flex-1 rounded-xl px-3 py-1.5 bg-transparent text-foreground focus:outline-none"
                          style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, border: '1px solid var(--surface-border-soft)' }} />
                        <span className="text-muted-foreground" style={TYPOGRAPHY.caption}>–</span>
                        <input type="time" value={tw.end} onChange={e => updateTimeWindow(i, 'end', e.target.value)}
                          aria-label="Дуусах цаг"
                          className="flex-1 rounded-xl px-3 py-1.5 bg-transparent text-foreground focus:outline-none"
                          style={{ ...TYPOGRAPHY.bodySm, fontWeight: 500, border: '1px solid var(--surface-border-soft)' }} />
                        <button onClick={() => removeTimeWindow(i)}
                          aria-label="Цагийн хүрээ устгах"
                          className={`${buttonStyles({ variant: 'secondary', size: 'iconSm' })} shrink-0`}
                          style={{ backgroundColor: 'var(--surface-subtle)' }}>
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                    {timeWindows.length === 0 && (
                      <p style={TYPOGRAPHY.micro} className="text-muted-foreground">
                        Цагийн хүрээ нэмбэл сануулга тухайн цагт ирнэ.
                      </p>
                    )}
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
                          style={{ backgroundColor: color.btn, fontSize: 12, color: '#202325', fontWeight: 500 }}>
                          <MapPin className="w-3 h-3" style={{ color: color.accent }} />
                          {loc.label}
                          <button onClick={() => removeLocation(loc.label)}
                            aria-label={`${loc.label} байршил устгах`}
                            className={buttonStyles({ variant: 'secondary', size: 'iconSm' })}
                            style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: '#202325' }}>
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
        </div>

        {/* ── 8. Сануулгын бэлдэц (preview — collapsed by default at the end) ── */}
        <div className="mx-5">
          <button
            onClick={() => setShowPreview(p => !p)}
            className="w-full flex items-center justify-between rounded-[20px] bg-card px-4 py-3.5"
            style={{ boxShadow: SHADOW.card }}>
            <div className="flex flex-col items-start">
              <span style={{ ...TYPOGRAPHY.groupLabel, color: 'var(--text-muted-soft)' }}>Сануулгын бэлдэц</span>
              <span style={{ ...TYPOGRAPHY.caption, marginTop: 2 }} className="text-muted-foreground">
                Сануулгын текстийг урьдчилан харах
              </span>
            </div>
            {showPreview
              ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
          </button>
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <div className="rounded-[20px] overflow-hidden bg-card" style={{ boxShadow: SHADOW.card }}>
                  <div className="px-4 py-3 flex flex-col gap-3">
                    {[
                      { label: 'Үндсэн', text: reminderPreview.base },
                      { label: 'Өдөөгч + шалтгаан', text: reminderPreview.cueAndReason },
                      { label: 'Өдөөгч + ашиг тус', text: reminderPreview.cueAndBenefits },
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
        <motion.button whileTap={{ scale: saving ? 1 : 0.96 }} onClick={handleSave} disabled={saving}
          aria-busy={saving}
          className={`${buttonStyles({ variant: 'default', size: 'lg' })} flex items-center justify-center gap-2 disabled:opacity-60`}
          style={{ backgroundColor: CTA_DARK.bg, boxShadow: CTA_DARK.shadow, minWidth: 200 }}>
          {saving && <Spinner size={16} color={CTA_DARK.text} />}
          <span style={{ ...TYPOGRAPHY.navTitle, fontWeight: 500, color: CTA_DARK.text }}>
            {saving ? 'Хадгалж байна…' : submitLabel}
          </span>
        </motion.button>
      </div>

      {/* Emoji picker bottom sheet (single source of truth, opens from header or appearance row) */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPickerSheet
            value={selectedEmoji}
            accentColor={color.accent}
            accentBg={color.btn}
            onSelect={setSelectedEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Unsaved changes confirmation */}
      <AnimatePresence>
        {showUnsavedConfirm && (
          <UnsavedChangesDialog
            onCancel={() => setShowUnsavedConfirm(false)}
            onDiscard={() => {
              setShowUnsavedConfirm(false);
              navigate(-1);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
