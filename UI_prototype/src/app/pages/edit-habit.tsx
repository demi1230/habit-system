import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import { useHabit, updateHabit, getGoalTags, type HabitChunk } from '../store';
import { getHabitColor, PASTEL_LIST, CTA_DARK } from '../lib/habit-colors';

const DAYS_MN = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const UNITS   = ['удаа', 'мин', 'хуудас', 'литр', 'км', 'шил'];
const LOCATIONS  = ['Гэр 🏠', 'Сургууль 🏫', 'Биеийн тамир 💪', 'Оффис 💼'];
const ROUTINES   = ['өглөөний цайгаа уусны дараа', 'унтахын өмнө', 'хичээл дуусаад', 'гэртээ ирэхдээ'];
const TIME_SLOTS = ['06:00–08:00', '08:00–10:00', '12:00–14:00', '18:00–20:00', '20:00–22:00'];

// ── Reusable sub-components (same as create-habit) ─────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-[24px] px-5 py-4 mx-5"
      style={{ boxShadow: '0px 1px 6px rgba(0,0,0,0.07)' }}>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.45)', marginBottom: 12, letterSpacing: '0.02em' }}>
        {title.toUpperCase()}
      </p>
      {children}
    </div>
  );
}

function AddRow({ label, accentBtn, onTap }: { label: string; accentBtn: string; onTap: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>{label}</span>
      <motion.button whileTap={{ scale: 0.88 }} onClick={onTap}
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: accentBtn }}>
        <Plus className="w-4 h-4" style={{ color: '#474747' }} />
      </motion.button>
    </div>
  );
}

