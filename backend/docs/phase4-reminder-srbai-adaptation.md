Goal: reminder execution + SRBAI assessment + composite habit-strength score + reminder tapering policy + difficulty feedback + reflection + adaptation recommendation
In scope: reminder evaluation/persistence/actions, SRBAI 4-item questionnaire, composite score formula, tapering policy, difficulty ratings, post-completion reflection, adaptation recommendation, analytics event wiring
Out of scope: mobile push provider integration (stub only), reward/streak engine, AI-driven adaptive timing

## Status: IMPLEMENTED

---

## Phase 4A — Reminder Execution & Action Flow

### What was built

#### 1. Reminder Evaluation & Persistence
`POST /users/:userId/habits/:habitId/reminders/evaluate-and-create`

- Runs stateless `ReminderDecisionRules.decide()` — same logic as Phase 3, extended with a live dedup check.
- Dedup window: 23 × 60 minutes (configurable via `cooldownOverrideMinutes` override).
- If `shouldRemind=true` and no duplicate exists: persists a `Reminder` record in `PENDING` status, calls `StubNotificationGateway`, updates to `SENT`.
- Returns `EvaluateAndCreateResult` with `{ persisted, decisionReason, evaluatedAt, reminder }`.

**NotificationGateway interface + stub**
- `INotificationGateway` port at `src/reminders/notification/notification.gateway.interface.ts`
- `StubNotificationGateway` always returns `delivered=true` — replace with a real provider without changing any application code.

#### 2. Reminder Action Flow
`POST /users/:userId/reminders/:reminderId/actions`

Two action types handled by `RemindersService.submitAction`:

**DONE action** (`actionType: "DONE"`):
- Guards against ACTED / EXPIRED / CANCELLED status.
- Idempotency: rejects if a DONE action already exists for this reminder.
- Auto-creates a `HabitLog` with `triggerSource=REMINDER_TRIGGERED`, `linkedReminderId`, `sourceConfidence=1.0` — only if no linked log already exists.
- Returns `DoneActionResult { reminder, action, habitLog }`.

**SNOOZE action** (`actionType: "SNOOZE"`, optional `snoozeMinutes` default 30):
- Creates a `ReminderAction` record with `snoozedUntil = actedAt + snoozeMinutes`.
- Creates a new follow-up `Reminder` scheduled at `snoozedUntil`.
- Returns `SnoozeActionResult { reminder, action, followUpReminder }`.

**Other reminder endpoints:**
- `GET /users/:userId/reminders` — list reminders for user
- `GET /users/:userId/reminders/:reminderId` — get single reminder

#### 3. Completion Source Linkage
`ProgressSummary` extended with 6 new fields computed from DONE-status logs only:
- `selfInitiatedCount`, `reminderTriggeredCount`, `unknownSourceCount`
- `selfInitiatedRate`, `reminderDependenceRate`, `completionWithoutReminderRate` (all rounded to 3 decimal places)

#### Analytics events wired
| Event | Trigger |
|---|---|
| `reminder_done` | `RemindersService.handleDone` |
| `reminder_snooze` | `RemindersService.handleSnooze` |
| `reminder_sent` | `ReminderExecutionService.evaluateAndCreate` (after gateway confirms) |

### New database models (Phase 4A)

```prisma
model Reminder {
  id             String                @id @default(uuid())
  userId         String
  habitId        String
  linkedCueId    String?
  status         ReminderStatus        @default(PENDING)
  decisionReason ReminderDecisionReason
  scheduledFor   DateTime
  evaluatedAt    DateTime
  expiresAt      DateTime
  sentAt         DateTime?
  deliveredAt    DateTime?
  cooldownKey    String
  explanation    Json?
  createdAt      DateTime              @default(now())
}

model ReminderAction {
  id           String               @id @default(uuid())
  reminderId   String
  userId       String
  actionType   ReminderActionType
  actedAt      DateTime
  snoozedUntil DateTime?
  metadata     Json?
}
```

`HabitLog` extended with `linkedReminderId String?` and `sourceConfidence Float?`.

