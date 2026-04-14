import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, BarChart2, Plus, BookOpen, User,
  Flame, Zap, TrendingUp, Shield, Check,
  Star, Heart, Calendar, Bell, Sparkles,
  ChevronRight, Award, Target, Coffee,
  Moon, Dumbbell, BookMarked, Droplets,
} from 'lucide-react';

// ── Design Tokens ─────────────────────────────────────
const DS = {
  bg:       '#0B1E2D',
  bgCard:   '#122334',
  bgDeep:   '#071520',
  teal:     '#1A8A7A',
  tealSoft: 'rgba(26,138,122,0.18)',

  // Pastel cards
  lavender: '#EAE6FF',
  lavenderMid: '#C4BBFF',
  mint:     '#D4F5ED',
  mintMid:  '#A0E8D8',
  pink:     '#FFE2EF',
  pinkMid:  '#FFB3D1',
  blue:     '#D6EEFF',
  blueMid:  '#94CCFF',
  peach:    '#FFE8D4',
  peachMid: '#FFBB8A',
  yellow:   '#FFF3C4',
  yellowMid:'#FFD980',

  // Charcoal / accent
  charcoal:   '#1C2B3A',
  charcoalMid:'#2E4055',
  purple:     '#8B5CF6',
  purpleSoft: 'rgba(139,92,246,0.18)',
  purpleGlow: 'rgba(139,92,246,0.35)',
  green:      '#22C55E',
  amber:      '#F59E0B',
  red:        '#EF4444',

  // Text
  textPrimary:   '#EBF2FA',
  textSecondary: 'rgba(235,242,250,0.55)',
  textMuted:     'rgba(235,242,250,0.35)',
  textOnLight:   '#1C2B3A',
  textOnLightMid:'rgba(28,43,58,0.65)',
};

const RADIUS = { sm: 14, md: 18, lg: 24, xl: 32, full: 999 };

// ── Section Header ────────────────────────────────────
function SectionLabel({ number, name }: { number: string; name: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: DS.purpleSoft, border: `1px solid ${DS.purpleGlow}` }}
      >
        <span style={{ fontSize: '11px', color: DS.purple, fontFamily: 'Quicksand, sans-serif', fontWeight: 700 }}>
          {number}
        </span>
      </div>
      <span style={{ fontSize: '13px', color: DS.textSecondary, fontFamily: 'Quicksand, sans-serif', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {name}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: `rgba(235,242,250,0.07)` }} />
    </div>
  );
}

// ── 1. Habit Card ─────────────────────────────────────
const habitCards = [
  { emoji: '🧘', title: 'Morning Meditation', tag: 'Mindfulness', streak: 14, pct: 92, bg: DS.lavender, accent: '#7C70E8', tagBg: '#D4CFFF' },
  { emoji: '💧', title: 'Drink 8 Glasses', tag: 'Health', streak: 7,  pct: 70, bg: DS.mint,     accent: '#18A68A', tagBg: '#B2EDE0' },
  { emoji: '📖', title: 'Read 20 Pages', tag: 'Study',  streak: 21, pct: 85, bg: DS.pink,     accent: '#E0608A', tagBg: '#FFD0E4' },
  { emoji: '🏃', title: 'Evening Run',    tag: 'Fitness', streak: 5,  pct: 55, bg: DS.blue,     accent: '#3B8FD4', tagBg: '#C0DEFF' },
];

