import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, BarChart2, Plus, BookOpen, User,
  Bell, BellOff, ChevronRight, ChevronLeft,
  Check, Flame, Zap, TrendingUp, Shield,
  Calendar, Clock, MapPin, Heart, Star,
  Sparkles, Award, Target, Moon, Sun,
  Coffee, Dumbbell, Droplets, X, Quote,
  Bookmark, ArrowRight, Smile, Brain,
  AlarmClock, Sunrise, Sunset, MoreHorizontal,
} from 'lucide-react';
import svgPaths from "../../imports/Frame2150-1/svg-spd1vtracf";
import imgProfile1 from "figma:asset/e26e9fe797c0ed6d681176a232f8c863a5c32ba4.png";
import imgProfile2 from "figma:asset/9ac9c858bbb4631dccd112b2c0479cf4e738c6ac.png";
import imgProfile3 from "figma:asset/28c5d348b2b940f2c4855e0f432355bcc547b5e2.png";

// ─── Design Tokens ─────────────────────────────────────────────
const C = {
  bg:           '#0B1E2D',
  bgDeep:       '#071520',
  bgCard:       '#122334',
  charcoal:     '#1C2B3A',
  charcoalMid:  '#243342',
  charcoalLight:'#2E4055',

  purple:      '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleSoft:  'rgba(139,92,246,0.16)',
  purpleGlow:  'rgba(139,92,246,0.38)',
  purpleDark:  '#6D28D9',

  teal:        '#1A8A7A',
  tealSoft:    'rgba(26,138,122,0.18)',
  tealGlow:    'rgba(26,138,122,0.35)',

  green:  '#22C55E',
  amber:  '#F59E0B',
  red:    '#EF4444',
  blue:   '#3B82F6',

  // Pastel fills
  lavender: '#EAE6FF', lavenderAcc: '#7C70E8',
  mint:     '#D4F5ED', mintAcc:     '#18A68A',
  pink:     '#FFE2EF', pinkAcc:     '#E0608A',
  sky:      '#D6EEFF', skyAcc:      '#3B8FD4',
  peach:    '#FFE8D4', peachAcc:    '#E07820',
  yellow:   '#FFF3C4', yellowAcc:   '#D4A010',

  // Text
  t1: '#EBF2FA',
  t2: 'rgba(235,242,250,0.62)',
  t3: 'rgba(235,242,250,0.36)',
  tl: '#1C2B3A',
  tlm:'rgba(28,43,58,0.62)',
};

const Fn = { q: 'Quicksand, sans-serif', i: 'Inter, sans-serif' };
const R  = { xs: 10, sm: 14, md: 18, lg: 22, xl: 28, pill: 999 };

// ─── Figma Habit Card Data ─────────────────────────────────────
const figmaHabits = [
  {
    id: 101,
    name: 'Өдрийн ажлаа төлөвлөх',
    img: imgProfile1 as string, imgR: 24, emoji: null as string|null,
    cardBg: 'rgba(179,179,253,0.92)',
    outerBg: 'rgba(179,179,253,0.25)',
    btnBg: '#a7a7fd',
    progress: '3/2 удаа',
    tag1: 45, tag2: 87,
    initDone: false,
  },
  {
    id: 102,
    name: '10 минут ном унших',
    img: null as string|null, imgR: 24, emoji: '🙆‍♀️',
    cardBg: 'rgba(255,187,187,0.92)',
    outerBg: 'rgba(255,200,200,0.25)',
    btnBg: '#ffb3b3',
    progress: '10/8 минут',
    tag1: 65, tag2: 100,
    initDone: false,
  },
  {
    id: 103,
    name: 'IELTS нэг section, part хийх',
    img: imgProfile2 as string, imgR: 12, emoji: null as string|null,
    cardBg: 'rgba(179,255,199,0.92)',
    outerBg: 'rgba(179,255,199,0.25)',
    btnBg: '#94fdb0',
    progress: '0/2 удаа',
    tag1: 30, tag2: 55,
    initDone: false,
  },
  {
    id: 104,
    name: 'IELTS нэг section, part хийх',
    img: imgProfile3 as string, imgR: 24, emoji: null as string|null,
    cardBg: 'rgba(119,216,255,0.92)',
    outerBg: 'rgba(119,216,255,0.25)',
    btnBg: '#dee061',
    progress: '1/1 удаа',
    tag1: 100, tag2: 100,
    initDone: true,
  },
];