### Files created (Phase 4A)
- `src/domain/entities/reminder.entity.ts`
- `src/domain/entities/reminder-action.entity.ts`
- `src/domain/repositories/reminder.repository.ts`
- `src/domain/repositories/reminder-action.repository.ts`
- `src/infrastructure/persistence/reminder.prisma-repository.ts`
- `src/infrastructure/persistence/reminder-action.prisma-repository.ts`
- `src/reminders/notification/notification.gateway.interface.ts`
- `src/reminders/notification/stub-notification.gateway.ts`
- `src/reminders/dto/evaluate-and-create-reminder.dto.ts`
- `src/reminders/dto/create-reminder-action.dto.ts`
- `src/reminders/reminder-execution.service.ts`
- `src/reminders/reminders.service.ts`
- `src/reminders/reminders.controller.ts`
- `src/reminders/reminders.module.ts`
- `src/reminders/reminders.service.spec.ts` — 10 tests
- `src/reminders/reminder-execution.service.spec.ts` — 4 tests
- `prisma/migrations/20260325000000_phase4a_reminder_execution/migration.sql`

### Files modified (Phase 4A)
- `prisma/schema.prisma` — `Reminder`, `ReminderAction` models; enums; `HabitLog` fields
- `src/domain/enums/domain.enums.ts` — `ReminderStatus`, `ReminderDecisionReason`, `ReminderActionType`
- `src/domain/entities/habit-log.entity.ts` — added `linkedReminderId`, `sourceConfidence`
- `src/domain/repositories/habit-log.repository.ts` — `CreateHabitLogData` extended; `findByLinkedReminderId` added
- `src/infrastructure/persistence/habit-log.prisma-repository.ts` — updated
- `src/progress/interfaces/progress-summary.interface.ts` — 6 new source-rate fields
- `src/progress/progress.service.ts` — source breakdown computation
- `src/app.module.ts` — `RemindersModule` registered

---

## Phase 4B — SRBAI Assessment + Composite Habit-Strength Score + Tapering Policy

### What was built

#### 1. SRBAI Assessment
`POST /users/:userId/habits/:habitId/srbai-assessments`

Accepts 4 Likert-scale items (1–7) from the Self-Report Behavioral Automaticity Index.  
Scoring formula: `((rawAverage - 1) / 6) × 100` → `normalizedScore100 ∈ [0, 100]`.

Other endpoints:
- `GET .../srbai-assessments/latest`
- `GET .../srbai-assessments` — list all

#### 2. Composite Habit-Strength Score
`GET /users/:userId/habits/:habitId/habit-strength/composite`

Combines three components weighted as follows:

| Component | Weight | Source |
|---|---|---|
| SRBAI normalized score | 60% | Latest `SrbaiAssessment` |
| Consistency score | 25% | `doneRate` × 100 from `HabitStrengthRules` |
| Context stability score | 15% | Self-initiated rate × 100 from `ProgressSummary` |

Final score → Stage:
- `0–39` → `weak`
- `40–69` → `building`
- `70–100` → `strong`

#### 3. Reminder Tapering Policy
`POST /users/:userId/habits/:habitId/reminder-policy/apply-tapering`  
`GET  /users/:userId/habits/:habitId/reminder-policy`

`recommendTaperingPolicy(stage, selfInitiatedRate)` → `TaperingRecommendation`:

| Stage | Self-initiated rate | Mode | Cooldown | Max/day |
|---|---|---|---|---|
| `strong` | ≥ 0.7 | `MINIMAL` | 1440 min | 1 |
| `strong` | < 0.7 | `TAPERED` | 720 min | 2 |
| `building` | — | `TAPERED` | 480 min | 3 |
| `weak` | — | `STANDARD` | 240 min | 4 |

Policy is persisted/upserted in the `ReminderPolicy` table and returned.

#### Analytics events wired
| Event | Trigger |
|---|---|
| `srbai_submitted` | `SrbaiService.submitAssessment` |

### New database models (Phase 4B)

