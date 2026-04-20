/**
 * Mock data that matches the backend Prisma schema exactly.
 * All data is kept in-memory and is mutable so the UI feels interactive.
 */
import type {
  Habit,
  HabitWithCueContext,
  HabitLog,
  HabitStrengthSignals,
  ProgressSummary,
  Weekday,
} from './types';
import type { Reminder } from './reminders';
import type { SrbaiAssessment, SrbaiCompositeScore } from './srbai';
import type { AdaptationRecommendation } from './habits';

// ── Helpers ───────────────────────────────────────────────────────────────────

export const MOCK_USER_ID = 'mock-user-1';
export const MOCK_EMAIL = 'bat@example.com';
export const MOCK_DISPLAY_NAME = 'Бат';

export function createMockToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: MOCK_USER_ID,
      email: MOCK_EMAIL,
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  const sig = btoa('mock-signature');
  return `${header}.${payload}.${sig}`;
}

function daysAgoDate(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Format Date to local ISO-like string (YYYY-MM-DDTHH:mm:ss) without UTC shift */
function localISOString(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${mo}-${day}T${h}:${mi}:${s}`;
}

const ALL_DAYS: Weekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const WEEKDAYS_ONLY: Weekday[] = [
  'MONDAY',
  'WEDNESDAY',
  'FRIDAY',
];

function jsToWeekday(jsDay: number): Weekday {
  return (
    ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as Weekday[]
  )[jsDay];
}

// ── Seed Habits ───────────────────────────────────────────────────────────────

const uid = MOCK_USER_ID;

export const habits: Habit[] = [
  {
    id: 'habit-1',
    userId: uid,
    title: 'Ном унших',
    description: 'Өдөр бүр 30 минут ном унших',
    measurementUnit: 'minutes',
    targetValue: 30,
    minimumTarget: 15,
    startDate: isoDate(daysAgoDate(30)),
    status: 'ACTIVE',
    reminderEnabled: true,
    archivedAt: null,
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [
      { id: 'cue-1', habitId: 'habit-1', type: 'TIME', value: '21:00', isActive: true },
      { id: 'cue-2', habitId: 'habit-1', type: 'LOCATION', value: 'Унтлагын өрөө', isActive: true },
    ],
    motivationProfile: { goalTag: 'creativity', reason: 'Мэдлэгээ нэмэгдүүлэх' },
    createdAt: daysAgoDate(30).toISOString(),
    updatedAt: daysAgoDate(2).toISOString(),
  },
  {
    id: 'habit-2',
    userId: uid,
    title: 'Дасгал хийх',
    description: 'MWF дасгал хийх',
    measurementUnit: 'boolean',
    targetValue: 1,
    minimumTarget: 1,
    startDate: isoDate(daysAgoDate(28)),
    status: 'ACTIVE',
    reminderEnabled: true,
    archivedAt: null,
    scheduleDays: WEEKDAYS_ONLY.map((weekday) => ({ weekday })),
    cues: [
      { id: 'cue-3', habitId: 'habit-2', type: 'TIME', value: '07:00', isActive: true },
    ],
    motivationProfile: { goalTag: 'health', reason: 'Эрүүл амьдрах' },
    createdAt: daysAgoDate(28).toISOString(),
    updatedAt: daysAgoDate(1).toISOString(),
  },
  {
    id: 'habit-3',
    userId: uid,
    title: 'Медитейшн',
    description: 'Өглөө 10 минут медитейшн',
    measurementUnit: 'minutes',
    targetValue: 10,
    minimumTarget: 5,
    startDate: isoDate(daysAgoDate(21)),
    status: 'ACTIVE',
    reminderEnabled: false,
    archivedAt: null,
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [
      { id: 'cue-4', habitId: 'habit-3', type: 'TIME', value: '06:30', isActive: true },
      { id: 'cue-5', habitId: 'habit-3', type: 'PRECEDING_ROUTINE', value: 'Сэрсний дараа', isActive: true },
    ],
    motivationProfile: { goalTag: 'mindset', reason: 'Тайван байдал олох' },
    createdAt: daysAgoDate(21).toISOString(),
    updatedAt: daysAgoDate(3).toISOString(),
  },
  {
    id: 'habit-4',
    userId: uid,
    title: 'Ус уух',
    description: '8 стакан ус уух',
    measurementUnit: 'cups',
    targetValue: 8,
    minimumTarget: 4,
    startDate: isoDate(daysAgoDate(14)),
    status: 'ACTIVE',
    reminderEnabled: true,
    archivedAt: null,
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [],
    motivationProfile: { goalTag: 'health', reason: 'Усны хэрэглээ нэмэх' },
    createdAt: daysAgoDate(14).toISOString(),
    updatedAt: daysAgoDate(0).toISOString(),
  },
  {
    id: 'habit-5',
    userId: uid,
    title: 'Өглөөний бичлэг',
    description: 'Өглөө бүр бичлэг хөтлөх',
    measurementUnit: 'boolean',
    targetValue: 1,
    minimumTarget: 1,
    startDate: isoDate(daysAgoDate(40)),
    status: 'ARCHIVED',
    reminderEnabled: false,
    archivedAt: daysAgoDate(5).toISOString(),
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [
      { id: 'cue-6', habitId: 'habit-5', type: 'TIME', value: '08:00', isActive: false },
    ],
    motivationProfile: { goalTag: 'mindset', reason: 'Бодлоо цэгцлэх' },
    createdAt: daysAgoDate(40).toISOString(),
    updatedAt: daysAgoDate(5).toISOString(),
  },
];

// ── Generate Logs ─────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateLogs(
  habit: Habit,
  completionRate: number,
  seed: number,
): HabitLog[] {
  const rand = seededRandom(seed);
  const logs: HabitLog[] = [];
  const startDate = new Date(habit.startDate);
  const endDate = daysAgoDate(0);
  const scheduledWeekdays = new Set(habit.scheduleDays.map((d) => d.weekday));

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const wd = jsToWeekday(cursor.getDay());
    if (scheduledWeekdays.has(wd)) {
      const done = rand() < completionRate;
      const isMeasured = habit.measurementUnit !== 'boolean';
      const actualVal = done
        ? isMeasured
          ? Math.round(habit.minimumTarget + rand() * (habit.targetValue - habit.minimumTarget + 10))
          : 1
        : isMeasured
          ? Math.round(rand() * habit.minimumTarget * 0.5)
          : 0;

      const sources: Array<'SELF_INITIATED' | 'REMINDER_TRIGGERED' | 'MANUAL_ENTRY'> = [
        'SELF_INITIATED',
        'SELF_INITIATED',
        'REMINDER_TRIGGERED',
        'MANUAL_ENTRY',
      ];

      const logDate = new Date(cursor);
      logDate.setHours(8 + Math.floor(rand() * 14), Math.floor(rand() * 60));

      logs.push({
        id: `log-${habit.id}-${isoDate(cursor)}`,
        habitId: habit.id,
        status: done ? 'DONE' : 'NOT_DONE',
        actualValue: actualVal,
        completedAt: localISOString(logDate),
        loggedAt: localISOString(logDate),
        triggerSource: done ? sources[Math.floor(rand() * sources.length)] : null,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return logs;
}

/** habit-id → logs (mutable) */
export const logsMap: Record<string, HabitLog[]> = {
  'habit-1': generateLogs(habits[0], 0.8, 101),
  'habit-2': generateLogs(habits[1], 0.7, 202),
  'habit-3': generateLogs(habits[2], 0.9, 303),
  'habit-4': generateLogs(habits[3], 0.6, 404),
  'habit-5': generateLogs(habits[4], 0.5, 505),
};

// ── Progress Summaries (computed) ─────────────────────────────────────────────

export function computeProgress(habitId: string): ProgressSummary {
  const logs = logsMap[habitId] ?? [];
  const done = logs.filter((l) => l.status === 'DONE');
  const notDone = logs.filter((l) => l.status === 'NOT_DONE');
  const selfInitiated = done.filter((l) => l.triggerSource === 'SELF_INITIATED');
  const reminderTriggered = done.filter((l) => l.triggerSource === 'REMINDER_TRIGGERED');
  const unknown = done.filter((l) => !l.triggerSource || l.triggerSource === 'MANUAL_ENTRY');
  const totalDone = done.length || 1;
  const lastDone = done.length ? done[done.length - 1] : null;
  const lastLog = logs.length ? logs[logs.length - 1] : null;

  return {
    totalLogs: logs.length,
    doneCount: done.length,
    notDoneCount: notDone.length,
    lastLoggedAt: lastLog?.loggedAt ?? null,
    lastCompletedAt: lastDone?.completedAt ?? null,
    selfInitiatedCount: selfInitiated.length,
    reminderTriggeredCount: reminderTriggered.length,
    unknownSourceCount: unknown.length,
    selfInitiatedRate: selfInitiated.length / totalDone,
    reminderDependenceRate: reminderTriggered.length / totalDone,
    completionWithoutReminderRate: (selfInitiated.length + unknown.length) / totalDone,
  };
}

// ── Strength Signals (computed) ───────────────────────────────────────────────

export function computeStrength(habitId: string): HabitStrengthSignals {
  const logs = logsMap[habitId] ?? [];
  const done = logs.filter((l) => l.status === 'DONE');
  const selfInit = done.filter((l) => l.triggerSource === 'SELF_INITIATED');
  const total = logs.length || 1;
  const doneRate = done.length / total;
  const selfRate = done.length ? selfInit.length / done.length : 0;

  let stage: HabitStrengthSignals['stage'] = 'insufficient_data';
  if (logs.length >= 21) stage = 'established';
  else if (logs.length >= 14) stage = 'building';
  else if (logs.length >= 7) stage = 'early_stage';

  return {
    habitId,
    totalLogs: logs.length,
    doneCount: done.length,
    doneRate,
    selfInitiatedRate: selfRate,
    stage,
    evaluatedAt: new Date().toISOString(),
  };
}

// ── Composite Score ───────────────────────────────────────────────────────────

export function computeCompositeScore(habitId: string): SrbaiCompositeScore {
  const str = computeStrength(habitId);
  const srbaiScore = 55 + Math.random() * 30;
  const consistencyScore = str.doneRate * 100;
  const contextStabilityScore = 40 + Math.random() * 40;
  const finalScore = srbaiScore * 0.4 + consistencyScore * 0.35 + contextStabilityScore * 0.25;

  let stage: SrbaiCompositeScore['stage'] = 'WEAK';
  if (finalScore >= 70) stage = 'STRONG';
  else if (finalScore >= 45) stage = 'BUILDING';

  return {
    srbaiScore: Math.round(srbaiScore * 100) / 100,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    contextStabilityScore: Math.round(contextStabilityScore * 100) / 100,
    selfInitiatedRate: str.selfInitiatedRate,
    finalScore: Math.round(finalScore * 100) / 100,
    stage,
    evaluatedAt: new Date().toISOString(),
  };
}

// ── Adaptation Recommendations ────────────────────────────────────────────────

export function computeAdaptation(habitId: string): AdaptationRecommendation {
  const str = computeStrength(habitId);
  if (str.doneRate >= 0.8) {
    return {
      action: 'celebrate_consistency',
      summary: 'Маш сайн байна!',
      details: 'Таны тогтвортой байдал маш өндөр. Үргэлжлүүлээрэй!',
      milestoneReached: true,
    };
  }
  if (str.doneRate >= 0.6) {
    return {
      action: 'keep_going',
      summary: 'Сайн явж байна',
      details: 'Таны ахиц дээшилж байна. Өнөөдөр ч мөн хийгээрэй.',
      milestoneReached: false,
    };
  }
  if (str.selfInitiatedRate < 0.3) {
    return {
      action: 'consider_adjusting_cue',
      summary: 'Санамж дээр хэт найдаж байна',
      details: 'Санамжгүйгээр хийж сурахын тулд cue-ээ шинэчлээрэй.',
      milestoneReached: false,
    };
  }
  return {
    action: 'consider_simplifying',
    summary: 'Зорилтоо хялбарчлах',
    details: 'Зорилтоо жижиг болгож, амжилтын хувийг нэмэгдүүлээрэй.',
    milestoneReached: false,
  };
}

// ── Today's Context ───────────────────────────────────────────────────────────

export function getTodayHabits(date?: string): HabitWithCueContext[] {
  const target = date ? new Date(date + 'T00:00:00') : new Date();
  const wd = jsToWeekday(target.getDay());
  return habits
    .filter((h) => h.status === 'ACTIVE' && h.scheduleDays.some((d) => d.weekday === wd))
    .map((h) => {
      const str = computeStrength(h.id);
      const logs = logsMap[h.id] ?? [];
      // streak: consecutive scheduled days with DONE log
      const scheduledWds = new Set(h.scheduleDays.map((d) => d.weekday));
      const doneSet = new Set<string>();
      const allLogDates = new Set<string>();
      for (const l of logs) {
        const d = new Date(l.completedAt);
        const key = isoDate(d);
        allLogDates.add(key);
        if (l.status === 'DONE') doneSet.add(key);
      }
      let currentStreak = 0;
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      for (let i = 0; i < 365; i++) {
        const curWd = jsToWeekday(cursor.getDay());
        if (scheduledWds.size === 0 || scheduledWds.has(curWd)) {
          const key = isoDate(cursor);
          if (doneSet.has(key)) {
            currentStreak++;
          } else {
            if (i === 0 && !allLogDates.has(key)) { /* today not logged yet */ }
            else break;
          }
        }
        cursor.setDate(cursor.getDate() - 1);
      }
      const maturity = Math.min(str.totalLogs / 30, 1);
      return {
        ...h,
        currentStreak,
        strengthScore: Math.round(str.doneRate * maturity * 100),
        cueContext: h.cues.map((c) => ({
          cueId: c.id,
          type: c.type,
          value: c.value,
          isActive: c.isActive,
          isCurrentlyTriggered: c.type === 'TIME'
            ? isNearTime(c.value)
            : c.type === 'PRECEDING_ROUTINE'
              ? true
              : false,
        })),
      };
    });
}

function isNearTime(timeStr: string): boolean {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const diff = Math.abs(now.getHours() * 60 + now.getMinutes() - (h * 60 + m));
  return diff <= 60;
}

// ── Reminders ─────────────────────────────────────────────────────────────────

const now = new Date();

export const reminders: Reminder[] = [
  {
    id: 'rem-1',
    userId: uid,
    habitId: 'habit-1',
    scheduledFor: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0).toISOString(),
    deliveredAt: null,
    status: 'PENDING',
    triggerReason: 'scheduled_time',
    createdAt: daysAgoDate(0).toISOString(),
  },
  {
    id: 'rem-2',
    userId: uid,
    habitId: 'habit-2',
    scheduledFor: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0).toISOString(),
    deliveredAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0).toISOString(),
    status: 'PENDING',
    triggerReason: 'scheduled_time',
    createdAt: daysAgoDate(0).toISOString(),
  },
  {
    id: 'rem-3',
    userId: uid,
    habitId: 'habit-4',
    scheduledFor: daysAgoDate(1).toISOString(),
    deliveredAt: daysAgoDate(1).toISOString(),
    status: 'DONE',
    triggerReason: 'low_completion_rate',
    createdAt: daysAgoDate(1).toISOString(),
  },
  {
    id: 'rem-4',
    userId: uid,
    habitId: 'habit-3',
    scheduledFor: daysAgoDate(2).toISOString(),
    deliveredAt: daysAgoDate(2).toISOString(),
    status: 'SNOOZED',
    triggerReason: 'scheduled_time',
    createdAt: daysAgoDate(2).toISOString(),
  },
];

// ── SRBAI Assessments ─────────────────────────────────────────────────────────

export const srbaiAssessments: Record<string, SrbaiAssessment | null> = {
  'habit-1': {
    id: 'srbai-1',
    habitId: 'habit-1',
    item1: 4,
    item2: 3,
    item3: 4,
    item4: 3,
    rawAverage: 3.5,
    normalizedScore100: 62.5,
    assessedAt: daysAgoDate(3).toISOString(),
  },
  'habit-3': {
    id: 'srbai-2',
    habitId: 'habit-3',
    item1: 5,
    item2: 4,
    item3: 5,
    item4: 4,
    rawAverage: 4.5,
    normalizedScore100: 87.5,
    assessedAt: daysAgoDate(1).toISOString(),
  },
};