// ─── Figma Habit Card Component ────────────────────────────────
function FigmaHabitCard({
  h, isDone, onToggle, index,
}: {
  h: typeof figmaHabits[0];
  isDone: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
     <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="relative overflow-hidden"
      style={{ borderRadius: 24, backgroundColor: h.outerBg }}
    >
      {/* Pastel bg card fill */}
      <div className="absolute inset-0" style={{ borderRadius: 24, backgroundColor: h.cardBg }} />

      {/* Completed: horizontal strikethrough line */}
      {isDone && (
        <div className="absolute pointer-events-none"
          style={{ left: 82, right: 66, top: 26, height: 1,
            backgroundColor: 'rgba(0,0,0,0.22)', zIndex: 2 }}
        />
      )}

      {/* Main content row */}
      <div className="relative flex items-center justify-between"
        style={{ padding: '16px 18px', zIndex: 3 }}>

        {/* Profile image or emoji */}
        {h.img ? (
          <img src={h.img} alt=""
            className="shrink-0 object-cover"
            style={{ width: 44, height: 44, borderRadius: h.imgR }}
          />
        ) : (
          <div className="shrink-0 flex items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.10)' }}>
            <span style={{ fontSize: 22 }}>{h.emoji}</span>
          </div>
        )}

        {/* Name + HabitTag pills */}
        <div className="flex flex-col flex-1 min-w-0" style={{ gap: 6, marginLeft: 10, marginRight: 8 }}>
          <p style={{
            fontSize: 12, fontWeight: 500,
            fontFamily: 'Montserrat, Quicksand, sans-serif',
            color: isDone ? 'rgba(32,35,37,0.45)' : '#202325',
            textDecoration: isDone ? 'line-through' : 'none',
            lineHeight: '20px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {h.name}
          </p>

          {/* Two HabitTag pills */}
          <div className="flex" style={{ gap: 8 }}>
            {/* Tag 1 — Dumbbell icon */}
            <div className="flex items-center"
              style={{ backgroundColor: '#fff', height: 32, borderRadius: 20,
                paddingLeft: 8, paddingRight: 10, gap: 6, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>
              <svg width="20" height="20" viewBox="0 0 26 25.0006" fill="none" style={{ flexShrink: 0 }}>
                <path d={svgPaths.p2eaaee80} fill="#303437"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600,
                fontFamily: 'Montserrat, Inter, sans-serif',
                color: '#303437', whiteSpace: 'nowrap' }}>
                {h.tag1}
              </span>
            </div>

            {/* Tag 2 — Flame/water icon */}
            <div className="flex items-center"
              style={{ backgroundColor: '#fff', height: 32, borderRadius: 20,
                paddingLeft: 8, paddingRight: 10, gap: 6, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>
              <svg width="18" height="20" viewBox="0 0 23 24" fill="none" style={{ flexShrink: 0 }}>
                <path d={svgPaths.p29fc8c00} fill="#303437" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600,
                fontFamily: 'Montserrat, Inter, sans-serif',
                color: '#303437', whiteSpace: 'nowrap' }}>
                {h.tag2}
              </span>
            </div>
          </div>
        </div>

        {/* Right: progress label + action button */}
        <div className="relative shrink-0 flex flex-col items-center" style={{ gap: 3 }}>
          <span style={{ fontSize: 10, fontFamily: 'Montserrat, Inter, sans-serif',
            fontWeight: 400, color: 'rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap', lineHeight: '14px' }}>
            {h.progress}
          </span>

          {isDone ? (
            /* Completed — gold star-burst with checkmark */
            <motion.button whileTap={{ scale: 0.88 }} onClick={onToggle}
              className="relative flex items-center justify-center"
              style={{ width: 42, height: 42, flexShrink: 0 }}>
              <svg width="42" height="41" viewBox="0 0 43 42" fill="none"
                className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                <path d={svgPaths.p3c807200} fill="#dee061"/>
              </svg>
              <svg width="15" height="13" viewBox="0 0 17 15" fill="none" className="relative" style={{ zIndex: 1 }}>
                <path d={svgPaths.pd256a80} fill="#000"/>
              </svg>
            </motion.button>
          ) : (
            /* Active — colored plus button */
            <motion.button whileTap={{ scale: 0.88 }} onClick={onToggle}
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 48,
                backgroundColor: h.btnBg, flexShrink: 0,
                boxShadow: `0 2px 10px rgba(0,0,0,0.18)` }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p3ed50f00} fill="#474747"/>
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Habit Data ────────────────────────────────────────────────
const habits = [
  { id:1, emoji:'🧘', name:'Morning Meditation', tag:'Mind',    streak:14, pct:92, done:true,  bg:C.lavender, acc:C.lavenderAcc, tagBg:'#D4CFFF' },
  { id:2, emoji:'📖', name:'Read 20 Pages',      tag:'Study',   streak:21, pct:85, done:false, bg:C.pink,     acc:C.pinkAcc,     tagBg:'#FFD0E4' },
  { id:3, emoji:'💧', name:'Drink 8 Glasses',    tag:'Health',  streak:7,  pct:70, done:false, bg:C.mint,     acc:C.mintAcc,     tagBg:'#B2EDE0' },
  { id:4, emoji:'🏃', name:'Evening Run',         tag:'Fitness', streak:5,  pct:55, done:false, bg:C.sky,      acc:C.skyAcc,      tagBg:'#C0DEFF' },
  { id:5, emoji:'📝', name:'Journal Entry',       tag:'Self',    streak:3,  pct:40, done:false, bg:C.peach,    acc:C.peachAcc,    tagBg:'#FFD4B0' },
];

const weekData = [82, 95, 60, 88, 72, 100, 55]; // Mon–Sun completion %
const weekDays = ['M','T','W','T','F','S','S'];
const todayIdx = 2; // Wednesday

// ─── Shared: Status Bar ──────────────────────────────────────
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 shrink-0">
      <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t1 }}>9:41</span>
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ width:120, height:34, borderRadius:R.pill, backgroundColor:'#000', top:6, zIndex:10 }}
      />
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5 items-end">
          {[3,5,7].map(h => (
            <div key={h} className="w-1 rounded-sm" style={{ height:h, backgroundColor:C.t1 }} />
          ))}
        </div>
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
          <path d="M7.5 2.5C9.2 2.5 10.7 3.2 11.8 4.3L13.2 2.9C11.7 1.4 9.7 0.5 7.5 0.5C5.3 0.5 3.3 1.4 1.8 2.9L3.2 4.3C4.3 3.2 5.8 2.5 7.5 2.5Z" fill={C.t1} fillOpacity="0.5"/>
          <path d="M7.5 5.5C8.6 5.5 9.6 5.9 10.3 6.7L11.7 5.3C10.6 4.2 9.1 3.5 7.5 3.5C5.9 3.5 4.4 4.2 3.3 5.3L4.7 6.7C5.4 5.9 6.4 5.5 7.5 5.5Z" fill={C.t1} fillOpacity="0.75"/>
          <circle cx="7.5" cy="9.5" r="1.5" fill={C.t1}/>
        </svg>
        <div className="flex items-center gap-0.5">
          <div style={{ width:22, height:11, borderRadius:3, border:`1.5px solid ${C.t1}`, padding:'1px' }}>
            <div style={{ width:'80%', height:'100%', borderRadius:2, backgroundColor:C.t1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared: Bottom Nav ──────────────────────────────────────
function BottomNav({ active = 0, onTab }: { active?: number; onTab?: (i:number)=>void }) {
  const tabs = [
    { icon: Home,     label:'Home' },
    { icon: BarChart2,label:'Progress' },
    { icon: Plus,     label:'',    fab:true },
    { icon: Bell,     label:'Remind' },
    { icon: User,     label:'Me' },
  ];

  return (
    <div
      className="shrink-0 flex items-center justify-around px-2 pb-5 pt-2"
      style={{ backgroundColor:C.charcoal, borderTop:`1px solid rgba(255,255,255,0.05)` }}
    >
      {tabs.map((tab,i) => {
        const Icon = tab.icon;
        const isActive = active === i && !tab.fab;
        if (tab.fab) return (
          <motion.button
            key={i} whileTap={{ scale:0.88 }}
            className="flex items-center justify-center -mt-6"
            style={{
              width:52, height:52, borderRadius:R.pill,
              background:`linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`,
              boxShadow:`0 4px 20px ${C.purpleGlow}`,
              border:`2px solid rgba(255,255,255,0.15)`,
            }}
          ><Plus className="w-5 h-5 text-white"/></motion.button>
        );
        return (
          <button key={i} onClick={() => onTab?.(i)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
          >
            {isActive && (
              <motion.div layoutId="screen-nav-pill"
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: C.purpleSoft }}
              />
            )}
            <Icon className="w-5 h-5 relative"
              style={{ color: isActive ? C.purple : C.t3 }}
            />
            <span className="relative"
              style={{ fontSize:'9px', fontWeight:600, fontFamily:Fn.i,
                       color: isActive ? C.purple : C.t3 }}
            >{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Shared: Section Header ──────────────────────────────────
function SecHead({ title, action }: { title:string; action?:string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span style={{ fontSize:'16px', fontWeight:700, fontFamily:Fn.q, color:C.t1 }}>{title}</span>
      {action && (
        <button className="flex items-center gap-1" style={{ color:C.purple }}>
          <span style={{ fontSize:'12px', fontWeight:600, fontFamily:Fn.i }}>{action}</span>
          <ChevronRight className="w-3.5 h-3.5"/>
        </button>
      )}
    </div>
  );
}

// ─── Shared: Toggle ──────────────────────────────────────────
function Toggle({ on, onChange }: { on:boolean; onChange:()=>void }) {
  return (
    <button onClick={onChange}
      className="relative shrink-0 transition-all"
      style={{
        width:44, height:26, borderRadius:R.pill,
        backgroundColor: on ? C.purple : C.charcoalLight,
      }}
    >
      <motion.div animate={{ x: on ? 20 : 2 }}
        transition={{ type:'spring', stiffness:400, damping:25 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
      />
    </button>
  );
}

// ─── Shared: Mini Progress Ring ──────────────────────────────
function MiniRing({ pct, size=48, stroke=4, color=C.purple }:
  { pct:number; size?:number; stroke?:number; color?:string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - circ*(pct/100) }}
        transition={{ duration:1.2, ease:'easeOut' }}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREEN 1 — HOME DASHBOARD
// ═══════════════════════════════════════════════════════════
function DashboardScreen() {
  const [doneIds, setDoneIds] = useState<Set<number>>(
    new Set(figmaHabits.filter(h => h.initDone).map(h => h.id))
  );
  const doneCount = doneIds.size;

  const toggleDone = (id: number) => {
    setDoneIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor:C.bg }}>
      <StatusBar/>

      {/* ── Greeting Header ── */}
      <div className="px-5 pt-2 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize:'13px', color:C.t3, fontFamily:Fn.i }}>Tuesday, April 14</p>
            <h1 style={{ fontSize:'24px', fontWeight:800, fontFamily:Fn.q, color:C.t1, lineHeight:1.15 }}>
              Good morning ☀️
            </h1>
          </div>
          <div className="relative">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background:`linear-gradient(135deg, ${C.lavender} 0%, ${C.pink} 100%)`,
                boxShadow:`0 4px 16px rgba(139,92,246,0.25)`,
              }}
            >
              <span style={{ fontSize:'22px' }}>🌸</span>
            </div>
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor:C.red, border:`2px solid ${C.bg}` }}
            >
              <span style={{ fontSize:'8px', fontWeight:700, color:'#fff', fontFamily:Fn.i }}>3</span>
            </div>
          </div>
        </div>

        {/* ── Today's Overview card ── */}
        <motion.div
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden p-4"
          style={{
            borderRadius:R.xl,
            background:`linear-gradient(135deg, ${C.charcoal} 0%, ${C.charcoalMid} 100%)`,
            border:`1px solid rgba(255,255,255,0.06)`,
            boxShadow:`0 8px 32px rgba(0,0,0,0.22)`,
          }}
        >
          {/* Glow blob */}
          <div className="absolute pointer-events-none"
            style={{ width:180, height:180, borderRadius:'50%',
              background:`radial-gradient(circle, ${C.purpleSoft} 0%, transparent 65%)`,
              top:-60, right:-40 }}
          />
          <div className="relative flex items-center gap-4">
            {/* Ring */}
            <div className="relative shrink-0" style={{ width:72, height:72 }}>
              <MiniRing pct={Math.round((doneCount/figmaHabits.length)*100)} size={72} stroke={6} color={C.purple}/>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize:'16px', fontWeight:800, fontFamily:Fn.q, color:C.t1, lineHeight:1 }}>
                  {doneCount}/{figmaHabits.length}
                </span>
                <span style={{ fontSize:'8px', color:C.t2, fontFamily:Fn.i }}>done</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p style={{ fontSize:'15px', fontWeight:700, fontFamily:Fn.q, color:C.t1, marginBottom:4 }}>
                {doneCount === figmaHabits.length ? "Бүгдийг дууслаа! 🎉" : `${figmaHabits.length - doneCount} дадал үлдлээ`}
              </p>
              <p style={{ fontSize:'12px', color:C.t2, fontFamily:Fn.i, marginBottom:10 }}>
                Keep the streak alive 🔥
              </p>
              {/* Mini stats */}
              <div className="flex gap-3">
                {[
                  { icon:'🔥', val:'21d', lbl:'streak' },
                  { icon:'⚡', val:'1.2k', lbl:'XP' },
                  { icon:'✓',  val:'88%', lbl:'rate' },
                ].map(s => (
                  <div key={s.lbl} className="flex items-center gap-1">
                    <span style={{ fontSize:'11px' }}>{s.icon}</span>
                    <span style={{ fontSize:'12px', fontWeight:700, fontFamily:Fn.q, color:C.t1 }}>{s.val}</span>
                    <span style={{ fontSize:'10px', color:C.t3, fontFamily:Fn.i }}>{s.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Calendar Strip ── */}
      <div className="px-5 mb-4 shrink-0">
        <div className="flex justify-between">
          {weekDays.map((d, i) => {
            const isToday = i === todayIdx;
            const isPast  = i < todayIdx;
            const dt = 10 + i;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span style={{ fontSize:'10px', fontWeight:600, fontFamily:Fn.i,
                  color: isToday ? C.purple : C.t3 }}>{d}</span>
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: isToday ? C.purple : 'transparent',
                    border: !isToday ? `1.5px solid rgba(255,255,255,0.06)` : 'none',
                    boxShadow: isToday ? `0 4px 14px ${C.purpleGlow}` : 'none',
                  }}
                >
                  <span style={{ fontSize:'13px', fontWeight: isToday ? 700 : 400,
                    fontFamily:Fn.q, color: isToday ? '#fff' : C.t1 }}>{dt}</span>
                </div>
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: isPast ? C.green : isToday ? C.purple+'80' : 'transparent' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Habit List — Figma-style pastel cards ── */}
      <div className="px-5 flex-1">
        <SecHead title="Өнөөдрийн дадлууд" action="Бүгдийг харах"/>
        <div className="space-y-3 pb-4">
          {figmaHabits.map((h, idx) => (
            <FigmaHabitCard
              key={h.id}
              h={h}
              isDone={doneIds.has(h.id)}
              onToggle={() => toggleDone(h.id)}
              index={idx}
            />
          ))}
        </div>
      </div>

      <BottomNav active={0}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREEN 2 — PROGRESS
// ═══════════════════════════════════════════════════════════
function ProgressScreen() {
  const [period, setPeriod] = useState<'Week'|'Month'|'Year'>('Week');

  const barMax = Math.max(...weekData);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor:C.bg }}>
      <StatusBar/>

      {/* Header */}
      <div className="px-5 pt-3 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 style={{ fontSize:'24px', fontWeight:800, fontFamily:Fn.q, color:C.t1 }}>Progress</h1>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor:C.charcoal, border:`1px solid rgba(255,255,255,0.06)` }}>
            <MoreHorizontal className="w-4 h-4" style={{ color:C.t2 }}/>
          </button>
        </div>

        {/* Period toggle */}
        <div className="flex p-1 rounded-2xl" style={{ backgroundColor:C.charcoal }}>
          {(['Week','Month','Year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-xl transition-all"
              style={{
                backgroundColor: period === p ? C.purple : 'transparent',
                boxShadow: period === p ? `0 2px 10px ${C.purpleGlow}` : 'none',
              }}
            >
              <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i,
                color: period === p ? '#fff' : C.t2 }}>{p}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4 flex-1">
        {/* ── Streak Hero ── */}
        <motion.div
          initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="relative overflow-hidden p-5"
          style={{
            borderRadius:R.xl,
            background:`linear-gradient(135deg, #2D1B69 0%, #1A0A3D 55%, #0D1F2D 100%)`,
            border:`1px solid rgba(139,92,246,0.2)`,
            boxShadow:`0 12px 40px rgba(0,0,0,0.3)`,
          }}
        >
          <div className="absolute pointer-events-none"
            style={{ inset:0, background:`radial-gradient(ellipse at top right, ${C.purpleSoft} 0%, transparent 60%)` }}
          />
          <div className="relative flex items-center gap-5">
            {/* Big Ring */}
            <div className="relative shrink-0" style={{ width:90, height:90 }}>
              <MiniRing pct={88} size={90} stroke={7} color={C.purple}/>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize:'22px', fontWeight:800, fontFamily:Fn.q, color:'#fff', lineHeight:1 }}>88%</span>
                <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.55)', fontFamily:Fn.i, marginTop:2 }}>this {period.toLowerCase()}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize:'32px' }}>🔥</span>
                <div>
                  <span style={{ fontSize:'36px', fontWeight:800, fontFamily:Fn.q, color:'#fff', lineHeight:1 }}>21</span>
                  <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', fontFamily:Fn.i, marginLeft:4 }}>days</span>
                </div>
              </div>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', fontFamily:Fn.i, lineHeight:1.4 }}>
                You're in the top 8% of users this month 🌟
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Habits Active',  value:'5',      sub:'tracking',  emoji:'🎯', bg:C.lavender, acc:C.lavenderAcc },
            { label:'Total XP',       value:'1,240',  sub:'points',    emoji:'⚡', bg:C.yellow,   acc:C.yellowAcc   },
            { label:'Best Streak',    value:'21d',    sub:'personal best',emoji:'🏆',bg:C.mint,   acc:C.mintAcc     },
            { label:'Strength',       value:'74',     sub:'/ 100',     emoji:'💪', bg:C.pink,     acc:C.pinkAcc     },
          ].map((s,i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.05 }}
              className="relative overflow-hidden p-3.5"
              style={{ borderRadius:R.lg, backgroundColor:s.bg,
                boxShadow:`0 4px 16px ${s.acc}25, 0 1px 4px rgba(0,0,0,0.06)` }}
            >
              <div className="absolute bottom-0 right-0 pointer-events-none"
                style={{ width:60, height:60, borderRadius:'50%',
                  background:`radial-gradient(circle, ${s.acc}30 0%, transparent 70%)`,
                  transform:'translate(10px,10px)' }}
              />
              <span style={{ fontSize:'20px', display:'block', marginBottom:6 }}>{s.emoji}</span>
              <p style={{ fontSize:'20px', fontWeight:800, fontFamily:Fn.q, color:C.tl, lineHeight:1 }}>{s.value}</p>
              <p style={{ fontSize:'10px', color:s.acc, fontWeight:700, fontFamily:Fn.i, marginTop:2 }}>{s.sub}</p>
              <p style={{ fontSize:'11px', color:C.tlm, fontFamily:Fn.i, marginTop:1 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Bar Chart ── */}
        <div style={{ borderRadius:R.xl, backgroundColor:C.charcoal,
          border:`1px solid rgba(255,255,255,0.05)`, padding:'16px 14px' }}>
          <SecHead title="Daily Completion"/>
          <div className="flex items-end gap-2" style={{ height:80 }}>
            {weekData.map((v, i) => {
              const h = Math.round((v / barMax) * 72);
              const isToday = i === todayIdx;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height:0 }} animate={{ height:h }}
                    transition={{ duration:0.8, delay: i*0.07, ease:'easeOut' }}
                    style={{
                      width:'100%', borderRadius:`${R.xs}px ${R.xs}px 0 0`,
                      background: isToday
                        ? `linear-gradient(180deg, ${C.purple} 0%, ${C.purpleDark} 100%)`
                        : v >= 80 ? `rgba(34,197,94,0.5)` : `rgba(255,255,255,0.1)`,
                      boxShadow: isToday ? `0 -2px 10px ${C.purpleGlow}` : 'none',
                    }}
                  />
                  <span style={{ fontSize:'9px', fontWeight:600, fontFamily:Fn.i,
                    color: isToday ? C.purple : C.t3 }}>{weekDays[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-3 mt-3">
            {[{color:C.purple,label:'Today'},{color:'rgba(34,197,94,0.5)',label:'≥80%'},{color:'rgba(255,255,255,0.1)',label:'Other'}].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor:l.color }}/>
                <span style={{ fontSize:'10px', color:C.t3, fontFamily:Fn.i }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Habit Breakdown ── */}
        <div>
          <SecHead title="Habit Breakdown"/>
          <div className="space-y-2.5 pb-4">
            {habits.map((h, i) => (
              <motion.div key={h.id}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i*0.06 }}
                className="flex items-center gap-3 p-3"
                style={{ borderRadius:R.md, backgroundColor:C.charcoal,
                  border:`1px solid rgba(255,255,255,0.05)` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor:`${h.acc}18` }}>
                  <span style={{ fontSize:'18px' }}>{h.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.q, color:C.t1 }}>{h.name}</span>
                    <span style={{ fontSize:'12px', fontWeight:700, fontFamily:Fn.i, color:h.acc }}>{h.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:`rgba(255,255,255,0.07)` }}>
                    <motion.div
                      initial={{ width:0 }} animate={{ width:`${h.pct}%` }}
                      transition={{ duration:0.9, delay: i*0.07, ease:'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor:h.acc }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Flame className="w-3 h-3" style={{ color:h.acc }}/>
                  <span style={{ fontSize:'11px', fontWeight:600, fontFamily:Fn.i, color:h.acc }}>{h.streak}d</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active={1}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREEN 3 — CREATE HABIT
// ═══════════════════════════════════════════════════════════
const EMOJIS   = ['🧘','📖','💧','🏃','📝','☕','🎵','💊','🥗','🌙','🎯','💪'];
const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const CATS = [
  { emoji:'🧠', label:'Mind',    bg:C.lavender, acc:C.lavenderAcc },
  { emoji:'📖', label:'Study',   bg:C.pink,     acc:C.pinkAcc     },
  { emoji:'🏃', label:'Fitness', bg:C.sky,      acc:C.skyAcc      },
  { emoji:'💧', label:'Health',  bg:C.mint,     acc:C.mintAcc     },
  { emoji:'✨', label:'Self',    bg:C.peach,    acc:C.peachAcc    },
  { emoji:'📝', label:'Work',    bg:C.yellow,   acc:C.yellowAcc   },
];

function CreateHabitScreen() {
  const [step, setStep]         = useState(0);
  const [name, setName]         = useState('');
  const [icon, setIcon]         = useState('🧘');
  const [cat, setCat]           = useState(0);
  const [type, setType]         = useState<'binary'|'measure'>('binary');
  const [days, setDays]         = useState<string[]>([...DAYS_SHORT]);
  const [why, setWhy]           = useState('');
  const [allDays, setAllDays]   = useState(true);

  const steps = ['Identity','Schedule','Why'];
  const selCat = CATS[cat];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor:C.bg }}>
      <StatusBar/>

      {/* Header */}
      <div className="px-5 pt-2 pb-0 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor:C.charcoal, border:`1px solid rgba(255,255,255,0.06)` }}>
            <ChevronLeft className="w-4 h-4" style={{ color:C.t2 }}/>
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize:'20px', fontWeight:800, fontFamily:Fn.q, color:C.t1 }}>New Habit</h1>
          </div>
          <button className="px-3 py-1.5 rounded-xl"
            style={{ backgroundColor:C.purpleSoft, border:`1px solid ${C.purpleGlow}` }}>
            <span style={{ fontSize:'12px', fontWeight:600, fontFamily:Fn.i, color:C.purple }}>Save draft</span>
          </button>
        </div>

        {/* Step progress */}
        <div className="flex gap-1.5 mb-1">
          {steps.map((_,i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all"
              style={{ backgroundColor: i <= step ? C.purple : 'rgba(255,255,255,0.1)',
                opacity: i === step ? 1 : i < step ? 0.6 : 0.3 }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mb-5">
          <span style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i }}>{steps[step]}</span>
          <span style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i }}>Step {step+1} of {steps.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}
            className="space-y-5 pb-4"
          >
            {step === 0 && (
              <>
                {/* Icon picker */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:10 }}>
                    Choose an icon
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map(e => (
                      <motion.button key={e} whileTap={{ scale:0.88 }}
                        onClick={() => setIcon(e)}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{
                          backgroundColor: icon === e ? C.purpleSoft : C.charcoal,
                          border: icon === e ? `1.5px solid ${C.purple}` : `1.5px solid rgba(255,255,255,0.07)`,
                          boxShadow: icon === e ? `0 0 0 3px ${C.purpleSoft}` : 'none',
                        }}
                      >
                        <span style={{ fontSize:'22px' }}>{e}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Name input */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:8 }}>
                    Habit name <span style={{ color:C.red }}>*</span>
                  </span>
                  <div className="flex items-center gap-3 px-4"
                    style={{
                      height:56, borderRadius:R.lg,
                      backgroundColor: C.charcoal,
                      border:`1.5px solid ${name ? C.purple : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: name ? `0 0 0 3px ${C.purpleSoft}` : 'none',
                    }}
                  >
                    <span style={{ fontSize:'20px' }}>{icon}</span>
                    <span style={{ flex:1, fontSize:'15px', fontFamily:Fn.i,
                      color: name ? C.t1 : C.t3 }}>
                      {name || 'e.g. Morning Meditation'}
                    </span>
                    {name && <Check className="w-4 h-4" style={{ color:C.green }}/>}
                  </div>
                  {/* Simulated typed value */}
                  <p style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i, marginTop:6 }}>
                    Make it specific and action-focused
                  </p>
                </div>

                {/* Category */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:10 }}>
                    Goal category
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {CATS.map((c,i) => (
                      <motion.button key={c.label} whileTap={{ scale:0.92 }}
                        onClick={() => setCat(i)}
                        className="py-3 px-2 rounded-xl flex flex-col items-center gap-1.5"
                        style={{
                          backgroundColor: cat === i ? c.bg : C.charcoal,
                          border: cat === i ? `none` : `1.5px solid rgba(255,255,255,0.06)`,
                          boxShadow: cat === i ? `0 4px 16px ${c.acc}30` : 'none',
                        }}
                      >
                        <span style={{ fontSize:'20px' }}>{c.emoji}</span>
                        <span style={{ fontSize:'11px', fontWeight:700, fontFamily:Fn.i,
                          color: cat === i ? c.acc : C.t3 }}>{c.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:10 }}>
                    How to track?
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id:'binary',  icon:<Check className="w-5 h-5"/>, title:'Yes / No', sub:'Did I do it?' },
                      { id:'measure', icon:<Target className="w-5 h-5"/>, title:'Measurable', sub:'Track a number' },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setType(opt.id as any)}
                        className="p-4 rounded-xl text-left"
                        style={{
                          backgroundColor: type === opt.id ? C.purpleSoft : C.charcoal,
                          border: type === opt.id ? `1.5px solid ${C.purple}` : `1.5px solid rgba(255,255,255,0.07)`,
                        }}
                      >
                        <div style={{ color: type === opt.id ? C.purple : C.t3, marginBottom:8 }}>{opt.icon}</div>
                        <p style={{ fontSize:'14px', fontWeight:700, fontFamily:Fn.q,
                          color: type === opt.id ? C.t1 : C.t1 }}>{opt.title}</p>
                        <p style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i }}>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                {/* Frequency */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:10 }}>
                    Frequency
                  </span>
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[{id:true,label:'Every Day',sub:'All 7 days'},{id:false,label:'Specific Days',sub:'Choose below'}].map(f => (
                      <button key={String(f.id)} onClick={() => setAllDays(f.id)}
                        className="py-3.5 rounded-xl text-center"
                        style={{
                          backgroundColor: allDays === f.id ? C.purpleSoft : C.charcoal,
                          border: allDays === f.id ? `1.5px solid ${C.purple}` : `1.5px solid rgba(255,255,255,0.07)`,
                        }}
                      >
                        <p style={{ fontSize:'14px', fontWeight:700, fontFamily:Fn.q,
                          color: allDays === f.id ? C.t1 : C.t1 }}>{f.label}</p>
                        <p style={{ fontSize:'10px', color:C.t3, fontFamily:Fn.i, marginTop:2 }}>{f.sub}</p>
                      </button>
                    ))}
                  </div>
                  {/* Day pills */}
                  <div className="flex justify-between gap-1">
                    {DAYS_SHORT.map(d => {
                      const sel = days.includes(d);
                      return (
                        <motion.button key={d} whileTap={{ scale:0.88 }}
                          onClick={() => setDays(prev => sel ? prev.filter(x=>x!==d) : [...prev,d])}
                          className="flex-1 py-2.5 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: sel ? C.purple : C.charcoal,
                            boxShadow: sel ? `0 2px 10px ${C.purpleGlow}` : 'none',
                          }}
                        >
                          <span style={{ fontSize:'11px', fontWeight:700, fontFamily:Fn.i,
                            color: sel ? '#fff' : C.t3 }}>{d[0]}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Time window */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:10 }}>
                    Best time window
                  </span>
                  <div className="space-y-2">
                    {[
                      { emoji:'🌅', label:'Morning',   time:'6:00 – 10:00', color:C.peachAcc },
                      { emoji:'☀️', label:'Afternoon', time:'12:00 – 16:00', color:C.yellowAcc },
                      { emoji:'🌙', label:'Evening',   time:'18:00 – 22:00', color:C.lavenderAcc },
                    ].map((tw, i) => (
                      <div key={tw.label}
                        className="flex items-center justify-between p-3.5"
                        style={{
                          borderRadius:R.md,
                          backgroundColor: i === 0 ? C.charcoalMid : C.charcoal,
                          border: i === 0 ? `1.5px solid ${tw.color}50` : `1px solid rgba(255,255,255,0.05)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor:`${tw.color}18` }}>
                            <span style={{ fontSize:'18px' }}>{tw.emoji}</span>
                          </div>
                          <div>
                            <p style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t1 }}>{tw.label}</p>
                            <p style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i }}>{tw.time}</p>
                          </div>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: i === 0 ? tw.color : 'transparent',
                            border: i === 0 ? 'none' : `1.5px solid rgba(255,255,255,0.15)`,
                          }}
                        >
                          {i === 0 && <Check className="w-3 h-3 text-white"/>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Why banner */}
                <div className="flex items-start gap-3 p-4"
                  style={{ borderRadius:R.lg, background:`linear-gradient(135deg, ${C.purpleSoft} 0%, ${C.tealSoft} 100%)`,
                    border:`1px solid rgba(139,92,246,0.2)` }}
                >
                  <Heart className="w-5 h-5 shrink-0 mt-0.5" style={{ color:C.purple }}/>
                  <div>
                    <p style={{ fontSize:'14px', fontWeight:600, fontFamily:Fn.q, color:C.t1, marginBottom:4 }}>
                      Connect your "why"
                    </p>
                    <p style={{ fontSize:'12px', color:C.t2, fontFamily:Fn.i, lineHeight:1.5 }}>
                      Habits linked to a personal reason are 2× more likely to stick.
                    </p>
                  </div>
                </div>

                {/* Reason textarea */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:8 }}>
                    Why does this habit matter to you?
                  </span>
                  <div className="p-4"
                    style={{
                      borderRadius:R.lg, minHeight:100,
                      backgroundColor:C.charcoal,
                      border:`1.5px solid rgba(139,92,246,0.3)`,
                      boxShadow:`0 0 0 3px ${C.purpleSoft}`,
                    }}
                  >
                    <span style={{ fontSize:'14px', fontFamily:Fn.i, color:C.t3, lineHeight:1.6 }}>
                      e.g. I want to feel calmer and more present every day…
                    </span>
                  </div>
                </div>

                {/* Identity statement */}
                <div>
                  <span style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.i, color:C.t2, display:'block', marginBottom:8 }}>
                    Identity statement <span style={{ color:C.t3, fontWeight:400 }}>(optional)</span>
                  </span>
                  <div className="flex items-center gap-3 px-4"
                    style={{ height:52, borderRadius:R.md, backgroundColor:C.charcoal,
                      border:`1.5px solid rgba(255,255,255,0.08)` }}
                  >
                    <span style={{ fontSize:'14px', fontFamily:Fn.i, color:C.t3 }}>
                      "I am someone who…"
                    </span>
                  </div>
                  <p style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i, marginTop:6 }}>
                    Identity-based habits are the most durable
                  </p>
                </div>

                {/* Selected summary */}
                <div className="p-4"
                  style={{ borderRadius:R.lg, backgroundColor:C.charcoal,
                    border:`1px solid rgba(255,255,255,0.06)` }}
                >
                  <p style={{ fontSize:'12px', fontWeight:600, color:C.t3, fontFamily:Fn.i, marginBottom:10 }}>SUMMARY</p>
                  {[
                    { l:'Habit', v:`${icon} ${name || 'My New Habit'}` },
                    { l:'Category', v:`${selCat.emoji} ${selCat.label}` },
                    { l:'Type', v: type === 'binary' ? '✓ Yes / No' : '# Measurable' },
                    { l:'Schedule', v: `${days.length} days/week` },
                    { l:'Time', v:'🌅 Morning' },
                  ].map(row => (
                    <div key={row.l} className="flex items-center justify-between py-2"
                      style={{ borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                      <span style={{ fontSize:'12px', color:C.t3, fontFamily:Fn.i }}>{row.l}</span>
                      <span style={{ fontSize:'13px', fontWeight:600, color:C.t1, fontFamily:Fn.q }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-6 pt-4 shrink-0" style={{ borderTop:`1px solid rgba(255,255,255,0.05)` }}>
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s-1)}
              className="flex items-center justify-center gap-1 px-5"
              style={{ height:52, borderRadius:R.md, backgroundColor:C.charcoal,
                border:`1px solid rgba(255,255,255,0.08)`, flexShrink:0 }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color:C.t2 }}/>
              <span style={{ fontSize:'14px', fontWeight:600, fontFamily:Fn.i, color:C.t2 }}>Back</span>
            </button>
          )}
          <motion.button whileTap={{ scale:0.97 }}
            onClick={() => step < steps.length-1 ? setStep(s => s+1) : undefined}
            className="flex-1 flex items-center justify-center gap-2"
            style={{
              height:52, borderRadius:R.md,
              background:`linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`,
              boxShadow:`0 6px 20px ${C.purpleGlow}`,
            }}
          >
            <span style={{ fontSize:'15px', fontWeight:700, fontFamily:Fn.i, color:'#fff' }}>
              {step < steps.length-1 ? 'Continue' : '✨ Create Habit'}
            </span>
            {step < steps.length-1 && <ChevronRight className="w-4 h-4 text-white"/>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREEN 4 — REMINDERS
// ═══════════════════════════════════════════════════════════
const reminderHabits = [
  { ...habits[0], time:'07:30', on:true,  label:'In 1h 20m' },
  { ...habits[2], time:'10:00', on:true,  label:'In 3h 50m' },
  { ...habits[1], time:'20:00', on:true,  label:'Tonight' },
  { ...habits[3], time:'18:30', on:false, label:'Off' },
  { ...habits[4], time:'21:00', on:false, label:'Off' },
];

function RemindersScreen() {
  const [toggled, setToggled] = useState<Record<number,boolean>>(
    Object.fromEntries(reminderHabits.map((h,i) => [i, h.on]))
  );
  const [quietHours, setQuietHours] = useState(true);
  const [smartRemind, setSmartRemind] = useState(true);

  const timeline = reminderHabits.filter((_,i) => toggled[i]).slice(0,3);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor:C.bg }}>
      <StatusBar/>

      {/* Header */}
      <div className="px-5 pt-3 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h1 style={{ fontSize:'24px', fontWeight:800, fontFamily:Fn.q, color:C.t1 }}>Reminders 🔔</h1>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor:C.charcoal, border:`1px solid rgba(255,255,255,0.06)` }}>
            <Bell className="w-4 h-4" style={{ color:C.purple }}/>
          </button>
        </div>
        <p style={{ fontSize:'13px', color:C.t2, fontFamily:Fn.i }}>Tuesday · 4 active reminders</p>
      </div>

      <div className="px-5 space-y-4 flex-1">
        {/* ── Smart Insight Card ── */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden p-4"
          style={{
            borderRadius:R.xl,
            background:`linear-gradient(135deg, #1A2E4A 0%, #2D1B69 100%)`,
            border:`1px solid rgba(139,92,246,0.25)`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:`radial-gradient(ellipse at bottom right, ${C.purpleSoft} 0%, transparent 60%)` }}
          />
          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background:`linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`,
                boxShadow:`0 4px 12px ${C.purpleGlow}` }}>
              <Brain className="w-5 h-5 text-white"/>
            </div>
            <div className="flex-1">
              <p style={{ fontSize:'14px', fontWeight:700, fontFamily:Fn.q, color:C.t1, marginBottom:4 }}>
                Your focus peaks at 8–9am ✨
              </p>
              <p style={{ fontSize:'12px', color:C.t2, fontFamily:Fn.i, lineHeight:1.5, marginBottom:10 }}>
                Based on your completion patterns, morning habits are 72% more likely to be done.
              </p>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor:'rgba(255,255,255,0.1)', border:`1px solid rgba(255,255,255,0.15)` }}
              >
                <Sparkles className="w-3 h-3" style={{ color:C.purpleLight }}/>
                <span style={{ fontSize:'12px', fontWeight:600, fontFamily:Fn.i, color:C.purpleLight }}>Set smart reminder</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Today's Timeline ── */}
        <div>
          <SecHead title="Today's Schedule"/>
          <div className="relative pl-6">
            {/* vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 rounded-full"
              style={{ backgroundColor:`rgba(255,255,255,0.07)` }}/>

            <div className="space-y-3">
              {timeline.map((rh, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i*0.08 }}
                  className="relative flex items-center gap-3 p-3"
                  style={{ borderRadius:R.md, backgroundColor:C.charcoal,
                    border:`1px solid rgba(255,255,255,0.05)` }}
                >
                  {/* timeline dot */}
                  <div className="absolute -left-4 w-3 h-3 rounded-full"
                    style={{ backgroundColor: i === 0 ? C.purple : `rgba(255,255,255,0.2)`,
                      boxShadow: i === 0 ? `0 0 6px ${C.purpleGlow}` : 'none' }}
                  />

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor:`${rh.acc}18` }}>
                    <span style={{ fontSize:'18px' }}>{rh.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.q, color:C.t1 }}>{rh.name}</p>
                    <p style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i }}>{rh.label}</p>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: i === 0 ? C.purpleSoft : C.charcoalLight,
                      border: i === 0 ? `1px solid ${C.purpleGlow}` : `1px solid rgba(255,255,255,0.07)`,
                    }}
                  >
                    <span style={{ fontSize:'12px', fontWeight:700, fontFamily:Fn.i,
                      color: i === 0 ? C.purple : C.t2 }}>{rh.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Habit Reminders ── */}
        <div>
          <SecHead title="Habit Reminders"/>
          <div className="space-y-2">
            {reminderHabits.map((rh, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }}
                className="flex items-center gap-3 p-3.5"
                style={{ borderRadius:R.md, backgroundColor:C.charcoal,
                  border:`1px solid rgba(255,255,255,0.05)`,
                  opacity: toggled[i] ? 1 : 0.55 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor:`${rh.acc}18` }}>
                  <span style={{ fontSize:'20px' }}>{rh.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.q, color:C.t1 }}>{rh.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" style={{ color:toggled[i] ? rh.acc : C.t3 }}/>
                    <span style={{ fontSize:'11px', color:toggled[i] ? rh.acc : C.t3, fontFamily:Fn.i, fontWeight:600 }}>
                      {rh.time}
                    </span>
                  </div>
                </div>
                <Toggle on={toggled[i]} onChange={() => setToggled(p => ({...p,[i]:!p[i]}))}/>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Global Settings ── */}
        <div>
          <SecHead title="Settings"/>
          <div className="space-y-2 pb-4">
            {[
              { icon:<Moon className="w-4 h-4"/>, title:'Quiet Hours', sub:'22:00 – 07:00 · No notifications', val:quietHours, set:setQuietHours },
              { icon:<Brain className="w-4 h-4"/>, title:'Smart Reminders', sub:'AI-powered timing based on your patterns', val:smartRemind, set:setSmartRemind },
            ].map((s,i) => (
              <div key={i} className="flex items-center gap-3 p-4"
                style={{ borderRadius:R.md, backgroundColor:C.charcoal,
                  border:`1px solid rgba(255,255,255,0.05)` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: s.val ? C.purpleSoft : `rgba(255,255,255,0.05)`,
                    color: s.val ? C.purple : C.t3 }}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.q, color:C.t1 }}>{s.title}</p>
                  <p style={{ fontSize:'11px', color:C.t3, fontFamily:Fn.i }}>{s.sub}</p>
                </div>
                <Toggle on={s.val} onChange={() => s.set(v => !v)}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active={3}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREEN 5 — MOTIVATION
// ═══════════════════════════════════════════════════════════
const quotes = [
  { text:"We are what we repeatedly do. Excellence is not an act, but a habit.", author:"Aristotle" },
  { text:"Success is the sum of small efforts, repeated day in and day out.", author:"R. Collier" },
  { text:"A habit is not a decision. It's a lifestyle.", author:"James Clear" },
];

const badges = [
  { emoji:'🔥', name:'21-Day Streak', color:C.peach,     acc:C.peachAcc,    unlocked:true  },
  { emoji:'📚', name:'Bookworm',       color:C.pink,      acc:C.pinkAcc,     unlocked:true  },
  { emoji:'💪', name:'Iron Will',      color:C.lavender,  acc:C.lavenderAcc, unlocked:true  },
  { emoji:'🌟', name:'Milestone',      color:C.yellow,    acc:C.yellowAcc,   unlocked:false },
  { emoji:'🏆', name:'Champion',       color:C.mint,      acc:C.mintAcc,     unlocked:false },
];

function MotivationScreen() {
  const [qIdx, setQIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  const q = quotes[qIdx];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor:C.bg }}>
      <StatusBar/>

      {/* Header */}
      <div className="px-5 pt-3 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h1 style={{ fontSize:'24px', fontWeight:800, fontFamily:Fn.q, color:C.t1 }}>Keep Going 💫</h1>
          <div
            className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
            style={{ backgroundColor:C.purpleSoft, border:`1px solid ${C.purpleGlow}` }}
          >
            <Flame className="w-3.5 h-3.5" style={{ color:C.purple }}/>
            <span style={{ fontSize:'12px', fontWeight:700, fontFamily:Fn.i, color:C.purple }}>Day 21</span>
          </div>
        </div>
        <p style={{ fontSize:'13px', color:C.t2, fontFamily:Fn.i }}>You're building something real 🌱</p>
      </div>

      <div className="px-5 space-y-4 flex-1">
        {/* ── Daily Quote Card ── */}
        <motion.div
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          className="relative overflow-hidden p-5"
          style={{
            borderRadius:R.xl,
            background:`linear-gradient(135deg, #1E1050 0%, #2D1B69 40%, #1A0A3D 100%)`,
            border:`1px solid rgba(139,92,246,0.22)`,
            boxShadow:`0 12px 40px rgba(0,0,0,0.3)`,
          }}
        >
          <div className="absolute pointer-events-none inset-0"
            style={{ background:`radial-gradient(ellipse at top right, ${C.purpleSoft} 0%, transparent 55%)` }}/>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor:`rgba(255,255,255,0.1)` }}
              >
                <Quote className="w-4 h-4" style={{ color:C.purpleLight }}/>
              </div>
              <div className="flex gap-1">
                {quotes.map((_,i) => (
                  <button key={i} onClick={() => setQIdx(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ backgroundColor: i === qIdx ? C.purpleLight : 'rgba(255,255,255,0.3)',
                      transform: i === qIdx ? 'scale(1.3)' : 'scale(1)' }}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={qIdx}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-8 }} transition={{ duration:0.25 }}
              >
                <p style={{ fontSize:'16px', fontWeight:600, fontFamily:Fn.q, color:'#fff',
                  lineHeight:1.55, marginBottom:14, fontStyle:'italic' }}>
                  "{q.text}"
                </p>
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', fontFamily:Fn.i }}>
                  — {q.author}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-4">
              <motion.button whileTap={{ scale:0.88 }}
                onClick={() => setSaved(!saved)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full"
                style={{
                  backgroundColor: saved ? C.purpleSoft : 'rgba(255,255,255,0.08)',
                  border:`1px solid ${saved ? C.purple : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <Bookmark className="w-3.5 h-3.5" style={{ color: saved ? C.purple : 'rgba(255,255,255,0.6)', fill: saved ? C.purple : 'none' }}/>
                <span style={{ fontSize:'12px', fontWeight:600, fontFamily:Fn.i,
                  color: saved ? C.purple : 'rgba(255,255,255,0.6)' }}>
                  {saved ? 'Saved' : 'Save'}
                </span>
              </motion.button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full"
                style={{ backgroundColor:'rgba(255,255,255,0.08)', border:`1px solid rgba(255,255,255,0.12)` }}>
                <ChevronRight className="w-3.5 h-3.5" style={{ color:'rgba(255,255,255,0.6)' }}/>
                <span style={{ fontSize:'12px', fontWeight:600, fontFamily:Fn.i, color:'rgba(255,255,255,0.6)' }}>Next</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Streak Celebration ── */}
        <motion.div
          initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
          transition={{ delay:0.1 }}
          className="relative overflow-hidden p-4"
          style={{ borderRadius:R.xl, backgroundColor:C.charcoal,
            border:`1px solid rgba(255,255,255,0.06)` }}
        >
          <div className="absolute pointer-events-none inset-0"
            style={{ background:`radial-gradient(ellipse at top left, ${C.peachAcc}15 0%, transparent 60%)` }}/>
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background:`linear-gradient(135deg, ${C.peach} 0%, #FFD4A0 100%)`,
                  boxShadow:`0 6px 20px ${C.peachAcc}40` }}>
                <span style={{ fontSize:'32px' }}>🔥</span>
              </div>
            </div>
            <div className="flex-1">
              <p style={{ fontSize:'22px', fontWeight:800, fontFamily:Fn.q, color:C.t1, lineHeight:1 }}>
                21-Day Streak!
              </p>
              <p style={{ fontSize:'12px', color:C.t2, fontFamily:Fn.i, marginTop:4, marginBottom:10 }}>
                Top 8% of all Bloom users 🏆
              </p>
              {/* Progress bar toward 30 */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span style={{ fontSize:'10px', color:C.t3, fontFamily:Fn.i }}>Progress to 30-day badge</span>
                  <span style={{ fontSize:'10px', fontWeight:700, color:C.peachAcc, fontFamily:Fn.i }}>21/30</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:'70%' }}
                    transition={{ duration:1, delay:0.4, ease:'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background:`linear-gradient(90deg, ${C.peachAcc} 0%, ${C.amber} 100%)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Today's Wins ── */}
        <div>
          <SecHead title="Today's Wins 🎯"/>
          <div className="flex flex-wrap gap-2">
            {habits.filter(h => h.id === 1).map(h => (
              <div key={h.id}
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ backgroundColor:h.bg, boxShadow:`0 2px 8px ${h.acc}25` }}
              >
                <span style={{ fontSize:'14px' }}>{h.emoji}</span>
                <span style={{ fontSize:'12px', fontWeight:600, fontFamily:Fn.i, color:h.acc }}>{h.name}</span>
                <Check className="w-3 h-3" style={{ color:h.acc }}/>
              </div>
            ))}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full"
              style={{ backgroundColor:C.charcoalMid, border:`1px dashed rgba(255,255,255,0.1)` }}
            >
              <span style={{ fontSize:'12px', color:C.t3, fontFamily:Fn.i }}>4 more to go…</span>
            </div>
          </div>
        </div>

        {/* ── Achievement Badges ── */}
        <div>
          <SecHead title="Achievements" action="View all"/>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth:'none' }}>
            {badges.map((b, i) => (
              <motion.div key={b.name}
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay: i*0.06 }}
                className="flex flex-col items-center gap-2 shrink-0"
                style={{ width:72 }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                  style={{
                    backgroundColor: b.unlocked ? b.bg : C.charcoalMid,
                    boxShadow: b.unlocked ? `0 4px 16px ${b.acc}35` : 'none',
                    opacity: b.unlocked ? 1 : 0.45,
                    border: !b.unlocked ? `1.5px dashed rgba(255,255,255,0.1)` : 'none',
                  }}
                >
                  <span style={{ fontSize:'28px', filter: b.unlocked ? 'none' : 'grayscale(1)' }}>{b.emoji}</span>
                  {!b.unlocked && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor:'rgba(0,0,0,0.35)' }}>
                      <span style={{ fontSize:'16px' }}>🔒</span>
                    </div>
                  )}
                </div>
                <span style={{ fontSize:'10px', fontWeight:600, fontFamily:Fn.i, textAlign:'center',
                  color: b.unlocked ? C.t1 : C.t3, lineHeight:1.3 }}>{b.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Science Tip ── */}
        <div
          className="flex items-start gap-3 p-4"
          style={{ borderRadius:R.xl, backgroundColor:C.charcoal,
            border:`1px solid rgba(255,255,255,0.06)` }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background:`linear-gradient(135deg, ${C.mint} 0%, ${C.sky} 100%)` }}>
            <Brain className="w-5 h-5" style={{ color:C.mintAcc }}/>
          </div>
          <div className="flex-1">
            <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.06em',
              color:C.mintAcc, fontFamily:Fn.i, marginBottom:4 }}>SCIENCE SAYS</p>
            <p style={{ fontSize:'13px', fontWeight:600, fontFamily:Fn.q, color:C.t1, marginBottom:6 }}>
              After 21 days, habits become 40% more automatic
            </p>
            <p style={{ fontSize:'12px', color:C.t2, fontFamily:Fn.i, lineHeight:1.5 }}>
              Your brain is physically rewiring neural pathways right now. Keep going! 🧠
            </p>
          </div>
        </div>

        {/* ── Daily Challenge ── */}
        <motion.div
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.3 }}
          className="relative overflow-hidden p-4 mb-4"
          style={{ borderRadius:R.xl,
            background:`linear-gradient(135deg, ${C.tealSoft} 0%, ${C.purpleSoft} 100%)`,
            border:`1px solid rgba(26,138,122,0.2)` }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor:`rgba(26,138,122,0.25)` }}>
              <span style={{ fontSize:'20px' }}>🌟</span>
            </div>
            <div className="flex-1">
              <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.06em', color:C.teal, fontFamily:Fn.i, marginBottom:4 }}>
                DAILY CHALLENGE
              </p>
              <p style={{ fontSize:'14px', fontWeight:600, fontFamily:Fn.q, color:C.t1, lineHeight:1.4 }}>
                Try meditating 5 min extra today for a bonus ⚡50 XP
              </p>
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 py-3"
            style={{ borderRadius:R.md,
              background:`linear-gradient(135deg, ${C.teal} 0%, #0E6B5C 100%)`,
              boxShadow:`0 4px 16px ${C.tealGlow}` }}
          >
            <span style={{ fontSize:'14px', fontWeight:700, fontFamily:Fn.i, color:'#fff' }}>
              Accept Challenge
            </span>
            <ArrowRight className="w-4 h-4 text-white"/>
          </button>
        </motion.div>
      </div>

      <BottomNav active={4}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN SHOWCASE PAGE
