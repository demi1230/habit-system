import { useSyncExternalStore } from 'react';

export interface HabitChunk {
  id: string;
  name: string;
  description?: string;
  duration?: string;
}

// ── Goal Tags ──────────────────────────────────────────

export interface GoalTag {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isSystem: boolean;
}

const defaultGoalTags: GoalTag[] = [
  { id: 'health', name: 'Health', emoji: '💧', color: '#6BB5C9', isSystem: true },
  { id: 'study', name: 'Study', emoji: '📚', color: '#C9A86B', isSystem: true },
  { id: 'fitness', name: 'Fitness', emoji: '🏃', color: '#C96B6B', isSystem: true },
  { id: 'mindfulness', name: 'Mindfulness', emoji: '🧘', color: '#9B6BC9', isSystem: true },
  { id: 'productivity', name: 'Productivity', emoji: '⚡', color: '#6BC98A', isSystem: true },
  { id: 'creativity', name: 'Creativity', emoji: '🎨', color: '#E8A96B', isSystem: true },
  { id: 'social', name: 'Social', emoji: '🤝', color: '#C96BA8', isSystem: true },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#8BC96B', isSystem: true },
];

let goalTags: GoalTag[] = [...defaultGoalTags];
let tagListeners: Set<() => void> = new Set();

function emitTagChange() {
  for (const l of tagListeners) l();
}

export function addGoalTag(tag: GoalTag) {
  goalTags = [...goalTags, tag];
  emitTagChange();
}

export function removeGoalTag(id: string) {
  goalTags = goalTags.filter((t) => t.id !== id);
  emitTagChange();
}

export function updateGoalTag(id: string, updates: Partial<GoalTag>) {
  goalTags = goalTags.map((t) => (t.id === id ? { ...t, ...updates } : t));
  emitTagChange();
}

export function getGoalTags(): GoalTag[] {
  return goalTags;
}

export function useGoalTags(): GoalTag[] {
  return useSyncExternalStore(
    (cb) => { tagListeners.add(cb); return () => tagListeners.delete(cb); },
    () => goalTags,
  );
}

export function getTagById(id: string): GoalTag | undefined {
  return goalTags.find((t) => t.id === id);
}

export function getTagForHabit(habit: Habit): GoalTag | undefined {
  return goalTags.find((t) => t.id === habit.goalTag);
}

export { defaultGoalTags };

// ── Habit ──────────────────────────────────────────────

export interface Habit {
  id: string;
  title: string;
  description: string;
  goalTag: string;
  habitColor?: string; // 'lavender' | 'pink' | 'mint' | 'sky' | 'peach' | 'yellow'
  type: 'binary' | 'measurable';
  unit?: string;
  targetValue?: number;
  minValue?: number;
  frequency: 'daily' | 'weekly';
  days: string[];
  startDate: string;
  timeWindow?: string;
  dayType?: string;
  location?: string;
  precedingRoutine?: string;
  implementationIntention?: string;
  personalReason?: string;
  identityStatement?: string;
  chunks?: HabitChunk[];
  chunkCountsAsComplete?: boolean;
  reminderEnabled: boolean;
  reminderWindow?: string;
  archived: boolean;
  createdAt: string;
  streak: number;
  completionRate: number;
  completions: CompletionLog[];
}

export interface CompletionLog {
  date: string;
  value: number;
  completed: boolean;
  partial: boolean;
  is_target_met?: boolean;
  trigger_source?: 'manual' | 'reminder' | 'quick-dashboard';
  completed_at?: string;
  logged_at?: string;
  difficulty?: 'easy' | 'moderate' | 'hard' | 'very-hard';
  chunkSteps?: Record<string, boolean>;
  reflection?: {
    feeling: string;
    note?: string;
    energy?: string;
    focus?: string;
    satisfaction?: string;
  };
}

export interface HabitEvent {
  id: string;
  date: string;
  type: 'streak-increase' | 'streak-break' | 'freeze-used' | 'reward-earned' | 'recommendation' | 'milestone';
  title: string;
  detail?: string;
}

export interface Recommendation {
  id: string;
  type: 'simplify' | 'reschedule' | 'reduce-chunk' | 'change-cue';
  title: string;
  reason: string;
  accepted?: boolean;
  dismissed?: boolean;
}

// ── Behavioral Analytics ──────────────────────────────
export type BehavioralEventType =
  | 'ui_event'
  | 'user_activity'
  | 'context_event'
  | 'message_exposure'
  | 'notification_action'
  | 'completion_log';