```prisma
model SrbaiAssessment {
  id                String   @id @default(uuid())
  userId            String
  habitId           String
  item1             Int
  item2             Int
  item3             Int
  item4             Int
  rawAverage        Float
  normalizedScore100 Float
  assessedAt        DateTime @default(now())
}

model ReminderPolicy {
  id             String              @id @default(uuid())
  habitId        String              @unique
  mode           ReminderPolicyMode
  cooldownMinutes Int
  maxPerDay      Int
  narrowingLevel Int
  effectiveFrom  DateTime
}
```

### Files created (Phase 4B)
- `src/domain/entities/srbai-assessment.entity.ts`
- `src/domain/entities/reminder-policy.entity.ts`
- `src/domain/repositories/srbai-assessment.repository.ts`
- `src/domain/repositories/reminder-policy.repository.ts`
- `src/infrastructure/persistence/srbai-assessment.prisma-repository.ts`
- `src/infrastructure/persistence/reminder-policy.prisma-repository.ts`
- `src/habits/dto/create-srbai-assessment.dto.ts`
- `src/domain/rules/habit-strength-4b.rules.ts` — `scoreSrbai`, `computeComposite`, `recommendTaperingPolicy`
- `src/habits/srbai.service.ts`
- `src/habits/srbai.controller.ts`
- `src/domain/rules/habit-strength-4b.rules.spec.ts` — 11 tests
- `prisma/migrations/20260325000001_phase4b_srbai_and_tapering/migration.sql`

### Files modified (Phase 4B)
- `prisma/schema.prisma` — `SrbaiAssessment`, `ReminderPolicy` models; `ReminderPolicyMode` enum
- `src/domain/enums/domain.enums.ts` — `ReminderPolicyMode`, `HabitStrengthStage`
- `src/habits/habits.module.ts` — `SrbaiController`, `SrbaiService`, new repo bindings

---

## Phase 4C — Difficulty Feedback + Reflection + Adaptation Recommendation

### What was built

#### 1. Difficulty Rating After Completion
`POST /users/:userId/habits/:habitId/logs/:logId/difficulty`

Body: `{ rating: "very_easy"|"easy"|"moderate"|"hard"|"very_hard", note?: string, occurredAt?: ISO }`

- Stored as a `UserActivityLog` entry with `activityType = "difficulty:<rating>:logId=<logId>"`.
- No new DB table required.
- Returns `{ id, logId, rating, note, occurredAt }`.

`GET /users/:userId/habits/:habitId/difficulty-ratings` — lists all difficulty entries for the habit.

#### 2. Post-Completion Reflection
`POST /users/:userId/habits/:habitId/logs/:logId/reflection`

Body: `{ text: string (max 1000 chars), occurredAt?: ISO }`

- Stored as `UserActivityLog` with `activityType = "reflection:logId=<logId>:<first 200 chars>"`.
- Returns `{ id, logId, text, occurredAt }`.

#### 3. Adaptation Recommendation (stateless)
`GET /users/:userId/habits/:habitId/adaptation-recommendation`

Query params: `compositeScore?`, `selfInitiatedRate`, `reminderDependenceRate`, `doneCount`, `currentPolicyMode?`

Runs `AdaptationRules.recommend()` — pure domain computation, no DB writes.

**Decision tree:**

| Condition | Focus | Suggested mode |
|---|---|---|
| `compositeScore ≥ 70` AND `selfInitiatedRate ≥ 0.7` | `reduce_reminders` | `MINIMAL` |
| `recentAvgDifficulty ≥ HARD` AND `doneCount ≥ 5` | `review_difficulty` | `null` |
| `reminderDependenceRate ≥ 0.7` AND `doneCount ≥ 5` | `increase_support` | `STANDARD` |
| `doneCount ∈ {7, 21, 66}` (milestone) | `celebrate_consistency` | `TAPERED` or `STANDARD` |
| Default | `maintain` | current policy |

Recent average difficulty is derived automatically from the last 5 `difficulty:*` activity log entries.

Returns `AdaptationRecommendation { focus, summary, suggestedPolicyMode, milestoneReached, evaluatedAt }`.

