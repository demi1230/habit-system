/**
 * Mock request handler – matches URL patterns and returns data from mock-data.ts.
 * Keeps state in-memory so create / update / archive operations feel interactive.
 */
import {
  habits,
  logsMap,
  reminders,
  srbaiAssessments,
  createMockToken,
  MOCK_USER_ID,
  MOCK_EMAIL,
  MOCK_DISPLAY_NAME,
  getTodayHabits,
  computeProgress,
  computeStrength,
  computeCompositeScore,
  computeAdaptation,
} from './mock-data';
import type { Habit, HabitLog, Weekday } from './types';
import type { SrbaiAssessment } from './srbai';

// ── Tiny delay to mimic network ───────────────────────────────────────────────

const delay = (ms = 150) => new Promise<void>((r) => setTimeout(r, ms));

// ── Route helper ──────────────────────────────────────────────────────────────

type Params = Record<string, string>;

function match(
  pattern: string,
  path: string,
): Params | null {
  // convert :param to named groups
  const re = new RegExp(
    '^' +
      pattern
        .replace(/:[a-zA-Z]+/g, (m) => `(?<${m.slice(1)}>[^/]+)`)
        .replace(/\//g, '\\/') +
      '(\\?.*)?$',
  );
  const m = re.exec(path);
  return m ? (m.groups as Params) ?? {} : null;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function mockRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  await delay();
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : undefined;
  let p: Params | null;

  // ── Auth ────────────────────────────────────────────────────────────────

  if (path === '/auth/login' && method === 'POST') {
    return { accessToken: createMockToken() } as T;
  }

  if (path === '/auth/register' && method === 'POST') {
    return {
      id: MOCK_USER_ID,
      email: body?.email ?? MOCK_EMAIL,
      displayName: body?.displayName ?? MOCK_DISPLAY_NAME,
      createdAt: new Date().toISOString(),
    } as T;
  }

  // ── Habits: today ───────────────────────────────────────────────────────

  p = match('/users/:userId/habits/today', path);
  if (p && method === 'GET') {
    return getTodayHabits() as T;
  }

  // ── Habits: SRBAI assessments (must match BEFORE generic /habits/:id/*) ─

  p = match('/users/:userId/habits/:habitId/srbai-assessments/latest', path);
  if (p && method === 'GET') {
    return (srbaiAssessments[p.habitId] ?? null) as T;
  }

  p = match('/users/:userId/habits/:habitId/srbai-assessments', path);
  if (p && method === 'POST') {
    const assessment: SrbaiAssessment = {
      id: `srbai-${Date.now()}`,
      habitId: p.habitId,
      item1: body.item1,
      item2: body.item2,
      item3: body.item3,
      item4: body.item4,
      rawAverage: (body.item1 + body.item2 + body.item3 + body.item4) / 4,
      normalizedScore100:
        (((body.item1 + body.item2 + body.item3 + body.item4) / 4 - 1) / 6) * 100,
      assessedAt: new Date().toISOString(),
    };
    srbaiAssessments[p.habitId] = assessment;
    return assessment as T;
  }

  // ── Habits: composite score ─────────────────────────────────────────────

  p = match('/users/:userId/habits/:habitId/habit-strength/composite', path);
  if (p && method === 'GET') {
    return computeCompositeScore(p.habitId) as T;
  }

  // ── Habits: strength signals ────────────────────────────────────────────

  p = match('/users/:userId/habits/:habitId/habit-strength', path);
  if (p && method === 'GET') {
    return computeStrength(p.habitId) as T;
  }

  // ── Habits: progress summary ────────────────────────────────────────────

  p = match('/users/:userId/habits/:habitId/progress-summary', path);
  if (p && method === 'GET') {
    return computeProgress(p.habitId) as T;
  }

  // ── Habits: adaptation recommendation ───────────────────────────────────

  p = match('/users/:userId/habits/:habitId/adaptation-recommendation', path);
  if (p && method === 'GET') {
    return computeAdaptation(p.habitId) as T;
  }

  // ── Habits: logs ────────────────────────────────────────────────────────

  p = match('/users/:userId/habits/:habitId/logs', path);
  if (p && method === 'GET') {
    return (logsMap[p.habitId] ?? []) as T;
  }
  if (p && method === 'POST') {
    const log: HabitLog = {
      id: `log-${Date.now()}`,
      habitId: p.habitId,
      status: (body.actualValue ?? 0) > 0 ? 'DONE' : 'NOT_DONE',
      actualValue: body.actualValue ?? null,
      completedAt: body.completedAt ?? new Date().toISOString(),
      loggedAt: body.loggedAt ?? new Date().toISOString(),
      triggerSource: body.triggerSource ?? 'SELF_INITIATED',
    };
    if (!logsMap[p.habitId]) logsMap[p.habitId] = [];
    logsMap[p.habitId].push(log);
    return log as T;
  }

  // ── Habits: single ─────────────────────────────────────────────────────

  p = match('/users/:userId/habits/:habitId', path);
  if (p && method === 'GET') {
    const h = habits.find((h) => h.id === p!.habitId);
    if (!h) throw mockError(404, 'Habit not found');
    return h as T;
  }
  if (p && method === 'PATCH') {
    const idx = habits.findIndex((h) => h.id === p!.habitId);
    if (idx === -1) throw mockError(404, 'Habit not found');
    const patched = { ...habits[idx], ...body, updatedAt: new Date().toISOString() };
    if (body.scheduleDays) {
      patched.scheduleDays = body.scheduleDays;
    }
    if (body.cues) {
      patched.cues = body.cues;
    }
    if (body.motivationProfile) {
      patched.motivationProfile = body.motivationProfile;
    }
    habits[idx] = patched;
    return patched as T;
  }

  // ── Habits: list / create ───────────────────────────────────────────────

  p = match('/users/:userId/habits', path);
  if (p && method === 'GET') {
    const includeArchived = path.includes('includeArchived=true');
    return habits.filter(
      (h) => includeArchived || h.status === 'ACTIVE',
    ) as T;
  }
  if (p && method === 'POST') {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      userId: p.userId,
      title: body.title,
      description: body.description ?? null,
      measurementUnit: body.measurementUnit ?? 'boolean',
      targetValue: body.targetValue ?? 1,
      minimumTarget: body.minimumTarget ?? 1,
      startDate: body.startDate ?? new Date().toISOString().slice(0, 10),
      status: body.status ?? 'ACTIVE',
      reminderEnabled: body.reminderEnabled ?? false,
      archivedAt: null,
      scheduleDays: (body.scheduleDays ?? []) as Array<{ weekday: Weekday }>,
      cues: (body.cues ?? []).map((c: Record<string, unknown>, i: number) => ({
        id: `cue-new-${i}`,
        habitId: `habit-${Date.now()}`,
        type: c.precedingRoutine ? 'PRECEDING_ROUTINE' : c.coarseLocation ? 'LOCATION' : 'TIME',
        value: (c.precedingRoutine ?? c.coarseLocation ?? c.startTime ?? '') as string,
        isActive: c.isActive ?? true,
      })),
      motivationProfile: body.motivationProfile ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    logsMap[newHabit.id] = [];
    return newHabit as T;
  }

  // ── Reminders: actions ──────────────────────────────────────────────────

  p = match('/users/:userId/reminders/:reminderId/actions', path);
  if (p && method === 'POST') {
    const rem = reminders.find((r) => r.id === p!.reminderId);
    if (rem) {
      rem.status = body.action === 'DONE' ? 'DONE' : 'SNOOZED';
    }
    return undefined as T;
  }

  // ── Reminders: list ─────────────────────────────────────────────────────

  p = match('/users/:userId/reminders', path);
  if (p && method === 'GET') {
    return reminders as T;
  }

  // ── Fallback ────────────────────────────────────────────────────────────
  console.warn(`[mock] Unhandled ${method} ${path}`);
  throw mockError(404, `Mock: no handler for ${method} ${path}`);
}

function mockError(status: number, message: string) {
  const err = new Error(message) as Error & { status: number; body: unknown };
  err.status = status;
  err.body = { message };
  return err;
}