export interface BehavioralEvent {
  id: string;
  type: BehavioralEventType;
  action: string;
  habitId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

let behavioralEvents: BehavioralEvent[] = [];
let eventIdCounter = 1;

export function trackEvent(
  type: BehavioralEventType,
  action: string,
  habitId?: string,
  metadata?: Record<string, unknown>,
) {
  behavioralEvents = [
    ...behavioralEvents,
    {
      id: `evt-${eventIdCounter++}`,
      type,
      action,
      habitId,
      timestamp: new Date().toISOString(),
      metadata,
    },
  ];
}

export function getEvents(): BehavioralEvent[] {
  return behavioralEvents;
}

// ── Initial Data ──────────────────────────────────────

const initialHabits: Habit[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    description: 'Start the day with 10 minutes of mindfulness',
    goalTag: 'mindfulness',
    habitColor: 'lavender',
    type: 'measurable',
    unit: 'minutes',
    targetValue: 10,
    minValue: 3,
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    startDate: '2026-03-01',
    timeWindow: 'Morning (6-9 AM)',
    dayType: 'Any',
    personalReason: 'I want to feel calmer and more focused throughout my day',
    identityStatement: 'I am someone who takes care of their mental health',
    chunks: [
      { id: 'c1', name: 'Sit down and close eyes', duration: '2 min' },
      { id: 'c2', name: 'Focus on breathing' },
      { id: 'c3', name: 'Body scan', duration: '5 min' },
    ],
    chunkCountsAsComplete: true,
    reminderEnabled: true,
    reminderWindow: '7:00 AM - 8:00 AM',
    archived: false,
    createdAt: '2026-03-01',
    streak: 12,
    completionRate: 85,
    completions: [
      { date: '2026-03-12', value: 10, completed: true, partial: false, reflection: { feeling: 'calm', note: 'Felt really centered today' } },
      { date: '2026-03-11', value: 10, completed: true, partial: false, reflection: { feeling: 'focused' } },
      { date: '2026-03-10', value: 5, completed: false, partial: true, reflection: { feeling: 'proud' } },
      { date: '2026-03-09', value: 10, completed: true, partial: false },
      { date: '2026-03-08', value: 10, completed: true, partial: false, reflection: { feeling: 'calm' } },
      { date: '2026-03-07', value: 8, completed: false, partial: true },
      { date: '2026-03-06', value: 10, completed: true, partial: false, reflection: { feeling: 'energized' } },
    ],
  },
  {
    id: '2',
    title: 'Read 20 Pages',
    description: 'Read at least 20 pages of a book',
    goalTag: 'study',
    habitColor: 'pink',
    type: 'measurable',
    unit: 'pages',
    targetValue: 20,
    minValue: 5,
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startDate: '2026-03-03',
    timeWindow: 'Evening (7-10 PM)',
    personalReason: 'Knowledge compounds over time and I want to grow',
    identityStatement: 'I am a lifelong learner',
    reminderEnabled: true,
    reminderWindow: '8:00 PM - 9:00 PM',
    archived: false,
    createdAt: '2026-03-03',
    streak: 5,
    completionRate: 72,
    completions: [
      { date: '2026-03-12', value: 22, completed: true, partial: false, reflection: { feeling: 'proud' } },
      { date: '2026-03-11', value: 15, completed: false, partial: true },
      { date: '2026-03-10', value: 20, completed: true, partial: false },
      { date: '2026-03-09', value: 20, completed: true, partial: false, reflection: { feeling: 'focused' } },
    ],
  },
  {
    id: '3',
    title: 'Drink 2L Water',
    description: 'Stay hydrated throughout the day',
    goalTag: 'health',
    habitColor: 'mint',
    type: 'measurable',
    unit: 'liters',
    targetValue: 2,
    minValue: 1,
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    startDate: '2026-03-01',
    personalReason: 'Better hydration means better focus and energy',
    chunks: [
      { id: 'c4', name: 'Morning glass' },
      { id: 'c5', name: 'With lunch' },
      { id: 'c6', name: 'Afternoon refill' },
      { id: 'c7', name: 'Evening glass' },
    ],
    chunkCountsAsComplete: false,
    reminderEnabled: true,
    reminderWindow: '10:00 AM - 6:00 PM',
    archived: false,
    createdAt: '2026-03-01',
    streak: 8,
    completionRate: 90,
    completions: [
      { date: '2026-03-12', value: 2, completed: true, partial: false },
      { date: '2026-03-11', value: 2.5, completed: true, partial: false },
      { date: '2026-03-10', value: 1.5, completed: false, partial: true },
    ],
  },
  {
    id: '4',
    title: 'Evening Journaling',
    description: 'Write about the day for 5 minutes',
    goalTag: 'mindfulness',
    habitColor: 'sky',
    type: 'binary',
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    startDate: '2026-03-05',
    timeWindow: 'Evening (9-11 PM)',
    personalReason: 'Reflection helps me process and grow',
    reminderEnabled: true,
    reminderWindow: '9:30 PM',
    archived: false,
    createdAt: '2026-03-05',
    streak: 3,
    completionRate: 65,
    completions: [
      { date: '2026-03-12', value: 1, completed: true, partial: false, reflection: { feeling: 'calm' } },
      { date: '2026-03-11', value: 1, completed: true, partial: false },
      { date: '2026-03-10', value: 0, completed: false, partial: false },
    ],
  },
  {
    id: '5',
    title: '30 Min Walk',
    description: 'Take a 30 minute walk outdoors',
    goalTag: 'fitness',
    habitColor: 'peach',
    type: 'measurable',
    unit: 'minutes',
    targetValue: 30,
    minValue: 10,
    frequency: 'daily',
    days: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
    startDate: '2026-03-01',
    personalReason: 'Moving my body keeps my mind sharp',
    reminderEnabled: false,
    archived: true,
    createdAt: '2026-02-01',
    streak: 21,
    completionRate: 88,
    completions: [],
  },
];