function TagPill({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card"
      style={{ border: '1px solid rgba(0,0,0,0.09)', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
      {label}
      {onRemove && (
        <button onClick={onRemove}
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.10)' }}>
          <X className="w-2.5 h-2.5" style={{ color: '#474747' }} />
        </button>
      )}
    </div>
  );
}

function InlineOptions({ options, onSelect, onClose }: {
  options: string[]; onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
      className="overflow-hidden mt-2"
    >
      <div className="flex flex-wrap gap-2 py-1">
        {options.map(o => (
          <button key={o} onClick={() => { onSelect(o); onClose(); }}
            className="px-3 py-1.5 rounded-full text-left"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
            {o}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export function EditHabitPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const habit = useHabit(id);
  const [showSuccess, setShowSuccess] = useState(false);
  const goalTags = getGoalTags();

  // Core
  const [title, setTitle]   = useState('');
  const [colorId, setColorId] = useState('lavender');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [goalTag, setGoalTag] = useState('mindfulness');

  // Motivation
  const [reason, setReason]     = useState('');
  const [routine, setRoutine]   = useState('');
  const [duration, setDuration] = useState('');
  const [goal, setGoal]         = useState('');

  // Schedule
  const [selectedDays, setSelectedDays] = useState<string[]>([...DAYS_EN]);

  // Target
  const [targetNum, setTargetNum]   = useState('1');
  const [minNum, setMinNum]         = useState('');
  const [targetUnit, setTargetUnit] = useState('удаа');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  // Reminder
  const [selectedTime, setSelectedTime]           = useState('');
  const [showTimePicker, setShowTimePicker]       = useState(false);
  const [selectedLocation, setSelectedLocation]   = useState('');
  const [showLocPicker, setShowLocPicker]         = useState(false);
  const [selectedRoutine, setSelectedRoutine]     = useState('');
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);

  // Chunks
  const [chunks, setChunks]           = useState<HabitChunk[]>([]);
  const [showAddChunk, setShowAddChunk] = useState(false);
  const [newChunkName, setNewChunkName] = useState('');

  // Populate from existing habit
  useEffect(() => {
    if (!habit) return;
    setTitle(habit.title);
    setColorId(habit.habitColor ?? 'lavender');
    setGoalTag(habit.goalTag ?? 'mindfulness');
    setReason(habit.personalReason ?? '');
    setSelectedDays([...habit.days]);
    setTargetNum(habit.targetValue?.toString() ?? '1');
    setMinNum(habit.minValue?.toString() ?? '');
    setTargetUnit(habit.unit ?? 'удаа');
    setChunks(habit.chunks ?? []);
    if (habit.timeWindow) setSelectedTime(habit.timeWindow);
    if (habit.location) setSelectedLocation(habit.location);
    if (habit.precedingRoutine) setSelectedRoutine(habit.precedingRoutine);
    if (habit.implementationIntention) {
      const parts = habit.implementationIntention.split('→');
      if (parts.length === 2) {
        setRoutine(parts[0].trim());
        setGoal(parts[1].trim());
      }
    }
  }, [habit]);

  if (!habit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p style={{ fontSize: '48px' }}>🔍</p>
          <h3 className="mt-2">Дадал олдсонгүй</h3>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-3 rounded-[24px]"
            style={{ backgroundColor: CTA_DARK.bg, color: CTA_DARK.text }}>
            Нүүр хуудас руу
          </button>
        </div>
      </div>
    );
  }

  const color = getHabitColor(colorId);
  const toggleDay = (en: string) =>
    setSelectedDays(p => p.includes(en) ? p.filter(d => d !== en) : [...p, en]);

  const addChunk = () => {
    if (!newChunkName.trim()) return;
    setChunks(p => [...p, { id: Date.now().toString(), name: newChunkName.trim() }]);
    setNewChunkName('');
    setShowAddChunk(false);
  };

  const handleSave = () => {
    updateHabit(habit.id, {
      title: title.trim() || habit.title,
      goalTag,
      habitColor: colorId,
      unit: targetUnit,
      targetValue: parseFloat(targetNum) || habit.targetValue || 1,
      minValue: minNum ? parseFloat(minNum) : undefined,
      days: selectedDays.length > 0 ? selectedDays : [...DAYS_EN],
      timeWindow: selectedTime || undefined,
      location: selectedLocation || undefined,
      precedingRoutine: selectedRoutine || (routine || undefined),
      personalReason: reason || undefined,
      implementationIntention: (routine && goal) ? `${routine} → ${goal}` : undefined,
      chunks: chunks.length > 0 ? chunks : undefined,
      reminderEnabled: !!selectedTime,
      reminderWindow: selectedTime || undefined,
    });
    setShowSuccess(true);
    setTimeout(() => navigate(`/habit/${habit.id}`), 1300);
  };

  // ── Success ──
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
            <Check className="w-9 h-9" style={{ color: color.accent }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>Дадал шинэчлэгдлээ!</h2>
          <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginTop: 6 }}>Өөрчлөлтүүд хадгалагдсан</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-background px-5 pt-14 pb-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>

          <div className="flex-1">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Дадлын нэр"
              className="w-full bg-transparent focus:outline-none"
              style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}
            />
          </div>

          {/* Color toggle */}
          <motion.button whileTap={{ scale: 0.92 }}
            onClick={() => setShowColorPicker(p => !p)}
            className="px-4 py-1.5 rounded-full flex items-center gap-2"
            style={{ backgroundColor: color.btn }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.accent }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#232323' }}>өнгө</span>
          </motion.button>
        </div>

        {/* Color picker */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3 pt-4 pb-1">
                {PASTEL_LIST.map(c => {
                  const clr = getHabitColor(c.id);
                  return (
                    <motion.button key={c.id} whileTap={{ scale: 0.88 }}
                      onClick={() => { setColorId(c.id); setShowColorPicker(false); }}
                      className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 rounded-full transition-all"
                        style={{
                          backgroundColor: clr.btn,
                          boxShadow: colorId === c.id ? `0 0 0 3px white, 0 0 0 5px ${clr.accent}` : 'none',
                        }} />
                      <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)' }}>{c.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4 pt-5">

        {/* ── GoalTag ── */}
        <SectionCard title="Ангилал">
          <div className="flex flex-wrap gap-2">
            {goalTags.map(tag => {
              const isActive = goalTag === tag.id;
              return (
                <motion.button key={tag.id} whileTap={{ scale: 0.92 }}
                  onClick={() => setGoalTag(tag.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: isActive ? color.btn : 'rgba(0,0,0,0.05)',
                    boxShadow: isActive ? `0 0 0 1.5px ${color.accent}60` : 'none',
                  }}>
                  <span style={{ fontSize: 16 }}>{tag.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? '#202325' : 'rgba(0,0,0,0.55)' }}>
                    {tag.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Motivation Sentence ── */}
        <div className="bg-card rounded-[24px] px-5 py-4 mx-5"
          style={{ boxShadow: '0px 1px 6px rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.45)', marginBottom: 12, letterSpacing: '0.02em' }}>
            ЗОРИЛГО
          </p>

          {/* Live preview */}
          {(reason || routine || goal) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-[16px] px-4 py-3 mb-4"
              style={{ backgroundColor: color.btn + '88' }}>
              <p style={{ fontSize: 13, color: '#202325', lineHeight: 1.7, fontStyle: 'italic' }}>
                {reason ? `Би ${reason} учраас` : ''}
                {routine ? ` ${routine} дараа` : ''}
                {duration ? ` ${duration}` : ''}
                {goal ? ` ${goal}.` : ''}
              </p>
            </motion.div>
          )}

          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>Би</span>
            <div className="flex-1 min-w-[100px] border-b border-dashed border-gray-300">
              <input value={reason} onChange={e => setReason(e.target.value)}
                placeholder="чийрэг хүн болмоор байгаа..."
                className="w-full bg-transparent focus:outline-none pb-0.5"
                style={{ fontSize: 13, color: 'var(--foreground)' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>учраас</span>
          </div>

          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            <div className="flex-1 min-w-[80px] border-b border-dashed border-gray-300">
              <input value={routine} onChange={e => setRoutine(e.target.value)}
                placeholder="өглөөний цайгаа уусныхаа..."
                className="w-full bg-transparent focus:outline-none pb-0.5"
                style={{ fontSize: 13, color: 'var(--foreground)' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>дараа</span>
            <div className="border-b border-dashed border-gray-300 w-16">
              <input value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="10 мин"
                className="w-full bg-transparent focus:outline-none pb-0.5 text-center"
                style={{ fontSize: 13, color: 'var(--foreground)' }} />
            </div>
          </div>

          <div className="border-b border-dashed border-gray-300">
            <input value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="гүймээр байна."
              className="w-full bg-transparent focus:outline-none pb-0.5"
              style={{ fontSize: 13, color: 'var(--foreground)' }} />
          </div>

          <AnimatePresence>
            {routine.length > 0 && ROUTINES.some(r => r.toLowerCase().includes(routine.toLowerCase().slice(0, 3))) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-wrap gap-2 mt-3">
                {ROUTINES.filter(r => r.toLowerCase().includes(routine.toLowerCase().slice(0, 3))).map(r => (
                  <button key={r} onClick={() => setRoutine(r)}
                    className="px-3 py-1 rounded-full"
                    style={{ fontSize: 11, backgroundColor: color.btn, color: '#474747' }}>
                    {r}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Schedule ── */}
        <SectionCard title="Өдөр">
          <div className="flex justify-between gap-1">
            {DAYS_MN.map((mn, i) => {
              const en = DAYS_EN[i];
              const active = selectedDays.includes(en);
              return (
                <motion.button key={en} whileTap={{ scale: 0.88 }}
                  onClick={() => toggleDay(en)}
                  className="flex-1 py-1.5 rounded-[16px] flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: active ? color.btn : 'transparent',
                    fontSize: 12, fontWeight: active ? 600 : 400,
                    color: active ? '#202325' : 'rgba(0,0,0,0.5)',
                  }}>
                  {mn}
                </motion.button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Target ── */}
        <SectionCard title="Зорилтот хэмжээ">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>Зорилт</p>
              <div className="h-[38px] flex items-center justify-center px-4 rounded-[16px]"
                style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                <input type="number" value={targetNum} onChange={e => setTargetNum(e.target.value)}
                  className="bg-transparent focus:outline-none text-center w-full"
                  style={{ fontSize: 14, color: 'var(--foreground)' }} />
              </div>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>Хамгийн бага</p>
              <div className="h-[38px] flex items-center justify-center px-4 rounded-[16px]"
                style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                <input type="number" value={minNum} onChange={e => setMinNum(e.target.value)}
                  placeholder="—"
                  className="bg-transparent focus:outline-none text-center w-full"
                  style={{ fontSize: 14, color: 'var(--foreground)' }} />
              </div>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>Нэгж</p>
              <motion.button whileTap={{ scale: 0.94 }}
                onClick={() => setShowUnitPicker(p => !p)}
                className="h-[38px] w-full flex items-center justify-center px-4 rounded-[16px]"
                style={{ backgroundColor: color.btn }}>
                <span style={{ fontSize: 13, color: '#202325' }}>{targetUnit}</span>
              </motion.button>
            </div>
          </div>
          <AnimatePresence>
            {showUnitPicker && (
              <InlineOptions options={UNITS} onSelect={setTargetUnit} onClose={() => setShowUnitPicker(false)} />
            )}
          </AnimatePresence>
        </SectionCard>

        {/* ── Reminder ── */}
        <SectionCard title="Сануулга">
          <div className="flex flex-col gap-3">
            <div>
              <AddRow label="Цаг" accentBtn={color.btn} onTap={() => setShowTimePicker(p => !p)} />
              <AnimatePresence>
                {selectedTime && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2">
                    <TagPill label={selectedTime} onRemove={() => setSelectedTime('')} />
                  </motion.div>
                )}
                {showTimePicker && (
                  <InlineOptions options={TIME_SLOTS}
                    onSelect={v => { setSelectedTime(v); setShowTimePicker(false); }}
                    onClose={() => setShowTimePicker(false)} />
                )}
              </AnimatePresence>
            </div>
            <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />
            <div>
              <AddRow label="Байршил" accentBtn={color.btn} onTap={() => setShowLocPicker(p => !p)} />
              <AnimatePresence>
                {selectedLocation && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2">
                    <TagPill label={selectedLocation} onRemove={() => setSelectedLocation('')} />
                  </motion.div>
                )}
                {showLocPicker && (
                  <InlineOptions options={LOCATIONS}
                    onSelect={v => { setSelectedLocation(v); setShowLocPicker(false); }}
                    onClose={() => setShowLocPicker(false)} />
                )}
              </AnimatePresence>
            </div>
            <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />
            <div>
              <AddRow label="Өмнөх хэрэглүүр" accentBtn={color.btn} onTap={() => setShowRoutinePicker(p => !p)} />
              <AnimatePresence>
                {selectedRoutine && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2">
                    <TagPill label={selectedRoutine} onRemove={() => setSelectedRoutine('')} />
                  </motion.div>
                )}
                {showRoutinePicker && (
                  <InlineOptions options={ROUTINES}
                    onSelect={v => { setSelectedRoutine(v); setShowRoutinePicker(false); }}
                    onClose={() => setShowRoutinePicker(false)} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </SectionCard>

        {/* ── Chunks ── */}
        <SectionCard title="Дадлын жижиглэх">
          <div className="flex flex-col gap-2">
            {chunks.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 py-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color.btn, fontSize: 11, fontWeight: 600, color: '#474747' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 13, color: 'var(--foreground)', flex: 1 }}>{c.name}</span>
                <button onClick={() => setChunks(p => p.filter(x => x.id !== c.id))}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
                  <X className="w-3 h-3" style={{ color: '#474747' }} />
                </button>
              </motion.div>
            ))}

            <AnimatePresence>
              {showAddChunk && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      value={newChunkName}
                      onChange={e => setNewChunkName(e.target.value)}
                      placeholder="Алхмын нэр..."
                      onKeyDown={e => e.key === 'Enter' && addChunk()}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-[16px] focus:outline-none"
                      style={{
                        fontSize: 13, backgroundColor: 'rgba(0,0,0,0.05)',
                        border: `1.5px solid ${color.btn}`, color: 'var(--foreground)',
                      }} />
                    <motion.button whileTap={{ scale: 0.88 }} onClick={addChunk}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: color.btn }}>
                      <Plus className="w-4 h-4" style={{ color: '#474747' }} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AddRow label="Алхам нэмэх" accentBtn={color.btn} onTap={() => setShowAddChunk(p => !p)} />
          </div>
        </SectionCard>
      </div>

      {/* ── Save Button ── */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-10 pt-4"
        style={{ background: 'linear-gradient(to top, var(--background) 70%, transparent)' }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          className="flex items-center justify-center px-10 py-3.5 rounded-full"
          style={{ backgroundColor: CTA_DARK.bg, boxShadow: CTA_DARK.shadow }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: CTA_DARK.text }}>Хадгалах</span>
        </motion.button>
      </div>
    </div>
  );
}