// ═══════════════════════════════════════════════════════════
const SCREENS = [
  { id:0, number:'01', label:'Home',       sublabel:'Dashboard',   screen: <DashboardScreen/> },
  { id:1, number:'02', label:'Progress',   sublabel:'Analytics',   screen: <ProgressScreen/> },
  { id:2, number:'03', label:'Create',     sublabel:'New Habit',   screen: <CreateHabitScreen/> },
  { id:3, number:'04', label:'Reminders',  sublabel:'Notifications',screen: <RemindersScreen/> },
  { id:4, number:'05', label:'Motivation', sublabel:'Keep Going',  screen: <MotivationScreen/> },
];

export function AppScreensPage() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const tabRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    setDir(i > active ? 1 : -1);
    setActive(i);
    // Scroll tab into view
    setTimeout(() => {
      const el = tabRef.current?.querySelector(`[data-tab="${i}"]`) as HTMLElement;
      el?.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor:C.bgDeep }}>
      {/* ── Top Brand Bar ── */}
      <div
        className="shrink-0 px-5 pt-6 pb-4"
        style={{ background:`linear-gradient(180deg, #030D16 0%, ${C.bgDeep} 100%)` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize:'22px' }}>🌸</span>
              <span style={{ fontSize:'18px', fontWeight:800, fontFamily:Fn.q, color:C.t1 }}>Bloom</span>
              <div
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor:C.purpleSoft, border:`1px solid ${C.purpleGlow}` }}
              >
                <span style={{ fontSize:'9px', fontWeight:700, fontFamily:Fn.i, color:C.purple, letterSpacing:'0.06em' }}>
                  5 SCREENS
                </span>
              </div>
            </div>
            <p style={{ fontSize:'12px', color:C.t3, fontFamily:Fn.i }}>
              iPhone 16 · Deep Teal Design System
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor:C.charcoal, border:`1px solid rgba(255,255,255,0.06)` }}
          >
            <Sparkles className="w-4 h-4" style={{ color:C.purple }}/>
          </div>
        </div>

        {/* ── Screen Selector Tabs ── */}
        <div
          ref={tabRef}
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth:'none' }}
        >
          {SCREENS.map((s) => {
            const isActive = active === s.id;
            return (
              <motion.button
                key={s.id}
                data-tab={s.id}
                onClick={() => goTo(s.id)}
                whileTap={{ scale:0.94 }}
                className="flex flex-col items-start shrink-0 px-3.5 py-2.5 transition-all"
                style={{
                  borderRadius:R.lg,
                  backgroundColor: isActive ? C.purple : C.charcoal,
                  border: isActive ? 'none' : `1px solid rgba(255,255,255,0.07)`,
                  boxShadow: isActive ? `0 4px 16px ${C.purpleGlow}` : 'none',
                  minWidth: 90,
                }}
              >
                <span style={{ fontSize:'10px', fontWeight:700, fontFamily:Fn.i, letterSpacing:'0.04em',
                  color: isActive ? 'rgba(255,255,255,0.7)' : C.t3, marginBottom:2 }}>{s.number}</span>
                <span style={{ fontSize:'13px', fontWeight:700, fontFamily:Fn.q,
                  color: isActive ? '#fff' : C.t1 }}>{s.label}</span>
                <span style={{ fontSize:'10px', fontFamily:Fn.i,
                  color: isActive ? 'rgba(255,255,255,0.6)' : C.t3 }}>{s.sublabel}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── iPhone Frame ── */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8 pt-4">
        {/* Navigation arrows */}
        <div className="flex items-center justify-between w-full max-w-[390px] mb-3">
          <button
            onClick={() => active > 0 && goTo(active - 1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: active > 0 ? C.charcoal : 'transparent',
              opacity: active > 0 ? 1 : 0.3 }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color:C.t2 }}/>
            <span style={{ fontSize:'12px', fontFamily:Fn.i, color:C.t2 }}>
              {active > 0 ? SCREENS[active-1].label : ''}
            </span>
          </button>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {SCREENS.map(s => (
              <button key={s.id} onClick={() => goTo(s.id)}>
                <motion.div
                  animate={{ width: active === s.id ? 20 : 6 }}
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: active === s.id ? C.purple : `rgba(255,255,255,0.2)` }}
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => active < SCREENS.length-1 && goTo(active + 1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: active < SCREENS.length-1 ? C.charcoal : 'transparent',
              opacity: active < SCREENS.length-1 ? 1 : 0.3 }}
          >
            <span style={{ fontSize:'12px', fontFamily:Fn.i, color:C.t2 }}>
              {active < SCREENS.length-1 ? SCREENS[active+1].label : ''}
            </span>
            <ChevronRight className="w-4 h-4" style={{ color:C.t2 }}/>
          </button>
        </div>

        {/* iPhone mockup shell */}
        <div
          className="relative w-full max-w-[390px] flex-1"
          style={{
            borderRadius: 50,
            background:`linear-gradient(145deg, #2A2A2A 0%, #1A1A1A 100%)`,
            padding: 10,
            boxShadow:`0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)`,
          }}
        >
          {/* Side buttons */}
          <div className="absolute left-0 top-[120px] flex flex-col gap-3" style={{ transform:'translateX(-8px)' }}>
            {[40,40,40].map((h,i) => (
              <div key={i} style={{ width:4, height:h, borderRadius:3,
                background:`linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 100%)`,
                boxShadow:`inset 0 1px 0 rgba(255,255,255,0.08)` }}/>
            ))}
          </div>
          <div className="absolute right-0 top-[160px]" style={{ transform:'translateX(8px)' }}>
            <div style={{ width:4, height:64, borderRadius:3,
              background:`linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 100%)`,
              boxShadow:`inset 0 1px 0 rgba(255,255,255,0.08)` }}/>
          </div>

          {/* Screen */}
          <div
            className="overflow-hidden"
            style={{
              borderRadius: 42,
              height: 'calc(100vh - 240px)',
              minHeight: 660,
              maxHeight: 780,
              position:'relative',
              backgroundColor: C.bg,
            }}
          >
            {/* Dynamic Island */}
            <div
              className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 px-3"
              style={{
                height:36, borderRadius:22,
                backgroundColor:'#000',
                boxShadow:`0 0 0 1px rgba(255,255,255,0.04)`,
                minWidth:120,
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor:'#1A1A1A', border:`1px solid #333` }}/>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor:'#1A1A1A', border:`1px solid #333` }}/>
            </div>

            {/* Screen content with slide transition */}
            <div style={{ height:'100%', paddingTop:0 }}>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={active}
                  custom={dir}
                  initial={{ opacity:0, x: dir * 40 }}
                  animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x: dir * -40 }}
                  transition={{ duration:0.28, ease:[0.25,0.46,0.45,0.94] }}
                  style={{ height:'100%', overflowY:'auto', scrollbarWidth:'none' }}
                >
                  {SCREENS[active].screen}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Screen label */}
        <div className="text-center mt-4">
          <span style={{ fontSize:'13px', fontWeight:700, fontFamily:Fn.q, color:C.t1 }}>
            {SCREENS[active].number} · {SCREENS[active].label}
          </span>
          <span style={{ fontSize:'12px', color:C.t3, fontFamily:Fn.i, marginLeft:8 }}>
            {SCREENS[active].sublabel}
          </span>
        </div>
      </div>
    </div>
  );
}