// ── Reactive Store ────────────────────────────────────

type Listener = () => void;

let habits: Habit[] = [...initialHabits];
let listeners: Set<Listener> = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Habit[] {
  return habits;
}

// ── Public API ────────────────────────────────────────

export function updateHabit(id: string, updates: Partial<Habit>) {
  habits = habits.map((h) => (h.id === id ? { ...h, ...updates } : h));
  emitChange();
}

export function addHabit(habit: Habit) {
  habits = [...habits, habit];
  emitChange();
}

export function archiveHabit(id: string) {
  habits = habits.map((h) => (h.id === id ? { ...h, archived: true } : h));
  emitChange();
}

export function restoreHabit(id: string) {
  habits = habits.map((h) => (h.id === id ? { ...h, archived: false } : h));
  emitChange();
}

export function deleteHabit(id: string) {
  habits = habits.filter((h) => h.id !== id);
  emitChange();
}

export function logCompletion(
  habitId: string,
  status: 'done' | 'partial' | 'skipped',
  options: {
    value?: number;
    trigger_source?: CompletionLog['trigger_source'];
    difficulty?: CompletionLog['difficulty'];
    chunkSteps?: Record<string, boolean>;
    reflection?: CompletionLog['reflection'];
  } = {},
) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const isoNow = now.toISOString();

  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;

  const actualValue = options.value ?? (status === 'done' ? (habit.targetValue || 1) : status === 'partial' ? (habit.minValue || 0) : 0);
  const isTargetMet = habit.type === 'measurable' && habit.targetValue
    ? actualValue >= habit.targetValue
    : status === 'done';

  const log: CompletionLog = {
    date: dateStr,
    value: actualValue,
    completed: status === 'done',
    partial: status === 'partial',
    is_target_met: isTargetMet,
    trigger_source: options.trigger_source || 'manual',
    completed_at: status !== 'skipped' ? isoNow : undefined,
    logged_at: isoNow,
    difficulty: options.difficulty,
    chunkSteps: options.chunkSteps,
    reflection: options.reflection,
  };

  const filtered = habit.completions.filter((c) => c.date !== dateStr);
  const newCompletions = [log, ...filtered];
  const newStreak = calculateScheduleAwareStreak(habit, newCompletions);

  habits = habits.map((h) =>
    h.id === habitId
      ? { ...h, completions: newCompletions, streak: newStreak }
      : h,
  );
  emitChange();

  trackEvent('completion_log', `habit_${status}`, habitId, {
    value: actualValue,
    is_target_met: isTargetMet,
    trigger_source: options.trigger_source || 'manual',
    difficulty: options.difficulty,
  });
}

function calculateScheduleAwareStreak(habit: Habit, completions: CompletionLog[]): number {
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const scheduledDays = new Set(habit.days.map((d) => dayMap[d]));
  let streak = 0;
  const sorted = [...completions]
    .filter((c) => c.completed || c.partial)
    .map((c) => c.date)
    .sort()
    .reverse();
  const completedDates = new Set(sorted);

  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    if (!scheduledDays.has(dow)) continue;
    const ds = d.toISOString().split('T')[0];
    if (completedDates.has(ds)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Hook ──────────────────────────────────────────────

export function useHabits(): Habit[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useHabit(id: string | undefined): Habit | undefined {
  const all = useHabits();
  return all.find((h) => h.id === id);
}

// ── Legacy compat ──
export const defaultHabits = initialHabits;

// ── Strength Score ──────────────────────────────────────
export function getHabitStrength(habit: Habit) {
  const consistency = Math.min(100, habit.completionRate);
  const independence = habit.reminderEnabled ? 45 : 80;
  const stability = Math.min(100, habit.streak * 7);
  const total = Math.round(consistency * 0.4 + independence * 0.3 + stability * 0.3);
  return { total, consistency, independence, stability };
}