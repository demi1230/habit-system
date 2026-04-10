Goal: behavioral domain foundation — schedule-aware filtering, cue evaluation, reminder decision, habit-strength signals
In scope: today-filter, cue dayType evaluation, stateless reminder logic, habit-strength stage derivation
Out of scope: reminder delivery/scheduling, notifications, reward/streak engine, adaptive timing, final strength score

## Status: IMPLEMENTED

### What was built

#### 1. Schedule-Aware Today Filter
`GET /users/:userId/habits/today`
- Returns only ACTIVE habits whose `scheduleDays` includes today's weekday.
- Habits with no `scheduleDays` are included every day (no restriction = daily habit).
- Each habit includes a `cueContext` array — one entry per configured cue with evaluation output.

#### 2. Cue Evaluation Foundation
Private `evaluateCue(cue, isWeekend)` on `HabitsService`.
- 
- Returns `CueEvaluationResult`:
  - `isActive: boolean`
  - `dayTypeMatch: boolean`
  - `timeWindow`, `coarseLocation`, `precedingRoutine` — forwarded from cue fields as-is.

#### 3. Stateless Reminder Decision
`GET /users/:userId/habits/:habitId/reminder-decision`
- Evaluates three factors without triggering any notification:
  1. `reminderEnabled` flag on the habit
  2. Whether the habit is scheduled for today (`isScheduledToday`)
  3. Whether at least one cue is currently active (`activeCueCount`)
- Returns `ReminderDecisionResult`:
  - `shouldRemind: boolean`
  - `reason: ReminderDecisionReason` — one of `REMINDER_DISABLED`, `NOT_SCHEDULED_TODAY`, `NO_ACTIVE_CUES`, `SHOULD_REMIND`
  - `isScheduledToday: boolean`
  - `activeCueCount: number`
  - `evaluatedAt: string` (ISO timestamp)

#### 4. Habit-Strength Input Signals
`GET /users/:userId/habits/:habitId/habit-strength`
- Queries all `HabitLog` entries and computes raw statistics.
- Derives `doneRate` and `selfInitiatedRate` (rounded to 3 decimal places).
- Assigns `HabitStrengthStage` based on total log count:
  - `< 5 logs` → `insufficient_data`
  - `5–14` → `early_stage`
  - `15–29` → `building`
  - `30+` → `established`
- Returns `HabitStrengthSignals`:
  - `habitId`, `totalLogs`, `doneCount`, `partialCount`, `notDoneCount`
  - `doneRate`, `selfInitiatedRate`
  - `scheduledWeekdayCount` (length of `scheduleDays`)
  - `hasCueConfiguration`, `hasMotivationProfile`
  - `stage`, `evaluatedAt`

### Files created
- `src/habits/foundation/cue-evaluation/cue-evaluation.types.ts` — `CueEvaluationInput`, `CueEvaluationResult` interfaces
- `src/progress/foundation/habit-strength/habit-strength.interface.ts` — `HabitStrengthStage` type, `HabitStrengthSignals` interface

### Files modified
- `src/habits/foundation/reminder-decision/reminder-decision.types.ts` — added `ReminderDecisionReason`, `ReminderDecisionResult`
- `src/habits/habits.service.ts` — added `JS_DAY_TO_WEEKDAY` map, `getTodayHabits()`, `getReminderDecision()`, private `evaluateCue()`
- `src/habits/habits.controller.ts` — added `GET today` (before `:habitId` to avoid route shadow), `GET :habitId/reminder-decision`
- `src/progress/progress.service.ts` — added `getHabitStrengthSignals()`
- `src/progress/progress.controller.ts` — added `GET :habitId/habit-strength` with `@ApiOperation`

### Demo flow
1. `POST /auth/register` → create user
2. `POST /auth/login` → get `accessToken`, authorize in Swagger (`GET /api`)
3. `POST /users/{userId}/habits` → create habit with `scheduleDays: [{ weekday: "TUESDAY" }]` and cues
4. `GET /users/{userId}/habits/today` → see today's habits filtered by weekday, each with `cueContext`
5. `GET /users/{userId}/habits/{habitId}/reminder-decision` → `{ shouldRemind, reason, activeCueCount, isScheduledToday, evaluatedAt }`
6. `POST /users/{userId}/habits/{habitId}/logs` → log several completions (vary `triggerSource`)
7. `GET /users/{userId}/habits/{habitId}/habit-strength` → signal snapshot advancing through stages

### What remains for Phase 4
- Reminder scheduling engine (cron/queue) — actual delivery
- Notification service integration
- Adaptive reminder timing (based on cue activity windows)
- Habit-strength final composite score (research model)
- Reward / streak engine