function HabitCard({ card, index }: { card: typeof habitCards[0]; index: number }) {
  const [done, setDone] = useState(false);
  const bars = 7;
  const filled = Math.round((card.pct / 100) * bars);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative overflow-hidden flex-shrink-0"
      style={{
        width: 220,
        borderRadius: RADIUS.lg,
        backgroundColor: card.bg,
        padding: '18px 16px 16px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)`,
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${card.accent}28 0%, transparent 70%)`,
          transform: 'translate(20px, -20px)',
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-3 relative">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${card.accent}18` }}
        >
          <span style={{ fontSize: '22px' }}>{card.emoji}</span>
        </div>
        <span
          className="px-2.5 py-1 rounded-full"
          style={{ fontSize: '10px', fontWeight: 600, color: card.accent, backgroundColor: card.tagBg, fontFamily: 'Inter, sans-serif' }}
        >
          {card.tag}
        </span>
      </div>

      {/* Title */}
      <p style={{ fontSize: '15px', fontWeight: 600, color: DS.textOnLight, fontFamily: 'Quicksand, sans-serif', lineHeight: 1.3, marginBottom: 10 }}>
        {card.title}
      </p>

      {/* Week dots */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: bars }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{ backgroundColor: i < filled ? card.accent : `${card.accent}28` }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" style={{ color: card.accent }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: card.accent, fontFamily: 'Inter, sans-serif' }}>
            {card.streak}d
          </span>
          <span style={{ fontSize: '12px', color: DS.textOnLightMid, marginLeft: 6 }}>{card.pct}%</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setDone(!done)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: done ? card.accent : `${card.accent}20`,
            border: `1.5px solid ${done ? card.accent : `${card.accent}40`}`,
          }}
        >
          <Check className="w-3.5 h-3.5" style={{ color: done ? '#fff' : card.accent }} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── 2. Stat Card ──────────────────────────────────────
const stats = [
  { icon: <Flame className="w-5 h-5" />, label: 'Streak',     value: '21',  sub: 'days',    bg: DS.peach,    accent: '#E07820', glow: 'rgba(224,120,32,0.22)' },
  { icon: <Zap className="w-5 h-5" />,   label: 'XP Earned',  value: '1,240', sub: 'points', bg: DS.yellow,   accent: '#D4A010', glow: 'rgba(212,160,16,0.22)' },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Rate',  value: '88%', sub: 'completion', bg: DS.mint,  accent: '#18A68A', glow: 'rgba(24,166,138,0.22)' },
  { icon: <Shield className="w-5 h-5" />,label: 'Strength',   value: '74',  sub: '/100',    bg: DS.lavender, accent: '#7C70E8', glow: 'rgba(124,112,232,0.22)' },
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden flex-1"
      style={{
        borderRadius: RADIUS.md,
        backgroundColor: stat.bg,
        padding: '14px 12px',
        boxShadow: `0 4px 20px ${stat.glow}, 0 1px 4px rgba(0,0,0,0.06)`,
        minWidth: 0,
      }}
    >
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: 60, height: 60, borderRadius: '50%',
          background: `radial-gradient(circle, ${stat.accent}30 0%, transparent 70%)`,
          transform: 'translate(10px, 10px)',
        }}
      />
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
        style={{ backgroundColor: `${stat.accent}20`, color: stat.accent }}
      >
        {stat.icon}
      </div>
      <p style={{ fontSize: '20px', fontWeight: 700, color: DS.textOnLight, fontFamily: 'Quicksand, sans-serif', lineHeight: 1 }}>
        {stat.value}
      </p>
      <p style={{ fontSize: '11px', color: stat.accent, fontWeight: 600, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
        {stat.sub}
      </p>
      <p style={{ fontSize: '11px', color: DS.textOnLightMid, fontFamily: 'Inter, sans-serif', marginTop: 1 }}>
        {stat.label}
      </p>
    </motion.div>
  );
}

// ── 3. Bottom Nav ─────────────────────────────────────
const navItems = [
  { icon: Home,     label: 'Home' },
  { icon: BarChart2,label: 'Stats' },
  { icon: Plus,     label: 'Add',  fab: true },
  { icon: BookOpen, label: 'Learn' },
  { icon: User,     label: 'Me' },
];