#### Analytics events — full map
| Event key | When |
|---|---|
| `habit.created` | `HabitsService.createHabit` |
| `habit.updated` | `HabitsService.updateHabit` |
| `habit.logged` | `ProgressService.createHabitLog` |
| `reminder_sent` | `ReminderExecutionService` — after gateway delivers |
| `reminder_done` | `RemindersService.handleDone` |
| `reminder_snooze` | `RemindersService.handleSnooze` |
| `srbai_submitted` | `SrbaiService.submitAssessment` |

Frontend can additionally write `app_open`, `session_start`, `session_end` directly via `POST /users/:userId/activity-logs`.

### Files created (Phase 4C)
- `src/progress/dto/submit-difficulty.dto.ts` — `DifficultyRating` const enum + `SubmitDifficultyDto`
- `src/progress/dto/submit-reflection.dto.ts` — `SubmitReflectionDto`
- `src/progress/dto/get-adaptation.dto.ts` — query-params DTO for adaptation endpoint
- `src/domain/rules/adaptation.rules.ts` — `AdaptationRules.recommend` + types
- `src/progress/feedback.service.ts` — `FeedbackService`
- `src/domain/rules/adaptation.rules.spec.ts` — 11 tests

### Files modified (Phase 4C)
- `src/progress/progress.controller.ts` — 5 new endpoints, `FeedbackService` injected
- `src/progress/progress.module.ts` — `FeedbackService`, `USER_ACTIVITY_LOG_REPOSITORY` binding added
- `src/reminders/reminder-execution.service.ts` — `AnalyticsService` injected, `reminder_sent` event
- `src/habits/srbai.service.ts` — `AnalyticsService` injected, `srbai_submitted` event

---

## Overall test count

| Suite | Tests |
|---|---|
| `reminders.service.spec.ts` | 10 |
| `reminder-execution.service.spec.ts` | 4 |
| `habit-strength-4b.rules.spec.ts` | 11 |
| `adaptation.rules.spec.ts` | 11 |
| `progress.service.spec.ts` | 4 |
| `habits.service.spec.ts` | 7 |
| `app.controller.spec.ts` | 1 |
| `dto-validation.spec.ts` | 4 |
| **Total** | **52** |

---

## Demo flow (Phase 4A–4C combined)

1. `POST /auth/register` + `POST /auth/login` → `accessToken`
2. `POST /users/{userId}/habits` → create habit with `reminderEnabled: true`, cues, schedule
3. `POST /users/{userId}/habits/{habitId}/reminders/evaluate-and-create` → evaluate + persist reminder
4. `POST /users/{userId}/reminders/{reminderId}/actions` with `{ actionType: "DONE" }` → auto-log and mark ACTED
5. `GET  /users/{userId}/habits/{habitId}/progress-summary` → see `selfInitiatedRate`, `reminderDependenceRate`
6. `POST /users/{userId}/habits/{habitId}/srbai-assessments` → submit 4-item SRBAI
7. `GET  /users/{userId}/habits/{habitId}/habit-strength/composite` → final composite score + stage
8. `POST /users/{userId}/habits/{habitId}/reminder-policy/apply-tapering` → persist tapering policy
9. `POST /users/{userId}/habits/{habitId}/logs/{logId}/difficulty` → rate difficulty
10. `GET  /users/{userId}/habits/{habitId}/adaptation-recommendation?selfInitiatedRate=0.8&reminderDependenceRate=0.1&doneCount=21&compositeScore=72` → milestone celebration + reduce_reminders recommendation

## What remains

- **DB migration**: run `npx prisma migrate deploy` once `npx prisma dev` is active (Phase 4A–4B migrations written as raw SQL files)
- **`prisma generate`**: regenerate client after migration to remove `as any` casts in `habit-log.prisma-repository.ts` and `reminder-policy.prisma-repository.ts`
- **Reward / streak engine** — not in scope for Phase 4
- **Mobile push provider** — swap `StubNotificationGateway` for real provider (FCM / APNs)
