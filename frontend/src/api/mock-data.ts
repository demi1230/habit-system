/**
 * Mock data aligned with the current frontend API contracts.
 * The data is mutable so the mock router can simulate interactive updates.
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

export interface MockRecommendation {
  id: string;
  userId: string;
  habitId: string;
  recommendationCode: string;
  articleIds: string[];
  status: 'ACTIVE' | 'DISMISSED';
}

export interface MockRecommendationInteraction {
  id: string;
  userId: string;
  recommendationId: string;
  interactionType: 'SHOWN' | 'CLICKED' | 'DISMISSED' | 'APPLIED';
  occurredAt: string;
}

export interface MockArticleInteraction {
  id: string;
  userId: string;
  articleId: string;
  habitId?: string;
  sourceType: 'LEARNING_PAGE' | 'RECOMMENDATION' | 'HABIT_DETAIL' | 'ANALYTICS_PAGE';
  sourceId?: string;
  interactionType: 'OPENED' | 'COMPLETED' | 'BOOKMARKED' | 'UNBOOKMARKED';
  occurredAt: string;
}

export const MOCK_USER_ID = 'mock-user-1';
export const MOCK_EMAIL = 'bat@example.com';
export const MOCK_DISPLAY_NAME = 'Bat';

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

const WEEKDAYS_ONLY: Weekday[] = ['MONDAY', 'WEDNESDAY', 'FRIDAY'];

function jsToWeekday(jsDay: number): Weekday {
  return (
    ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as Weekday[]
  )[jsDay];
}

const uid = MOCK_USER_ID;

export const habits: Habit[] = [
  {
    id: 'habit-1',
    userId: uid,
    title: 'Read book',
    description: 'Read for 30 minutes each evening.',
    precedingRoutine: null,
    color: 'peach',
    iconType: 'emoji',
    iconValue: '📚',
    benefits: ['Learn consistently', 'Build a calm evening routine'],
    measurementUnit: 'minutes',
    targetValue: 30,
    minimumTarget: 15,
    startDate: isoDate(daysAgoDate(30)),
    status: 'ACTIVE',
    reminderEnabled: true,
    archivedAt: null,
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [
      {
        id: 'cue-1',
        habitId: 'habit-1',
        startTime: '21:00',
        endTime: '22:00',
        coarseLocation: null,
        precedingRoutine: null,
        isActive: true,
      },
      {
        id: 'cue-2',
        habitId: 'habit-1',
        startTime: null,
        endTime: null,
        coarseLocation: 'Bedroom',
        precedingRoutine: null,
        isActive: true,
      },
    ],
    motivationProfile: { goalTag: 'creativity', reason: 'I want to keep learning every day.' },
    createdAt: daysAgoDate(30).toISOString(),
    updatedAt: daysAgoDate(2).toISOString(),
  },
  {
    id: 'habit-2',
    userId: uid,
    title: 'Exercise',
    description: 'Move on Monday, Wednesday, and Friday mornings.',
    precedingRoutine: null,
    color: 'sage',
    iconType: 'emoji',
    iconValue: '🏃',
    benefits: ['Increase energy'],
    measurementUnit: 'boolean',
    targetValue: 1,
    minimumTarget: 1,
    startDate: isoDate(daysAgoDate(28)),
    status: 'ACTIVE',
    reminderEnabled: true,
    archivedAt: null,
    scheduleDays: WEEKDAYS_ONLY.map((weekday) => ({ weekday })),
    cues: [
      {
        id: 'cue-3',
        habitId: 'habit-2',
        startTime: '07:00',
        endTime: '08:00',
        coarseLocation: null,
        precedingRoutine: null,
        isActive: true,
      },
    ],
    motivationProfile: { goalTag: 'health', reason: 'I want to feel stronger.' },
    createdAt: daysAgoDate(28).toISOString(),
    updatedAt: daysAgoDate(1).toISOString(),
  },
  {
    id: 'habit-3',
    userId: uid,
    title: 'Meditate',
    description: 'Meditate for 10 minutes every morning.',
    precedingRoutine: 'After waking up',
    color: 'sky',
    iconType: 'emoji',
    iconValue: '🧘',
    benefits: ['Reduce stress', 'Improve focus'],
    measurementUnit: 'minutes',
    targetValue: 10,
    minimumTarget: 5,
    startDate: isoDate(daysAgoDate(21)),
    status: 'ACTIVE',
    reminderEnabled: false,
    archivedAt: null,
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [
      {
        id: 'cue-4',
        habitId: 'habit-3',
        startTime: '06:30',
        endTime: '07:00',
        coarseLocation: null,
        precedingRoutine: null,
        isActive: true,
      },
      {
        id: 'cue-5',
        habitId: 'habit-3',
        startTime: null,
        endTime: null,
        coarseLocation: null,
        precedingRoutine: 'After waking up',
        isActive: true,
      },
    ],
    motivationProfile: { goalTag: 'mindset', reason: 'I want to start the day calmly.' },
    createdAt: daysAgoDate(21).toISOString(),
    updatedAt: daysAgoDate(3).toISOString(),
  },
  {
    id: 'habit-4',
    userId: uid,
    title: 'Drink water',
    description: 'Drink 8 cups of water.',
    precedingRoutine: null,
    color: 'ocean',
    iconType: 'emoji',
    iconValue: '💧',
    benefits: ['Improve hydration'],
    measurementUnit: 'cups',
    targetValue: 8,
    minimumTarget: 4,
    startDate: isoDate(daysAgoDate(14)),
    status: 'ACTIVE',
    reminderEnabled: true,
    archivedAt: null,
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [],
    motivationProfile: { goalTag: 'health', reason: 'I want to stay hydrated throughout the day.' },
    createdAt: daysAgoDate(14).toISOString(),
    updatedAt: daysAgoDate(0).toISOString(),
  },
  {
    id: 'habit-5',
    userId: uid,
    title: 'Morning journal',
    description: 'Write a short journal entry every morning.',
    precedingRoutine: null,
    color: 'plum',
    iconType: 'emoji',
    iconValue: '✍️',
    benefits: ['Reflect on the day'],
    measurementUnit: 'boolean',
    targetValue: 1,
    minimumTarget: 1,
    startDate: isoDate(daysAgoDate(40)),
    status: 'ARCHIVED',
    reminderEnabled: false,
    archivedAt: daysAgoDate(5).toISOString(),
    scheduleDays: ALL_DAYS.map((weekday) => ({ weekday })),
    cues: [
      {
        id: 'cue-6',
        habitId: 'habit-5',
        startTime: '08:00',
        endTime: '09:00',
        coarseLocation: null,
        precedingRoutine: null,
        isActive: false,
      },
    ],
    motivationProfile: { goalTag: 'mindset', reason: 'I want to reflect more often.' },
    createdAt: daysAgoDate(40).toISOString(),
    updatedAt: daysAgoDate(5).toISOString(),
  },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function generateLogs(habit: Habit, completionRate: number, seed: number): HabitLog[] {
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
      const actualValue = done
        ? isMeasured
          ? Math.round(habit.minimumTarget + rand() * (habit.targetValue - habit.minimumTarget + 2))
          : 1
        : isMeasured
          ? Math.round(rand() * Math.max(habit.minimumTarget - 1, 1))
          : 0;
      const triggerPool: Array<'SELF_INITIATED' | 'REMINDER_TRIGGERED' | 'UNKNOWN'> = [
        'SELF_INITIATED',
        'SELF_INITIATED',
        'REMINDER_TRIGGERED',
        'UNKNOWN',
      ];

      const logDate = new Date(cursor);
      logDate.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60), 0, 0);

      logs.push({
        id: `log-${habit.id}-${isoDate(cursor)}`,
        habitId: habit.id,
        status: done ? 'DONE' : 'NOT_DONE',
        actualValue,
        completedAt: localISOString(logDate),
        loggedAt: localISOString(logDate),
        triggerSource: done ? triggerPool[Math.floor(rand() * triggerPool.length)] : null,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return logs;
}

export const logsMap: Record<string, HabitLog[]> = {
  'habit-1': generateLogs(habits[0], 0.8, 101),
  'habit-2': generateLogs(habits[1], 0.7, 202),
  'habit-3': generateLogs(habits[2], 0.9, 303),
  'habit-4': generateLogs(habits[3], 0.6, 404),
  'habit-5': generateLogs(habits[4], 0.5, 505),
};

export function computeProgress(habitId: string): ProgressSummary {
  const logs = logsMap[habitId] ?? [];
  const done = logs.filter((l) => l.status === 'DONE');
  const notDone = logs.filter((l) => l.status === 'NOT_DONE');
  const selfInitiated = done.filter((l) => l.triggerSource === 'SELF_INITIATED');
  const reminderTriggered = done.filter((l) => l.triggerSource === 'REMINDER_TRIGGERED');
  const unknown = done.filter((l) => !l.triggerSource || l.triggerSource === 'UNKNOWN');
  const totalDone = done.length || 1;
  const lastDone = done.length ? done[done.length - 1] : null;
  const lastLog = logs.length ? logs[logs.length - 1] : null;

  return {
    totalLogs: logs.length,
    doneCount: done.length,
    notDoneCount: notDone.length,
    lastLoggedAt: lastLog?.loggedAt ?? null,
    lastCompletedAt: lastDone?.completedAt ?? null,
    completionByTriggerSource: {
      SELF_INITIATED: selfInitiated.length,
      REMINDER_TRIGGERED: reminderTriggered.length,
      UNKNOWN: unknown.length,
    },
    selfInitiatedCount: selfInitiated.length,
    reminderTriggeredCount: reminderTriggered.length,
    unknownSourceCount: unknown.length,
    selfInitiatedRate: selfInitiated.length / totalDone,
    reminderDependenceRate: reminderTriggered.length / totalDone,
    completionWithoutReminderRate: (selfInitiated.length + unknown.length) / totalDone,
  };
}

export function computeStrength(habitId: string): HabitStrengthSignals {
  const habit = habits.find((entry) => entry.id === habitId);
  const logs = logsMap[habitId] ?? [];
  const done = logs.filter((l) => l.status === 'DONE');
  const partial = done.filter(
    (l) => l.actualValue !== null && habit && l.actualValue < habit.targetValue,
  );
  const notDone = logs.filter((l) => l.status === 'NOT_DONE');
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
    partialCount: partial.length,
    notDoneCount: notDone.length,
    doneRate,
    selfInitiatedRate: selfRate,
    scheduledWeekdayCount: habit?.scheduleDays.length ?? 0,
    hasCueConfiguration: (habit?.cues.length ?? 0) > 0,
    hasMotivationProfile: habit?.motivationProfile !== null,
    stage,
    evaluatedAt: new Date().toISOString(),
  };
}

export function computeCompositeScore(habitId: string): SrbaiCompositeScore {
  const strength = computeStrength(habitId);
  const srbaiScore = 55 + Math.random() * 30;
  const consistencyScore = strength.doneRate * 100;
  const contextStabilityScore = 40 + Math.random() * 40;
  const finalScore = srbaiScore * 0.4 + consistencyScore * 0.35 + contextStabilityScore * 0.25;

  let stage: SrbaiCompositeScore['stage'] = 'weak';
  if (finalScore >= 70) stage = 'strong';
  else if (finalScore >= 45) stage = 'building';

  return {
    srbaiScore: Math.round(srbaiScore * 100) / 100,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    contextStabilityScore: Math.round(contextStabilityScore * 100) / 100,
    selfInitiatedRate: strength.selfInitiatedRate,
    finalScore: Math.round(finalScore * 100) / 100,
    stage,
    evaluatedAt: new Date().toISOString(),
  };
}

export function computeAdaptation(habitId: string): AdaptationRecommendation {
  const strength = computeStrength(habitId);

  if (strength.doneRate >= 0.8) {
    return {
      focus: 'celebrate_consistency',
      summary: 'You are doing well. Keep the habit steady.',
      suggestedPolicyMode: 'MINIMAL',
      milestoneReached: true,
      evaluatedAt: new Date().toISOString(),
    };
  }

  if (strength.doneRate >= 0.6) {
    return {
      focus: 'maintain',
      summary: 'The habit is progressing. Keep the same support level for now.',
      suggestedPolicyMode: 'MODERATE_SUPPORT',
      milestoneReached: false,
      evaluatedAt: new Date().toISOString(),
    };
  }

  if (strength.selfInitiatedRate < 0.3) {
    return {
      focus: 'increase_support',
      summary: 'The habit still depends on external prompting.',
      suggestedPolicyMode: 'FULL_SUPPORT',
      milestoneReached: false,
      evaluatedAt: new Date().toISOString(),
    };
  }

  return {
    focus: 'review_difficulty',
    summary: 'The target may still feel heavy. Consider simplifying it.',
    suggestedPolicyMode: 'FULL_SUPPORT',
    milestoneReached: false,
    evaluatedAt: new Date().toISOString(),
  };
}

function buildCueContext(habit: Habit) {
  return habit.cues.map((cue) => ({
    isActive: cue.isActive,
    startTime: cue.startTime,
    endTime: cue.endTime,
    coarseLocation: cue.coarseLocation,
    precedingRoutine: cue.precedingRoutine,
  }));
}

export function getTodayHabits(date?: string): HabitWithCueContext[] {
  const target = date ? new Date(`${date}T00:00:00`) : new Date();
  const wd = jsToWeekday(target.getDay());

  return habits
    .filter((habit) => habit.status === 'ACTIVE' && habit.scheduleDays.some((d) => d.weekday === wd))
    .map((habit) => {
      const strength = computeStrength(habit.id);
      const logs = logsMap[habit.id] ?? [];
      const scheduledWds = new Set(habit.scheduleDays.map((d) => d.weekday));
      const doneSet = new Set<string>();
      const allLogDates = new Set<string>();

      for (const log of logs) {
        const dateKey = isoDate(new Date(log.completedAt));
        allLogDates.add(dateKey);
        if (log.status === 'DONE') doneSet.add(dateKey);
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
          } else if (!(i === 0 && !allLogDates.has(key))) {
            break;
          }
        }
        cursor.setDate(cursor.getDate() - 1);
      }

      return {
        ...habit,
        currentStreak,
        strengthScore: Math.round(strength.doneRate * Math.min(strength.totalLogs / 30, 1) * 100),
        cueContext: buildCueContext(habit),
      };
    });
}

const now = new Date();

export const reminders: Reminder[] = [
  {
    id: 'rem-1',
    userId: uid,
    habitId: 'habit-1',
    linkedCueId: 'cue-1',
    decisionReason: 'SHOULD_REMIND',
    status: 'PENDING',
    scheduledFor: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0).toISOString(),
    evaluatedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0).toISOString(),
    sentAt: null,
    deliveredAt: null,
    effectiveUntil: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0).toISOString(),
    explanation: { source: 'mock-schedule' },
    createdAt: daysAgoDate(0).toISOString(),
  },
  {
    id: 'rem-2',
    userId: uid,
    habitId: 'habit-2',
    linkedCueId: 'cue-3',
    decisionReason: 'SHOULD_REMIND',
    status: 'SENT',
    scheduledFor: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0).toISOString(),
    evaluatedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30).toISOString(),
    sentAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 58).toISOString(),
    deliveredAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0).toISOString(),
    effectiveUntil: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0).toISOString(),
    explanation: { source: 'mock-schedule' },
    createdAt: daysAgoDate(0).toISOString(),
  },
  {
    id: 'rem-3',
    userId: uid,
    habitId: 'habit-4',
    linkedCueId: null,
    decisionReason: 'SHOULD_REMIND',
    status: 'ACTED',
    scheduledFor: daysAgoDate(1).toISOString(),
    evaluatedAt: daysAgoDate(1).toISOString(),
    sentAt: daysAgoDate(1).toISOString(),
    deliveredAt: daysAgoDate(1).toISOString(),
    effectiveUntil: new Date(daysAgoDate(1).getTime() + 60 * 60 * 1000).toISOString(),
    explanation: { source: 'mock-low-completion' },
    createdAt: daysAgoDate(1).toISOString(),
  },
  {
    id: 'rem-4',
    userId: uid,
    habitId: 'habit-3',
    linkedCueId: 'cue-4',
    decisionReason: 'SHOULD_REMIND',
    status: 'EXPIRED',
    scheduledFor: daysAgoDate(2).toISOString(),
    evaluatedAt: daysAgoDate(2).toISOString(),
    sentAt: daysAgoDate(2).toISOString(),
    deliveredAt: daysAgoDate(2).toISOString(),
    effectiveUntil: new Date(daysAgoDate(2).getTime() + 60 * 60 * 1000).toISOString(),
    explanation: { source: 'mock-expired' },
    createdAt: daysAgoDate(2).toISOString(),
  },
];

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

function recommendationCodeForHabit(habitId: string): string {
  const strength = computeStrength(habitId);
  if (strength.doneRate >= 0.8) return 'CELEBRATE_CONSISTENCY';
  if (strength.selfInitiatedRate < 0.3) return 'REVIEW_REMINDER_DEPENDENCE';
  if (strength.doneRate >= 0.6) return 'BUILD_CONSISTENCY';
  return 'SIMPLIFY_HABIT';
}

function articleIdsForCode(recommendationCode: string): string[] {
  switch (recommendationCode) {
    case 'CELEBRATE_CONSISTENCY':
      return ['build-consistency'];
    case 'REVIEW_REMINDER_DEPENDENCE':
      return ['reduce-reminder-dependence', 'fix-your-cues'];
    case 'BUILD_CONSISTENCY':
      return ['build-consistency', 'reduce-friction'];
    default:
      return ['habit-small-steps', 'reduce-friction'];
  }
}

export const recommendations: MockRecommendation[] = habits
  .filter((habit) => habit.status === 'ACTIVE')
  .map((habit) => {
    const recommendationCode = recommendationCodeForHabit(habit.id);
    return {
      id: `rec-${habit.id}`,
      userId: uid,
      habitId: habit.id,
      recommendationCode,
      articleIds: articleIdsForCode(recommendationCode),
      status: 'ACTIVE',
    };
  });

export const recommendationInteractions: MockRecommendationInteraction[] = [];
export const articleInteractions: MockArticleInteraction[] = [];