function BottomNav() {
  const [active, setActive] = useState(0);
  return (
    <div
      className="flex items-center justify-around px-2"
      style={{
        borderRadius: RADIUS.xl,
        backgroundColor: DS.charcoal,
        padding: '10px 8px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        border: `1px solid rgba(255,255,255,0.06)`,
      }}
    >
      {navItems.map((item, i) => {
        const Icon = item.icon;
        const isActive = active === i && !item.fab;

        if (item.fab) {
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActive(i)}
              className="flex items-center justify-center -mt-5"
              style={{
                width: 52, height: 52,
                borderRadius: RADIUS.full,
                background: `linear-gradient(135deg, ${DS.purple} 0%, #6D28D9 100%)`,
                boxShadow: `0 4px 20px ${DS.purpleGlow}`,
                border: `2px solid rgba(255,255,255,0.15)`,
              }}
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.button>
          );
        }

        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="flex flex-col items-center gap-1 py-1 px-3 relative"
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: DS.purpleSoft }}
              />
            )}
            <Icon
              className="w-5 h-5 relative"
              style={{ color: isActive ? DS.purple : DS.textSecondary }}
            />
            <span
              className="relative"
              style={{
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                color: isActive ? DS.purple : DS.textSecondary,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── 4. Floating Add Button ────────────────────────────
function FloatingAddButton() {
  const [open, setOpen] = useState(false);
  const actions = [
    { emoji: '✨', label: 'New Habit',    color: DS.purple },
    { emoji: '📝', label: 'Quick Log',    color: DS.teal },
    { emoji: '🎯', label: 'Set Goal',     color: '#E07820' },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence>
        {open && (
          <>
            {actions.map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.8 }}
                transition={{ delay: (actions.length - 1 - i) * 0.05 }}
                className="flex items-center gap-3"
              >
                <span
                  className="px-4 py-1.5 rounded-full"
                  style={{
                    fontSize: '13px', fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: DS.charcoal,
                    color: DS.textPrimary,
                    border: `1px solid rgba(255,255,255,0.08)`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  {a.label}
                </span>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: a.color,
                    boxShadow: `0 4px 16px ${a.color}50`,
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{a.emoji}</span>
                </div>
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 flex items-center justify-center"
        style={{
          borderRadius: RADIUS.lg,
          background: `linear-gradient(135deg, ${DS.purple} 0%, #5B21B6 100%)`,
          boxShadow: `0 8px 28px ${DS.purpleGlow}`,
          border: `2px solid rgba(255,255,255,0.15)`,
        }}
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>
      <p style={{ fontSize: '11px', color: DS.textMuted, fontFamily: 'Inter, sans-serif' }}>
        {open ? 'tap to close' : 'tap to expand'}
      </p>
    </div>
  );
}

// ── 5. Progress Ring ──────────────────────────────────
function ProgressRing({ pct, size, strokeWidth, color, bg, label, value }: {
  pct: number; size: number; strokeWidth: number;
  color: string; bg: string; label: string; value: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={bg}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: size * 0.22, fontWeight: 700, color: DS.textPrimary, fontFamily: 'Quicksand, sans-serif', lineHeight: 1 }}>
            {value}
          </span>
          <span style={{ fontSize: size * 0.11, color: DS.textSecondary, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 6. Calendar Strip ─────────────────────────────────
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function CalendarStrip() {
  const [selected, setSelected] = useState(2); // Wednesday = today
  const today = 2;
  const dates = [10, 11, 12, 13, 14, 15, 16];
  const completed = [0, 1]; // Mon, Tue completed
  const month = 'April 2026';

  return (
    <div
      style={{
        borderRadius: RADIUS.lg,
        backgroundColor: DS.charcoal,
        padding: '16px 14px',
        border: `1px solid rgba(255,255,255,0.06)`,
      }}
    >
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: '14px', fontWeight: 600, color: DS.textPrimary, fontFamily: 'Quicksand, sans-serif' }}>
          {month}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DS.purple }} />
          <span style={{ fontSize: '11px', color: DS.textSecondary, fontFamily: 'Inter, sans-serif' }}>4 habits today</span>
        </div>
      </div>

      {/* Days */}
      <div className="flex justify-between">
        {DAYS.map((day, i) => {
          const isToday = i === today;
          const isSelected = i === selected;
          const isDone = completed.includes(i);
          const isPast = i < today;

          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  color: isToday ? DS.purple : DS.textMuted,
                }}
              >
                {day}
              </span>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-2xl flex items-center justify-center relative"
                style={{
                  backgroundColor: isSelected
                    ? DS.purple
                    : isToday
                    ? DS.purpleSoft
                    : 'transparent',
                  border: isToday && !isSelected ? `1.5px solid ${DS.purple}` : 'none',
                  boxShadow: isSelected ? `0 4px 14px ${DS.purpleGlow}` : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isToday || isSelected ? 700 : 400,
                    fontFamily: 'Quicksand, sans-serif',
                    color: isSelected ? '#fff' : isToday ? DS.purple : DS.textPrimary,
                  }}
                >
                  {dates[i]}
                </span>
                {isDone && !isSelected && (
                  <div
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: DS.green }}
                  />
                )}
              </motion.div>

              {/* Habit completion bar */}
              <div
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: isDone
                    ? DS.green
                    : isPast && !isDone
                    ? DS.red + '80'
                    : DS.tealSoft,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 7. Input Field ────────────────────────────────────
function InputField({
  label, placeholder, hint, icon, state = 'default', value = ''
}: {
  label: string; placeholder: string; hint?: string;
  icon?: React.ReactNode; state?: 'default' | 'focused' | 'filled' | 'error';
  value?: string;
}) {
  const borderColor =
    state === 'focused' ? DS.purple :
    state === 'error'   ? DS.red :
    state === 'filled'  ? `rgba(255,255,255,0.15)` :
    `rgba(255,255,255,0.08)`;

  const bgColor =
    state === 'focused' ? `rgba(139,92,246,0.07)` :
    state === 'error'   ? `rgba(239,68,68,0.07)` :
    DS.charcoal;

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 600,
          color: state === 'error' ? DS.red : DS.textSecondary,
          fontFamily: 'Inter, sans-serif',
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4"
        style={{
          height: 52,
          borderRadius: RADIUS.md,
          backgroundColor: bgColor,
          border: `1.5px solid ${borderColor}`,
          transition: 'all 0.2s',
          boxShadow: state === 'focused' ? `0 0 0 3px ${DS.purpleSoft}` : 'none',
        }}
      >
        {icon && (
          <div style={{ color: state === 'focused' ? DS.purple : DS.textMuted }}>
            {icon}
          </div>
        )}
        <span
          style={{
            flex: 1,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: value ? DS.textPrimary : DS.textMuted,
          }}
        >
          {value || placeholder}
        </span>
        {state === 'filled' && (
          <Check className="w-4 h-4" style={{ color: DS.green }} />
        )}
        {state === 'error' && (
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: DS.red }}>
            <span style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>!</span>
          </div>
        )}
      </div>
      {hint && (
        <p
          style={{
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            color: state === 'error' ? DS.red : DS.textMuted,
            marginTop: 6,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ── 8. CTA Button ─────────────────────────────────────
function CTAButton({ variant, label, icon, width = 'full' }: {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal';
  label: string;
  icon?: React.ReactNode;
  width?: 'full' | 'auto';
}) {
  const styles: Record<string, { bg: string; color: string; border: string; shadow: string }> = {
    primary: {
      bg: `linear-gradient(135deg, ${DS.purple} 0%, #5B21B6 100%)`,
      color: '#fff',
      border: 'none',
      shadow: `0 6px 20px ${DS.purpleGlow}`,
    },
    secondary: {
      bg: DS.charcoalMid,
      color: DS.textPrimary,
      border: `1px solid rgba(255,255,255,0.1)`,
      shadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
    ghost: {
      bg: 'transparent',
      color: DS.purple,
      border: `1.5px solid ${DS.purple}`,
      shadow: 'none',
    },
    danger: {
      bg: 'rgba(239,68,68,0.12)',
      color: DS.red,
      border: `1.5px solid rgba(239,68,68,0.3)`,
      shadow: 'none',
    },
    teal: {
      bg: `linear-gradient(135deg, ${DS.teal} 0%, #0E6B5C 100%)`,
      color: '#fff',
      border: 'none',
      shadow: `0 6px 20px rgba(26,138,122,0.35)`,
    },
  };

  const s = styles[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className="flex items-center justify-center gap-2"
      style={{
        width: width === 'full' ? '100%' : 'auto',
        height: 52,
        borderRadius: RADIUS.md,
        background: s.bg,
        color: s.color,
        border: s.border || 'none',
        boxShadow: s.shadow,
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        paddingLeft: width === 'auto' ? 20 : 0,
        paddingRight: width === 'auto' ? 20 : 0,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

// ── 9. Empty State ────────────────────────────────────
function EmptyState() {
  return (
    <div
      className="flex flex-col items-center text-center py-8 px-6"
      style={{
        borderRadius: RADIUS.lg,
        backgroundColor: DS.charcoal,
        border: `1.5px dashed rgba(255,255,255,0.1)`,
      }}
    >
      {/* Illustrated placeholder */}
      <div className="relative mb-4">
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${DS.lavender} 0%, ${DS.mint} 100%)`,
            boxShadow: '0 8px 32px rgba(139,92,246,0.2)',
          }}
        >
          <Sparkles className="w-9 h-9" style={{ color: DS.purple }} />
        </motion.div>
        {/* Orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
          style={{ transformOrigin: 'center' }}
        >
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: DS.pink,
              top: -4, left: '50%', transform: 'translateX(-50%)',
              boxShadow: '0 0 6px rgba(255,100,150,0.5)',
            }}
          />
        </motion.div>
      </div>

      <h3
        style={{
          fontSize: '17px',
          fontWeight: 700,
          color: DS.textPrimary,
          fontFamily: 'Quicksand, sans-serif',
          marginBottom: 8,
        }}
      >
        No habits yet
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: DS.textSecondary,
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.6,
          marginBottom: 20,
          maxWidth: 240,
        }}
      >
        Start building routines that stick. Add your first habit and watch yourself grow 🌱
      </p>
      <CTAButton
        variant="primary"
        label="Add My First Habit"
        icon={<Plus className="w-4 h-4" />}
      />
    </div>
  );
}

// ── 10. Celebration Card ──────────────────────────────
function CelebrationCard() {
  const [claimed, setClaimed] = useState(false);

  return (
    <div className="relative overflow-hidden" style={{ borderRadius: RADIUS.xl }}>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #2D1B69 0%, #1A0A3D 50%, #0D1F2D 100%)`,
        }}
      />
      {/* Decorative circles */}
      {[
        { size: 160, x: '-20%', y: '-30%', color: `${DS.purple}30` },
        { size: 120, x: '60%',  y: '40%',  color: `rgba(26,138,122,0.2)` },
        { size: 80,  x: '30%',  y: '-10%', color: `rgba(255,192,204,0.15)` },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: c.size, height: c.size,
            left: c.x, top: c.y,
            backgroundColor: c.color,
            filter: 'blur(20px)',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative px-5 py-6">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${DS.amber} 0%, #D97706 100%)`, boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}
          >
            <Award className="w-4 h-4 text-white" />
          </div>
          <span
            className="px-3 py-1 rounded-full"
            style={{
              fontSize: '11px', fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              background: `rgba(245,158,11,0.15)`,
              color: DS.amber,
              border: `1px solid rgba(245,158,11,0.3)`,
              letterSpacing: '0.05em',
            }}
          >
            MILESTONE UNLOCKED
          </span>
        </div>

        {/* Main content */}
        <div className="flex items-start gap-4 mb-5">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${DS.lavender} 0%, ${DS.pink} 100%)`,
              boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
            }}
          >
            <span style={{ fontSize: '30px' }}>🏆</span>
          </motion.div>
          <div className="flex-1">
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: 'Quicksand, sans-serif', lineHeight: 1.2, marginBottom: 6 }}>
              21-Day Streak!
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
              You've built a real habit. Three weeks of consistency — you're unstoppable 🌟
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex gap-2 mb-5"
          style={{
            padding: '12px 14px',
            borderRadius: RADIUS.md,
            backgroundColor: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {[
            { icon: '🔥', label: 'Streak',   value: '21d' },
            { icon: '⚡', label: 'XP Gained', value: '+315' },
            { icon: '💜', label: 'Habits',   value: '4/4' },
          ].map((s, i) => (
            <div key={i} className={`flex-1 text-center ${i < 2 ? 'border-r border-white/10' : ''}`}>
              <p style={{ fontSize: '11px', marginBottom: 2 }}>{s.icon}</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: 'Quicksand, sans-serif', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setClaimed(!claimed)}
          className="w-full flex items-center justify-center gap-2"
          style={{
            height: 50,
            borderRadius: RADIUS.md,
            background: claimed
              ? `rgba(255,255,255,0.1)`
              : `linear-gradient(135deg, ${DS.purple} 0%, #7C3AED 100%)`,
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            border: claimed ? '1px solid rgba(255,255,255,0.15)' : 'none',
            boxShadow: claimed ? 'none' : `0 6px 20px ${DS.purpleGlow}`,
            cursor: 'pointer',
          }}
        >
          {claimed ? (
            <>
              <Check className="w-4 h-4" />
              Reward Claimed!
            </>
          ) : (
            <>
              <Star className="w-4 h-4" />
              Claim Your Reward
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// ── Color Swatch Row ──────────────────────────────────
const swatches = [
  { color: DS.bg,       label: 'BG Teal' },
  { color: DS.charcoal, label: 'Charcoal' },
  { color: DS.purple,   label: 'Purple' },
  { color: DS.teal,     label: 'Teal' },
  { color: DS.lavender, label: 'Lavender' },
  { color: DS.mint,     label: 'Mint' },
  { color: DS.pink,     label: 'Pink' },
  { color: DS.blue,     label: 'Blue' },
  { color: DS.peach,    label: 'Peach' },
  { color: DS.yellow,   label: 'Yellow' },
];

// ── Type Scale ────────────────────────────────────────
const typeScale = [
  { label: 'Display', size: 28, weight: 700, font: 'Quicksand' },
  { label: 'H1',      size: 22, weight: 700, font: 'Quicksand' },
  { label: 'H2',      size: 18, weight: 600, font: 'Quicksand' },
  { label: 'Body',    size: 14, weight: 400, font: 'Inter' },
  { label: 'Caption', size: 12, weight: 500, font: 'Inter' },
  { label: 'Label',   size: 11, weight: 600, font: 'Inter' },
];

// ── Icon Library ──────────────────────────────────────
const iconSet = [
  { icon: <Flame />,     label: 'Streak' },
  { icon: <Zap />,       label: 'XP' },
  { icon: <TrendingUp />,label: 'Rate' },
  { icon: <Shield />,    label: 'Strength' },
  { icon: <Heart />,     label: 'Why' },
  { icon: <Target />,    label: 'Goal' },
  { icon: <Star />,      label: 'Award' },
  { icon: <Bell />,      label: 'Remind' },
  { icon: <Moon />,      label: 'Sleep' },
  { icon: <Coffee />,    label: 'Morning' },
  { icon: <Dumbbell />,  label: 'Fitness' },
  { icon: <BookMarked />,label: 'Study' },
  { icon: <Droplets />,  label: 'Water' },
  { icon: <Sparkles />,  label: 'Magic' },
  { icon: <Calendar />,  label: 'Schedule' },
  { icon: <Award />,     label: 'Badge' },
];

// ── Main Page ─────────────────────────────────────────
export function DesignSystemPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: DS.bg, padding: '0 0 60px' }}
    >
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden px-5 pt-12 pb-8"
        style={{
          background: `linear-gradient(180deg, ${DS.bgDeep} 0%, ${DS.bg} 100%)`,
          borderBottom: `1px solid rgba(255,255,255,0.04)`,
        }}
      >
        {/* Background blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 250, height: 250,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${DS.purpleSoft} 0%, transparent 70%)`,
            top: -80, right: -60,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 180, height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(26,138,122,0.15) 0%, transparent 70%)`,
            bottom: -40, left: -40,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: DS.purpleSoft,
              border: `1px solid ${DS.purpleGlow}`,
            }}
          >
            <Sparkles className="w-3 h-3" style={{ color: DS.purple }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: DS.purple, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
              DESIGN SYSTEM v1.0
            </span>
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: DS.textPrimary,
              fontFamily: 'Quicksand, sans-serif',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Bloom
            <br />
            <span style={{ color: DS.purple }}>UI Kit</span>
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: DS.textSecondary,
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              maxWidth: 300,
              marginBottom: 18,
            }}
          >
            Premium mobile components for behavior-based habit formation. Soft pastel cards, teal depth, charcoal accents.
          </p>

          {/* Stack chips */}
          <div className="flex flex-wrap gap-2">
            {['React', 'Motion', 'Tailwind', 'Inter + Quicksand'].map(t => (
              <span
                key={t}
                className="px-3 py-1 rounded-full"
                style={{
                  fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  backgroundColor: DS.charcoal,
                  color: DS.textSecondary,
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5 pt-8 space-y-10">

        {/* ── Color Palette ── */}
        <section>
          <SectionLabel number="00" name="Color Palette" />
          <div className="flex flex-wrap gap-2.5">
            {swatches.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-12 h-12 rounded-2xl"
                  style={{
                    backgroundColor: s.color,
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                />
                <span style={{ fontSize: '9px', color: DS.textMuted, fontFamily: 'Inter, sans-serif', textAlign: 'center', maxWidth: 48 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ── */}
        <section>
          <SectionLabel number="T" name="Typography" />
          <div
            className="space-y-3 p-4"
            style={{
              borderRadius: RADIUS.lg,
              backgroundColor: DS.charcoal,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {typeScale.map(t => (
              <div key={t.label} className="flex items-baseline gap-3">
                <span
                  style={{
                    width: 52, fontSize: '10px', fontFamily: 'Inter, sans-serif',
                    color: DS.textMuted, fontWeight: 600, flexShrink: 0,
                  }}
                >
                  {t.label}
                </span>
                <span
                  style={{
                    fontSize: t.size,
                    fontWeight: t.weight,
                    fontFamily: t.font === 'Quicksand' ? 'Quicksand, sans-serif' : 'Inter, sans-serif',
                    color: DS.textPrimary,
                    lineHeight: 1,
                  }}
                >
                  Bloom · Grow daily
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 1. Habit Card ── */}
        <section>
          <SectionLabel number="01" name="Habit Card" />
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {habitCards.map((card, i) => (
              <HabitCard key={card.title} card={card} index={i} />
            ))}
          </div>
          <p style={{ fontSize: '11px', color: DS.textMuted, fontFamily: 'Inter, sans-serif', marginTop: 8 }}>
            Tap ✓ to toggle completion · Week bar shows 7-day history
          </p>
        </section>

        {/* ── 2. Stat Card ── */}
        <section>
          <SectionLabel number="02" name="Stat Card" />
          <div className="flex gap-3">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </section>

        {/* ── 5. Progress Ring ── */}
        <section>
          <SectionLabel number="05" name="Progress Ring" />
          <div
            className="flex items-center justify-around p-5"
            style={{
              borderRadius: RADIUS.lg,
              backgroundColor: DS.charcoal,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <ProgressRing pct={88} size={96}  strokeWidth={8}  color={DS.purple}  bg={DS.purpleSoft}            label="overall"    value="88%" />
            <ProgressRing pct={65} size={80}  strokeWidth={7}  color={DS.teal}    bg="rgba(26,138,122,0.18)"    label="this week"  value="65%" />
            <ProgressRing pct={100} size={64} strokeWidth={6}  color={DS.green}   bg="rgba(34,197,94,0.15)"     label="today"      value="4/4" />
            <ProgressRing pct={42} size={64}  strokeWidth={6}  color={DS.amber}   bg="rgba(245,158,11,0.15)"    label="strength"   value="42" />
          </div>
        </section>

        {/* ── 6. Calendar Strip ── */}
        <section>
          <SectionLabel number="06" name="Calendar Strip" />
          <CalendarStrip />
          <p style={{ fontSize: '11px', color: DS.textMuted, fontFamily: 'Inter, sans-serif', marginTop: 8 }}>
            Tap any day to select · Green dot = all habits done · Red = missed
          </p>
        </section>

        {/* ── 7. Input Fields ── */}
        <section>
          <SectionLabel number="07" name="Input Field" />
          <div className="space-y-4">
            <InputField
              label="Habit Name"
              placeholder="e.g. Morning Meditation"
              icon={<Target className="w-4 h-4" />}
              state="default"
              hint="Give your habit a clear, action-focused name"
            />
            <InputField
              label="Habit Name"
              placeholder="e.g. Morning Meditation"
              icon={<Target className="w-4 h-4" />}
              state="focused"
              value="Morning Meditation"
            />
            <InputField
              label="Habit Name"
              placeholder=""
              icon={<Target className="w-4 h-4" />}
              state="filled"
              value="Morning Meditation"
              hint="Looks good!"
            />
            <InputField
              label="Reminder Time"
              placeholder="Select time"
              icon={<Bell className="w-4 h-4" />}
              state="error"
              hint="Please enter a valid time window"
            />
          </div>
        </section>

        {/* ── 8. CTA Buttons ── */}
        <section>
          <SectionLabel number="08" name="CTA Button" />
          <div className="space-y-3">
            <CTAButton variant="primary"   label="Start Building Habits" icon={<Sparkles className="w-4 h-4" />} />
            <CTAButton variant="teal"      label="Log Today's Habit"     icon={<Check className="w-4 h-4" />} />
            <CTAButton variant="secondary" label="View Analytics" />
            <CTAButton variant="ghost"     label="Maybe Later" />
            <CTAButton variant="danger"    label="Archive Habit" />

            {/* Size variants */}
            <div className="flex gap-2 pt-2">
              <CTAButton variant="primary"   label="Save" width="auto" icon={<Check className="w-4 h-4" />} />
              <CTAButton variant="secondary" label="Cancel" width="auto" />
              <CTAButton variant="ghost"     label="Skip" width="auto" />
            </div>
          </div>
        </section>

        {/* ── 3. Bottom Nav ── */}
        <section>
          <SectionLabel number="03" name="Bottom Navigation" />
          <BottomNav />
          <p style={{ fontSize: '11px', color: DS.textMuted, fontFamily: 'Inter, sans-serif', marginTop: 8 }}>
            Tap items to switch tabs · Center is floating FAB
          </p>
        </section>

        {/* ── 4. Floating Add Button ── */}
        <section>
          <SectionLabel number="04" name="Floating Add Button" />
          <div
            className="flex flex-col items-center py-6"
            style={{
              borderRadius: RADIUS.lg,
              backgroundColor: DS.charcoal,
              border: '1px solid rgba(255,255,255,0.05)',
              minHeight: 200,
              justifyContent: 'flex-end',
            }}
          >
            <FloatingAddButton />
          </div>
        </section>

        {/* ── 9. Empty State ── */}
        <section>
          <SectionLabel number="09" name="Empty State" />
          <EmptyState />
        </section>

        {/* ── 10. Celebration Card ── */}
        <section>
          <SectionLabel number="10" name="Celebration Card" />
          <CelebrationCard />
          <p style={{ fontSize: '11px', color: DS.textMuted, fontFamily: 'Inter, sans-serif', marginTop: 8 }}>
            Tap "Claim Your Reward" to toggle state
          </p>
        </section>

        {/* ── Icon Library ── */}
        <section>
          <SectionLabel number="IC" name="Icon Set" />
          <div
            className="flex flex-wrap gap-1 p-4"
            style={{
              borderRadius: RADIUS.lg,
              backgroundColor: DS.charcoal,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {iconSet.map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3" style={{ width: 60 }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: DS.purpleSoft, color: DS.purple }}
                >
                  {icon}
                </div>
                <span style={{ fontSize: '9px', color: DS.textMuted, fontFamily: 'Inter, sans-serif' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Radius & Shadow Tokens ── */}
        <section>
          <SectionLabel number="SP" name="Spacing & Radius" />
          <div className="flex flex-wrap gap-3">
            {[
              { r: 8,  label: 'sm · 8px' },
              { r: 14, label: 'md · 14px' },
              { r: 18, label: 'lg · 18px' },
              { r: 24, label: 'xl · 24px' },
              { r: 32, label: '2xl · 32px' },
              { r: 999,label: 'full' },
            ].map(({ r, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 flex items-center justify-center"
                  style={{
                    borderRadius: r,
                    backgroundColor: DS.charcoalMid,
                    border: `1.5px solid ${DS.purpleGlow}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DS.purple }} />
                </div>
                <span style={{ fontSize: '9px', color: DS.textMuted, fontFamily: 'Inter, sans-serif', textAlign: 'center', maxWidth: 60 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <div
          className="text-center py-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <span style={{ fontSize: '24px' }}>🌱</span>
          </motion.div>
          <p style={{ fontSize: '13px', color: DS.textSecondary, fontFamily: 'Quicksand, sans-serif', fontWeight: 600, marginTop: 8 }}>
            Bloom Design System
          </p>
          <p style={{ fontSize: '11px', color: DS.textMuted, fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
            Mobile-first · Behavior-based · Premium
          </p>
        </div>

      </div>
    </div>
  );
}
