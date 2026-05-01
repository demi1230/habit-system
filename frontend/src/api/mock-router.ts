/**
 * Mock request handler that mirrors the current frontend/backend contract.
 * State is kept in memory so the UI stays interactive when VITE_USE_MOCK=true.
 */
import {
  habits,
  logsMap,
  reminders,
  srbaiAssessments,
  recommendations,
  recommendationInteractions,
  articleInteractions,
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
import type { Reminder } from './reminders';

const delay = (ms = 150) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type Params = Record<string, string>;

function match(pattern: string, path: string): Params | null {
  const re = new RegExp(
    '^' +
      pattern
        .replace(/:[a-zA-Z]+/g, (m) => `(?<${m.slice(1)}>[^/]+)`)
        .replace(/\//g, '\\/') +
      '(\\?.*)?$',
  );
  const matched = re.exec(path);
  return matched ? (matched.groups as Params) ?? {} : null;
}

function mockError(status: number, message: string) {
  const err = new Error(message) as Error & { status: number; body: unknown };
  err.status = status;
  err.body = { message };
  return err;
}

function nowIso(): string {
  return new Date().toISOString();
}

function createCueFromPayload(
  rawHabitId: string,
  cue: Record<string, unknown>,
  index: number,
) {
  return {
    id: `cue-${rawHabitId}-${index + 1}`,
    habitId: rawHabitId,
    startTime: (cue.startTime as string | undefined) ?? null,
    endTime: (cue.endTime as string | undefined) ?? null,
    coarseLocation: (cue.coarseLocation as string | undefined) ?? null,
    precedingRoutine: (cue.precedingRoutine as string | undefined) ?? null,
    isActive: (cue.isActive as boolean | undefined) ?? true,
  };
}

function refreshRecommendationForHabit(userId: string, habitId: string) {
  const code =
    computeStrength(habitId).doneRate >= 0.8
      ? 'CELEBRATE_CONSISTENCY'
      : computeStrength(habitId).selfInitiatedRate < 0.3
        ? 'REVIEW_REMINDER_DEPENDENCE'
        : computeStrength(habitId).doneRate >= 0.6
          ? 'BUILD_CONSISTENCY'
          : 'SIMPLIFY_HABIT';

  const articleIds =
    code === 'CELEBRATE_CONSISTENCY'
      ? ['build-consistency']
      : code === 'REVIEW_REMINDER_DEPENDENCE'
        ? ['reduce-reminder-dependence', 'fix-your-cues']
        : code === 'BUILD_CONSISTENCY'
          ? ['build-consistency', 'reduce-friction']
          : ['habit-small-steps', 'reduce-friction'];

  const existing = recommendations.find((rec) => rec.userId === userId && rec.habitId === habitId);
  if (existing) {
    existing.recommendationCode = code;
    existing.articleIds = articleIds;
    existing.status = 'ACTIVE';
    return existing;
  }

  const created = {
    id: `rec-${habitId}-${Date.now()}`,
    userId,
    habitId,
    recommendationCode: code,
    articleIds,
    status: 'ACTIVE' as const,
  };
  recommendations.push(created);
  return created;
}

export async function mockRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  await delay();
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : undefined;
  let params: Params | null;

  if (path === '/auth/login' && method === 'POST') {
    return { accessToken: createMockToken(), displayName: MOCK_DISPLAY_NAME } as T;
  }

  if (path === '/auth/register' && method === 'POST') {
    return {
      id: MOCK_USER_ID,
      email: body?.email ?? MOCK_EMAIL,
      displayName: body?.displayName ?? MOCK_DISPLAY_NAME,
      createdAt: nowIso(),
    } as T;
  }

  params = match('/users/:userId/habits/today', path);
  if (params && method === 'GET') {
    const dateMatch = path.match(/[?&]date=(\d{4}-\d{2}-\d{2})/);
    return getTodayHabits(dateMatch?.[1]) as T;
  }

  params = match('/users/:userId/habits/:habitId/srbai-assessments/latest', path);
  if (params && method === 'GET') {
    return (srbaiAssessments[params.habitId] ?? null) as T;
  }

  params = match('/users/:userId/habits/:habitId/srbai-assessments', path);
  if (params && method === 'POST') {
    const assessment: SrbaiAssessment = {
      id: `srbai-${Date.now()}`,
      habitId: params.habitId,
      item1: body.item1,
      item2: body.item2,
      item3: body.item3,
      item4: body.item4,
      rawAverage: (body.item1 + body.item2 + body.item3 + body.item4) / 4,
      normalizedScore100: ((((body.item1 + body.item2 + body.item3 + body.item4) / 4) - 1) / 6) * 100,
      assessedAt: nowIso(),
    };
    srbaiAssessments[params.habitId] = assessment;
    return assessment as T;
  }

  params = match('/users/:userId/habits/:habitId/habit-strength/composite', path);
  if (params && method === 'GET') {
    return computeCompositeScore(params.habitId) as T;
  }

  params = match('/users/:userId/habits/:habitId/habit-strength', path);
  if (params && method === 'GET') {
    return computeStrength(params.habitId) as T;
  }

  params = match('/users/:userId/habits/:habitId/progress-summary', path);
  if (params && method === 'GET') {
    return computeProgress(params.habitId) as T;
  }

  params = match('/users/:userId/habits/:habitId/adaptation-recommendation', path);
  if (params && method === 'GET') {
    return computeAdaptation(params.habitId) as T;
  }

  params = match('/users/:userId/habits/:habitId/logs/:logId', path);
  if (params && method === 'PATCH') {
    const logs = logsMap[params.habitId] ?? [];
    const idx = logs.findIndex((log) => log.id === params?.logId);
    if (idx === -1) throw mockError(404, 'Log not found');
    const habit = habits.find((entry) => entry.id === params?.habitId);
    const minTarget = habit?.minimumTarget ?? 1;
    const actualValue = body.actualValue ?? logs[idx].actualValue ?? 0;
    logs[idx] = {
      ...logs[idx],
      actualValue,
      status: actualValue >= minTarget ? 'DONE' : 'NOT_DONE',
    };
    return logs[idx] as T;
  }
  if (params && method === 'DELETE') {
    const logs = logsMap[params.habitId] ?? [];
    const idx = logs.findIndex((log) => log.id === params?.logId);
    if (idx === -1) throw mockError(404, 'Log not found');
    logs.splice(idx, 1);
    return undefined as T;
  }

  params = match('/users/:userId/habits/:habitId/logs', path);
  if (params && method === 'GET') {
    return (logsMap[params.habitId] ?? []) as T;
  }
  if (params && method === 'POST') {
    const habit = habits.find((entry) => entry.id === params?.habitId);
    const minTarget = habit?.minimumTarget ?? 1;
    const actualValue = body.actualValue ?? 0;
    const log: HabitLog = {
      id: `log-${Date.now()}`,
      habitId: params.habitId,
      status: actualValue >= minTarget ? 'DONE' : 'NOT_DONE',
      actualValue: body.actualValue ?? null,
      completedAt: body.completedAt ?? nowIso(),
      loggedAt: body.loggedAt ?? nowIso(),
      triggerSource: body.triggerSource ?? 'SELF_INITIATED',
    };
    if (!logsMap[params.habitId]) logsMap[params.habitId] = [];
    logsMap[params.habitId].push(log);
    return log as T;
  }

  params = match('/users/:userId/habits/:habitId', path);
  if (params && method === 'GET') {
    const habit = habits.find((entry) => entry.id === params?.habitId);
    if (!habit) throw mockError(404, 'Habit not found');
    return habit as T;
  }
  if (params && method === 'PATCH') {
    const idx = habits.findIndex((entry) => entry.id === params?.habitId);
    if (idx === -1) throw mockError(404, 'Habit not found');
    const current = habits[idx];
    const nextHabitId = current.id;
    const patched: Habit = {
      ...current,
      ...body,
      scheduleDays: (body.scheduleDays ?? current.scheduleDays) as Array<{ weekday: Weekday }>,
      cues: Array.isArray(body.cues)
        ? body.cues.map((cue: Record<string, unknown>, index: number) =>
            createCueFromPayload(nextHabitId, cue, index),
          )
        : current.cues,
      motivationProfile: body.motivationProfile ?? current.motivationProfile,
      updatedAt: nowIso(),
    };
    habits[idx] = patched;
    return patched as T;
  }

  params = match('/users/:userId/habits', path);
  if (params && method === 'GET') {
    const includeArchived = path.includes('includeArchived=true');
    return habits.filter((habit) => includeArchived || habit.status === 'ACTIVE') as T;
  }
  if (params && method === 'POST') {
    const habitId = `habit-${Date.now()}`;
    const newHabit: Habit = {
      id: habitId,
      userId: params.userId,
      title: body.title,
      description: body.description ?? null,
      precedingRoutine: body.precedingRoutine ?? null,
      color: body.color ?? 'peach',
      iconType: body.iconType ?? 'emoji',
      iconValue: body.iconValue ?? '',
      benefits: Array.isArray(body.benefits) ? body.benefits : [],
      measurementUnit: body.measurementUnit ?? 'boolean',
      targetValue: body.targetValue ?? 1,
      minimumTarget: body.minimumTarget ?? 1,
      startDate: body.startDate ?? nowIso().slice(0, 10),
      status: body.status ?? 'ACTIVE',
      reminderEnabled: body.reminderEnabled ?? false,
      archivedAt: null,
      scheduleDays: (body.scheduleDays ?? []) as Array<{ weekday: Weekday }>,
      cues: (body.cues ?? []).map((cue: Record<string, unknown>, index: number) =>
        createCueFromPayload(habitId, cue, index),
      ),
      motivationProfile:
        body.motivationProfile ??
        (body.reason ? { goalTag: null, reason: body.reason as string } : null),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    habits.push(newHabit);
    logsMap[newHabit.id] = [];
    refreshRecommendationForHabit(params.userId, newHabit.id);
    return newHabit as T;
  }

  params = match('/users/:userId/recommendations/refresh', path);
  if (params && method === 'POST') {
    const habitIdMatch = path.match(/[?&]habitId=([^&]+)/);
    const habitId = habitIdMatch?.[1];
    if (!habitId) throw mockError(400, 'habitId is required');
    return [refreshRecommendationForHabit(params.userId, habitId)] as T;
  }

  params = match('/users/:userId/recommendations/:recommendationId/interactions', path);
  if (params && method === 'POST') {
    const recommendation = recommendations.find(
      (item) => item.id === params?.recommendationId && item.userId === params?.userId,
    );
    if (!recommendation) throw mockError(404, 'Recommendation not found');
    recommendationInteractions.push({
      id: `rec-int-${Date.now()}`,
      userId: params.userId,
      recommendationId: recommendation.id,
      interactionType: body.interactionType,
      occurredAt: nowIso(),
    });
    if (body.interactionType === 'DISMISSED') recommendation.status = 'DISMISSED';
    return { ok: true } as T;
  }

  params = match('/users/:userId/recommendations/:recommendationId/dismiss', path);
  if (params && method === 'POST') {
    const recommendation = recommendations.find(
      (item) => item.id === params?.recommendationId && item.userId === params?.userId,
    );
    if (!recommendation) throw mockError(404, 'Recommendation not found');
    recommendation.status = 'DISMISSED';
    return recommendation as T;
  }

  params = match('/users/:userId/recommendations/:recommendationId', path);
  if (params && method === 'GET') {
    const recommendation = recommendations.find(
      (item) => item.id === params?.recommendationId && item.userId === params?.userId,
    );
    if (!recommendation) throw mockError(404, 'Recommendation not found');
    return recommendation as T;
  }

  params = match('/users/:userId/recommendations', path);
  if (params && method === 'GET') {
    const habitIdMatch = path.match(/[?&]habitId=([^&]+)/);
    const habitId = habitIdMatch?.[1];
    return recommendations.filter(
      (item) =>
        item.userId === params?.userId &&
        item.status === 'ACTIVE' &&
        (!habitId || item.habitId === habitId),
    ) as T;
  }

  params = match('/users/:userId/articles/interactions', path);
  if (params && method === 'GET') {
    const limitMatch = path.match(/[?&]limit=(\d+)/);
    const limit = limitMatch ? Number(limitMatch[1]) : 20;
    return articleInteractions
      .filter((item) => item.userId === params?.userId)
      .slice()
      .reverse()
      .slice(0, limit) as T;
  }

  params = match('/users/:userId/articles/:articleId/interactions', path);
  if (params && method === 'POST') {
    articleInteractions.push({
      id: `article-int-${Date.now()}`,
      userId: params.userId,
      articleId: params.articleId,
      habitId: body.habitId,
      sourceType: body.sourceType,
      sourceId: body.sourceId,
      interactionType: body.interactionType,
      occurredAt: nowIso(),
    });
    return { ok: true } as T;
  }

  params = match('/users/:userId/reminders/:reminderId/actions', path);
  if (params && method === 'POST') {
    const reminder = reminders.find((item) => item.id === params?.reminderId && item.userId === params?.userId);
    if (!reminder) throw mockError(404, 'Reminder not found');

    if (body.actionType === 'DONE') {
      reminder.status = 'ACTED';
      return { reminderId: reminder.id, status: reminder.status } as T;
    }

    if (body.actionType === 'SNOOZE') {
      reminder.status = 'CANCELLED';
      const snoozeMinutes = Number(body.snoozeMinutes ?? 30);
      const scheduledFor = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();
      const followUp: Reminder = {
        ...reminder,
        id: `rem-${Date.now()}`,
        status: 'PENDING',
        scheduledFor,
        evaluatedAt: nowIso(),
        sentAt: null,
        deliveredAt: null,
        effectiveUntil: new Date(Date.now() + (snoozeMinutes + 60) * 60 * 1000).toISOString(),
        explanation: { isScheduledToday: true, activeCueCount: 1 },
        createdAt: nowIso(),
      };
      reminders.unshift(followUp);
      return { reminderId: reminder.id, status: reminder.status, followUpReminderId: followUp.id } as T;
    }

    throw mockError(400, 'Unsupported reminder action');
  }

  params = match('/users/:userId/reminders', path);
  if (params && method === 'GET') {
    return reminders.filter((item) => item.userId === params?.userId) as T;
  }

  console.warn(`[mock] Unhandled ${method} ${path}`);
  throw mockError(404, `Mock: no handler for ${method} ${path}`);
}
