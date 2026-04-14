# Habit Formation System — Backend Documentation

> **Project context:** Thesis — Behaviour-Based Habit Formation System  
> **Stack:** NestJS 11 · TypeScript · Prisma 7 · PostgreSQL  
> **Build tool:** SWC (not tsc) — required for Prisma v7 ESM compatibility  
> **API base:** `http://localhost:3000`  
> **Swagger UI:** `http://localhost:3000/api`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Layout](#3-project-layout)
4. [Database & Migrations](#4-database--migrations)
5. [Domain Layer](#5-domain-layer)
6. [Application Modules](#6-application-modules)
   - 6.1 Auth
   - 6.2 Habits
   - 6.3 SRBAI & Habit Strength
   - 6.4 Progress
   - 6.5 Reminders
   - 6.6 Action Audit Logs
7. [Infrastructure Layer](#7-infrastructure-layer)
8. [Testing](#8-testing)
9. [Development Guide](#9-development-guide)

---

## 1. Architecture Overview

The backend follows a **layered hexagonal architecture**:

```
┌─────────────────────────────────────────────────────┐
│  Presentation  (Controllers, DTOs, Guards)           │
├─────────────────────────────────────────────────────┤
│  Application   (Services — orchestrate use-cases)   │
├─────────────────────────────────────────────────────┤
│  Domain        (Entities, Enums, Rules, Repo ifaces) │
├─────────────────────────────────────────────────────┤
│  Infrastructure (Prisma repo implementations)        │
└─────────────────────────────────────────────────────┘
```

**Key principles applied:**

- **Domain rules are pure functions** — `HabitStrengthRules`, `AdaptationRules`, `ReminderDecisionRules`, and `CueScheduleRules` contain zero I/O. They receive plain data objects and return plain results, making them trivially unit-testable.
- **Repository pattern** — Services talk to interfaces (`IHabitRepository`, `IHabitLogRepository`, etc.) defined in `src/domain/repositories/`. The Prisma implementations live in `src/infrastructure/persistence/`. This means the persistence layer can be swapped without touching business logic.
- **Dependency injection tokens** — Each repository interface has a string token (e.g. `HABIT_REPOSITORY`) used with `@Inject()` so NestJS can resolve the correct Prisma implementation at runtime.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | NestJS | 11 | HTTP server, DI container, module system |
| Language | TypeScript | 5.9 | Strict typing across all layers |
| ORM / DB client | Prisma | 7 | Schema, migrations, type-safe DB client |
| Database | PostgreSQL | 15+ | Primary data store |
| Build | SWC | 0.7 | Replaces `tsc` for build/watch — required for Prisma v7 `import.meta.url` |
| Auth | Passport-JWT + bcrypt | — | JWT access tokens; bcrypt password hashing |
| API documentation | `@nestjs/swagger` | 11 | Auto-generates OpenAPI spec from decorators |
| Validation | `class-validator` + `class-transformer` | — | DTO validation via `ValidationPipe` |
| Testing | Jest 30 + ts-jest 29 | — | Unit + integration tests |

### Why SWC instead of `tsc`?

Prisma v7 uses `import.meta.url` internally. When NestJS uses `tsc`, generated code is CJS and `import.meta` is unavailable, causing runtime crashes. SWC compiles to CJS while polyfilling `import.meta`, resolving the incompatibility. Configuration lives in `nest-cli.json` (`"builder": "swc"`) and `.swcrc`.

---

## 3. Project Layout

```
backend/
├── prisma/
│   ├── schema.prisma           # Single source of truth for the DB schema
│   └── migrations/             # Ordered, append-only SQL migration history
│       ├── 20260323105500_phase1_backend_foundation/
│       ├── 20260324000000_phase2_cues_refactor/
│       ├── 20260325000000_phase4a_reminder_execution/
│       ├── 20260325000001_phase4b_srbai_and_tapering/
│       ├── 20260411000000_phase5_measurable_habits/
│       ├── 20260412000000_phase6_drop_goaltag/
│       ├── 20260412000001_phase6_rename_trigger_unknown/
│       ├── 20260412151446_phase6_cleanup/
│       └── 20260412200000_phase7_trigger_source_non_null/
├── src/
│   ├── main.ts                 # Bootstrap: ValidationPipe, Swagger, CORS
│   ├── app.module.ts           # Root module — imports all feature modules
│   ├── auth/                   # JWT authentication
│   ├── habits/                 # Habit CRUD, SRBAI, tapering, cue management
│   ├── progress/               # Habit log creation, summary, difficulty feedback
│   ├── reminders/              # Reminder evaluation, delivery, action handling
│   ├── analytics/              # Internal activity logging
│   ├── domain/
│   │   ├── entities/           # TypeScript entity interfaces
│   │   ├── enums/              # Canonical enum definitions (domain.enums.ts)
│   │   ├── repositories/       # Repository interfaces + DI tokens
│   │   └── rules/              # Pure business logic functions
│   ├── infrastructure/
│   │   ├── prisma/             # PrismaService (singleton client)
│   │   └── persistence/        # Prisma implementations of repo interfaces
│   └── generated/prisma/       # Auto-generated Prisma client (inside sourceRoot for SWC)
├── prisma.config.ts            # Prisma config — points generator to src/generated/
├── nest-cli.json               # SWC builder config
├── tsconfig.json               # TS config — module: nodenext, ignoreDeprecations: 5.0
└── docs/                       # Architecture and phase documentation
```

---

## 4. Database & Migrations

### Data Models

#### `User`
Core identity record.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `email` | String (unique) | |
| `passwordHash` | String | bcrypt-hashed |
| `createdAt` | DateTime | |

#### `Habit`
A single measurable behaviour being formed.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `userId` | UUID FK | owner |
| `title` | String | |
| `description` | String? | |
| `measurementUnit` | String | e.g. "pages", "minutes" |
| `targetValue` | Float | goal value per session |
| `minimumTarget` | Float | minimum value that counts as DONE |
| `status` | Enum (`HabitLifecycleStatus`) | ACTIVE / PAUSED / ARCHIVED |
| `startDate` | DateTime | when habit tracking began |
| `reminderEnabled` | Boolean | default false |
| `archivedAt` | DateTime? | set when status→ARCHIVED |

Relations: `scheduleDays` → `HabitScheduleDay[]`, `cues` → `HabitCue[]`, `motivationProfile` → `HabitMotivationProfile?`, `logs` → `HabitLog[]`

#### `HabitScheduleDay`
Which weekdays a habit is active.

| Column | Type |
|--------|------|
| `habitId` | UUID FK |
| `weekday` | Enum (MONDAY…SUNDAY) |

#### `HabitCue`
Context triggers associated with a habit. Each cue defines **when** and **where** the habit should occur.

| Column | Type | Notes |
|--------|------|-------|
| `habitId` | UUID FK | |
| `startTime` | String? | HH:MM 24-hour — cue window start |
| `endTime` | String? | HH:MM 24-hour — cue window end |
| `coarseLocation` | String? | broad location, e.g. "home", "gym" |
| `precedingRoutine` | String? | routine just before, e.g. "after breakfast" |
| `isActive` | Boolean | soft enable/disable |

> **Migration note:** The Phase 1 schema had `time_window` (enum), `day_type` (enum), and `cue_day_type` enum — all removed in the Phase 2 migration (`20260324000000_phase2_cues_refactor`). The old `cueType`/`cueValue` string columns never existed in the Prisma schema; they were a documentation error. The current cue model is purely contextual metadata with no type tag.

#### `HabitMotivationProfile`
Why the user wants to build the habit.

| Column | Type | Notes |
|--------|------|-------|
| `habitId` | UUID FK (unique) | |
| `reason` | String? | Why the user wants this habit — free text |

#### `HabitLog`
One completion attempt per session.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `habitId` | UUID FK | |
| `completedAt` | DateTime | client-supplied date/time of completion |
| `loggedAt` | DateTime | server-assigned timestamp when record was created |
| `actualValue` | Float? | measured value (compared with `minimumTarget`) |
| `status` | Enum | **DONE** or **NOT_DONE** (server-derived — never client-set directly) |
| `triggerSource` | Enum | `SELF_INITIATED` / `REMINDER_TRIGGERED` / `UNKNOWN` — always stored; defaults to `UNKNOWN` when the client omits it |
| `sourceConfidence` | Float? | reserved for future confidence scoring |
| `completionHour` | Int? | 0–23, extracted from `completedAt`; context snapshot |
| `coarseLocation` | String? | "home", "gym", etc.; context snapshot |
| `precedingRoutine` | String? | routine immediately before; context snapshot |
| `linkedReminderId` | UUID FK? | links to the `Reminder` that prompted this log |

#### `Reminder`
A generated reminder record for one habit.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `habitId` / `userId` | UUID FKs | |
| `scheduledFor` | DateTime | when to deliver |
| `evaluatedAt` | DateTime | when the decision was made |
| `effectiveUntil` | DateTime? | `scheduledFor + cooldownMinutes`; dedup window end |
| `cooldownKey` | String? | `habitId:YYYY-MM-DDTHH` — hourly dedup bucket |
| `decisionReason` | Enum | why reminder was/wasn't created |
| `status` | Enum | PENDING / SENT / ACTED / EXPIRED / CANCELLED |
| `explanation` | JSON? | `{ isScheduledToday, activeCueCount }` |

#### `ReminderAction`
What the user did in response to a reminder.

| Column | Type | Notes |
|--------|------|-------|
| `reminderId` | UUID FK | |
| `userId` | UUID FK | |
| `actionType` | Enum | **`DONE`** or **`SNOOZE`** only — `DISMISS` does not exist |
| `actedAt` | DateTime | when the action was taken |
| `snoozedUntil` | DateTime? | computed from `snoozeMinutes`; used to schedule follow-up |
| `metadata` | JSON? | e.g. `{ snoozeFromReminderId }` |

#### `ReminderPolicy`
Current reminder support intensity for a habit.

| Column | Type |
|--------|------|
| `habitId` | UUID FK (unique) |
| `policyMode` | Enum | FULL_SUPPORT / MODERATE_SUPPORT / FADE_OUT / MINIMAL |
| `updatedAt` | DateTime |

#### `SrbaiAssessment`
Self-Report Behavioural Automaticity Index (SRBAI) measurement.

| Column | Type | Notes |
|--------|------|-------|
| `habitId` | UUID FK | |
| `item1`–`item4` | Int | Likert 1–7 scale items |
| `rawAverage` | Float | mean of 4 items |
| `normalizedScore100` | Float | `((rawAverage - 1) / 6) × 100` |
| `assessedAt` | DateTime | |

#### `DifficultyFeedback`
User's perceived difficulty after each log.

| Column | Type |
|--------|------|
| `habitLogId` | UUID FK |
| `rating` | Enum | VERY_EASY / EASY / MODERATE / HARD / VERY_HARD |

#### `Reflection`
Free-text reflection attached to a habit log.

| Column | Type |
|--------|------|
| `habitLogId` | UUID FK |
| `notes` | String |

#### `UserActivityLog`
Internal audit trail for analytics.

| Column | Type | Notes |
|--------|------|-------|
| `userId` | UUID FK | |
| `activityType` | String | e.g. "habit_created", "srbai_submitted" |
| `occurredAt` | DateTime | |

---

### Migration History

| # | Migration | What it does |
|---|-----------|-------------|
| 1 | `20260323105500_phase1_backend_foundation` | Creates all base tables: `users`, `habits`, `habit_schedule_days`, `habit_cues` (with old `time_window`/`day_type` columns), `habit_logs`, `habit_motivation_profiles` |
| 2 | `20260324000000_phase2_cues_refactor` | Drops `time_window`, `day_type`, `cue_day_type` enum; adds `start_time TEXT`, `end_time TEXT` to `habit_cues` |
| 3 | `20260325000000_phase4a_reminder_execution` | Adds `reminders`, `reminder_actions` tables; adds context snapshot columns to `habit_logs` (`completion_hour`, `coarse_location`, `preceding_routine`, `reminder_id`) |
| 4 | `20260325000001_phase4b_srbai_and_tapering` | Adds `srbai_assessments`, `difficulty_feedbacks`, `reflections`, `reminder_policies`, `user_activity_logs` tables |
| 5 | `20260411000000_phase5_measurable_habits` | Drops `tracking_type` enum/column, `allow_partial_completion`, `minimum_success_value`; adds `measurement_unit`, `target_value`, `minimum_target`; simplifies `habit_motivation_profiles` |
| 6 | `20260412000000_phase6_drop_goaltag` | Drops `goal_tag` column from `habit_motivation_profiles` |
| 7 | `20260412000001_phase6_rename_trigger_unknown` | Renames `MANUAL_ENTRY` → `UNKNOWN` in `completion_trigger_source` enum |
| 8 | `20260412151446_phase6_cleanup` | Prisma-auto-generated: resolved pre-existing schema drift (context snapshot columns on `habit_logs`, `difficulty_feedbacks`/`reflections` tables, FK constraints, index rename) |
| 9 | `20260412200000_phase7_trigger_source_non_null` | Back-fills any NULL `trigger_source` rows to `UNKNOWN`; adds `NOT NULL` + `DEFAULT 'UNKNOWN'` to the column |

---

## 5. Domain Layer

The domain layer (`src/domain/`) contains zero NestJS decorators and zero database access. It is the heart of the business logic.

### 5.1 Enums (`src/domain/enums/domain.enums.ts`)

| Enum | Values | Notes |
|------|--------|-------|
| `HabitLogStatus` | `DONE`, `NOT_DONE` | |
| `HabitLifecycleStatus` | `ACTIVE`, `PAUSED`, `ARCHIVED` | |
| `CompletionTriggerSource` | `SELF_INITIATED`, `REMINDER_TRIGGERED`, `UNKNOWN` | `UNKNOWN` = trigger source not determined (no reminder linked, no explicit self-initiation) |
| `Weekday` | `MONDAY`…`SUNDAY` | |
| `ReminderStatus` | `PENDING`, `SENT`, `ACTED`, `EXPIRED`, `CANCELLED` | |
| `ReminderDecisionReason` | `REMINDER_DISABLED`, `NOT_SCHEDULED_TODAY`, `NO_ACTIVE_CUES`, `SHOULD_REMIND` | Note: value is `SHOULD_REMIND`, not `REMIND` |
| `ReminderActionType` | `DONE`, `SNOOZE` | `DISMISS` does **not** exist in code |
| `ReminderPolicyMode` | `FULL_SUPPORT`, `MODERATE_SUPPORT`, `FADE_OUT`, `MINIMAL` | |
| `DifficultyRating` | `VERY_EASY`, `EASY`, `MODERATE`, `HARD`, `VERY_HARD` | |

### 5.2 Repository Interfaces (`src/domain/repositories/`)

Each interface defines only what the application services need. Prisma implementations satisfy these interfaces from inside `src/infrastructure/persistence/`.

| Interface | Key methods |
|-----------|-------------|
| `IUserRepository` | `findByEmail`, `findById`, `create` |
| `IHabitRepository` | `create`, `findById`, `findByUserId`, `update`, `findTodayHabits` |
| `IHabitLogRepository` | `create`, `findByHabitId`, `findSummaryByHabitId`, `findContextSnapshotsByHabitId` |
| `IReminderRepository` | `create`, `findById`, `findByIdAndUserId`, `findAllByUserId`, `update`, `findActiveByCooldownKey` |
| `IReminderActionRepository` | `create`, `findByReminderId` |
| `IReminderPolicyRepository` | `upsert`, `findByHabitId` |
| `ISrbaiAssessmentRepository` | `create`, `findLatestByHabitId`, `findAllByHabitId` |
| `IDifficultyFeedbackRepository` | `create`, `findByLogId` |
| `IReflectionRepository` | `create`, `findByLogId` |
| `IUserActivityLogRepository` | `create`, `findAllByUserId` |

### 5.3 Business Rules

#### `HabitStrengthRules` (`src/domain/rules/habit-strength.rules.ts`)

Pure computations that quantify how automatic a habit has become.

**`scoreSrbai(input: SrbaiScoreInput): SrbaiScoreResult`**
- Accepts 4 Likert items (1–7).
- `rawAverage = mean(item1…item4)`
- `normalizedScore100 = ((rawAverage - 1) / 6) × 100`

**`compute(input: HabitStrengthInput): HabitStrengthResult`**

Uses log history to derive:
| Signal | Formula |
|--------|---------|
| `doneRate` | `doneCount / totalLogs` |
| `selfInitiatedRate` | `selfInitiatedDoneCount / doneCount` |
| `stage` | `insufficient_data` (<7 logs) → `early_stage` → `building` → `established` |

**`computeComposite(input: CompositeScoreInput): CompositeScoreResult`**

Combines three signals into one score (0–100):

```
finalScore = 0.60 × srbaiScore
           + 0.25 × consistencyScore    (doneRate × 100)
           + 0.15 × contextStabilityScore
```

Stage thresholds:
- 0–39: `weak`
- 40–69: `building`
- 70–100: `strong`

`contextStabilityScore` is derived from the consistency of `completionHour`, `coarseLocation`, and `precedingRoutine` snapshots across the last 20 logs — high variance = low stability.

---

#### `AdaptationRules` (`src/domain/rules/adaptation.rules.ts`)

Stateless recommendation engine for what support type the user needs next.

**`recommend(input): AdaptationRecommendation`**

Inputs: composite score, difficulty rating, doneRate, selfInitiatedRate, totalDone.

Outputs a `focusType`:

| Focus | When |
|-------|------|
| `reduce_reminders` | Score ≥ 70 and selfInitiatedRate ≥ 0.7 |
| `celebrate_consistency` | Milestone (7 / 21 / 66 completions) |
| `review_difficulty` | Difficulty ≥ HARD and doneRate < 0.5 |
| `increase_support` | Score < 40 and doneRate < 0.4 |
| `maintain` | Default (steady progress) |

Milestones 7, 21, and 66 correspond to the thesis literature on habit formation stages.

---

#### `ReminderDecisionRules` (`src/domain/rules/reminder-decision.rules.ts`)

Pure eligibility check for whether a reminder should be created.

**`decide(input): ReminderDecisionResult`**

Checks in order:
1. If `habit.reminderEnabled === false` → `reason: REMINDER_DISABLED`
2. If habit is not scheduled today (`CueScheduleRules.isScheduledToday`) → `reason: NOT_SCHEDULED_TODAY`
3. If no active cues exist → `reason: NO_ACTIVE_CUES`
4. Otherwise → `shouldRemind: true, reason: SHOULD_REMIND`

Returns: `{ shouldRemind, reason, isScheduledToday, activeCueCount, evaluatedAt }`

---

#### `CueScheduleRules` (`src/domain/rules/cue-schedule.rules.ts`)

- **`isScheduledToday(scheduleDays, today)`** — checks if the given weekday is in the habit's schedule.
- **`getActiveCues(cues)`** — filters `cues.filter(c => c.isActive)`.

---

## 6. Application Modules

All routes (except `POST /auth/*`) are protected by `JwtAuthGuard`. The bearer token is obtained from `POST /auth/login`.

### 6.1 Auth Module (`src/auth/`)

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Create account; returns `{ userId, email }` |
| `POST` | `/auth/login` | Validate credentials; returns `{ accessToken }` |

**Implementation notes:**
- Passwords are hashed with `bcrypt` (salt rounds: 10).
- The JWT payload contains `{ sub: userId, email }`.
- `JwtStrategy` validates the token and attaches the payload to `req.user`.
- All habit/progress/reminder endpoints call `getOwnedHabitOrThrow(userId, habitId)` to enforce ownership — a user cannot access another user's habits even with a valid token.

---

### 6.2 Habits Module (`src/habits/`)

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/:userId/habits` | Create a new habit |
| `GET` | `/users/:userId/habits` | List all habits for a user |
| `GET` | `/users/:userId/habits/today` | List habits scheduled for today (with cue context) |
| `GET` | `/users/:userId/habits/:habitId` | Get single habit detail |
| `PATCH` | `/users/:userId/habits/:habitId` | Update habit fields / schedule / cues |
| `GET` | `/users/:userId/habits/:habitId/reminder-decision` | Evaluate reminder eligibility (dry run, no DB write) |

**`POST /users/:userId/habits` — CreateHabitDto fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string (max 120) | ✓ | |
| `description` | string (max 500) | | |
| `measurementUnit` | string (max 40) | ✓ | e.g. "minutes", "pages", "km" |
| `targetValue` | number | ✓ | Goal value per session |
| `minimumTarget` | number | ✓ | Minimum value that counts as DONE; must be ≤ targetValue |
| `startDate` | string (ISO date) | ✓ | |
| `status` | `HabitLifecycleStatus` | | Defaults to `ACTIVE` |
| `reminderEnabled` | boolean | | Defaults to `false` |
| `scheduleDays` | `CreateHabitScheduleDayDto[]` | | Weekday schedule; omit for daily |
| `cues` | `CreateHabitCueDto[]` | | Contextual triggers |
| `motivationProfile` | `CreateHabitMotivationProfileDto` | | |

> **Sentence-preview model:** The frontend assembles the full sentence "`[Cue]-ийн дараа би [action + target] хийнэ. Яагаад гэвэл: [reason]`" entirely client-side. The backend never stores this sentence as a string. It stores the underlying structured fields: `title` + `measurementUnit` + `targetValue` + `minimumTarget` (action + target), the `HabitCue` fields — `precedingRoutine`, `startTime`, `endTime`, `coarseLocation` (cue), and `HabitMotivationProfile.reason` (the why). This is for thesis data integrity: each field can be analysed independently.

**Business validation (in `HabitsService.validateHabitConfiguration`):**
- `minimumTarget` must be ≤ `targetValue` — otherwise `BadRequestException`
- Duplicate weekdays in `scheduleDays` are rejected

**`GET /today` response** includes full habit + schedule + cues (to power the frontend daily view with contextual prompts).

**`GET /reminder-decision`** calls `ReminderDecisionRules.decide()` with no side effects and returns `{ shouldRemind, decisionReason, isScheduledToday, activeCueCount, evaluatedAt }`. Useful for the frontend to know whether a reminder badge should be shown.

---

### 6.3 SRBAI & Habit Strength (`src/habits/srbai.controller.ts` + `srbai.service.ts`)

**Routes** (all under `/users/:userId/habits/:habitId`):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/srbai-assessments` | Submit a 4-item SRBAI; server computes scores |
| `GET` | `/srbai-assessments/latest` | Most recent SRBAI record |
| `GET` | `/srbai-assessments` | Full SRBAI history |
| `GET` | `/habit-strength/composite` | Compute composite strength score (0–100) |
| `POST` | `/reminder-policy/apply-tapering` | Derive + persist ReminderPolicy from current score |
| `GET` | `/reminder-policy` | Current reminder policy for the habit |

**SRBAI scoring** (server-side, never trust client-sent scores):
```
rawAverage       = mean(item1, item2, item3, item4)
normalizedScore100 = ((rawAverage - 1) / 6) × 100
```

**Tapering policy derivation** (from composite finalScore):

| finalScore | ReminderPolicyMode |
|------------|-------------------|
| ≥ 70 | `MINIMAL` (habit is established) |
| 40–69 | `FADE_OUT` (gradual reduction) |
| 20–39 | `MODERATE_SUPPORT` |
| < 20 | `FULL_SUPPORT` |

The `apply-tapering` endpoint upserts the `ReminderPolicy` record and returns composite result + tapering recommendation + stored policy in one response.

---

### 6.4 Progress Module (`src/progress/`)

**Routes** (all under `/users/:userId/habits/:habitId`):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/logs` | Create a habit log (actualValue → DONE/NOT_DONE derived server-side) |
| `GET` | `/logs` | All logs for a habit |
| `GET` | `/logs/summary` | Aggregated statistics |
| `POST` | `/logs/:logId/difficulty` | Attach a difficulty rating to a log |
| `POST` | `/logs/:logId/reflection` | Attach a free-text reflection to a log |

**`POST /logs` — CreateHabitLogDto fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `actualValue` | number | ✓ | The measured value for this session |
| `completedAt` | string (ISO 8601) | ✓ | Date/time of the completion attempt |
| `triggerSource` | `CompletionTriggerSource` | | `SELF_INITIATED` / `REMINDER_TRIGGERED` / `UNKNOWN` |
| `linkedReminderId` | string (UUID) | | Required when `triggerSource` is `REMINDER_TRIGGERED` |
| `completionHour` | number (0–23) | | Context snapshot — defaults to hour from `completedAt` |
| `coarseLocation` | string | | Context snapshot |
| `precedingRoutine` | string | | Context snapshot |

**Server-side DONE/NOT_DONE derivation:**
```typescript
status = actualValue >= habit.minimumTarget ? 'DONE' : 'NOT_DONE'
```

The client never sends `status` — it is always derived, ensuring data integrity.

**`GET /logs/summary` response:**
```json
{
  "habitId": "...",
  "totalLogs": 30,
  "doneLogs": 22,
  "notDoneLogs": 8,
  "doneRate": 0.73,
  "selfInitiatedCount": 15,
  "reminderTriggeredCount": 7,
  "selfInitiatedRate": 0.68,
  "reminderDependenceRate": 0.32,
  "completionWithoutReminderRate": 0.45
}
```

`completionWithoutReminderRate = DONE logs with no reminderId / totalLogs` — key metric for measuring habit autonomy progression in the thesis.

---

### 6.5 Reminders Module (`src/reminders/`)

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/:userId/habits/:habitId/reminders/evaluate-and-create` | Run ReminderDecisionRules; create Reminder if eligible |
| `GET` | `/users/:userId/reminders` | All reminders for a user |
| `GET` | `/users/:userId/reminders/:reminderId` | Single reminder detail |
| `POST` | `/users/:userId/reminders/:reminderId/actions` | Submit a user action (`DONE` or `SNOOZE`) |

**`evaluate-and-create` flow:**

1. `ReminderDecisionRules.decide()` is called (pure function — no I/O).
2. If `shouldRemind === false`, returns the decision reason without persisting anything.
3. Computes a **cooldown key**: `habitId:YYYY-MM-DDTHH` (hourly bucket) and queries for any `PENDING`/`SENT` reminder with the same key whose `effectiveUntil` is still in the future.
4. If a live dedup match exists, throws `ConflictException` — one reminder per hourly window.
5. Otherwise creates a new `Reminder` record (`PENDING`), calls the notification gateway to mark it `SENT`, and returns the result.

> **`effectiveUntil`** is set to `scheduledFor + cooldownMinutes` where `cooldownMinutes` comes from the habit's `ReminderPolicy` (default: 60 min). This allows multiple reminder windows per day (e.g. morning cue + evening cue) without cross-window duplicates.

**Action handling in `RemindersService`:**

- **DONE**: Marks reminder `ACTED`. Idempotently creates a `HabitLog` with `triggerSource: REMINDER_TRIGGERED` and `linkedReminderId` set. Throws `ConflictException` if a DONE action already exists for this reminder.
- **SNOOZE**: Records the action with `snoozedUntil = actedAt + snoozeMinutes` (default 30). Creates a follow-up `Reminder` starting at `snoozedUntil`.

> **`DISMISS` does not exist.** The only valid actions are `DONE` and `SNOOZE`. Sending any other `actionType` returns `BadRequestException`.

---

### 6.6 Action Audit Logs (`src/analytics/`)

Provides an internal action audit trail for thesis evaluation. Records key behavioural events — habit creation, progress logging, SRBAI submissions, reminder interactions — to support thesis metrics (habit autonomy progression, reminder dependence rates, SRBAI frequency).

> **Positioning note:** This module is an **action-level audit trail**, not a session-level analytics system. Events correspond to discrete user actions, not app sessions. Session-level events (`app_open`, `session_start`) are outside scope for the thesis evaluation and are not implemented.

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/:userId/activity-logs` | Record an activity event |
| `GET` | `/users/:userId/activity-logs` | List all activity events for a user |

**Internal use:** All application services call `AnalyticsService.recordActivity(userId, activityType)` after important state changes. The `activityType` field is a free string with no DB-level enum enforcement. Currently recorded events:

| Event string | Recorded by |
|---|---|
| `habit_created` | `HabitsService.createHabit` |
| `habit_updated` | `HabitsService.updateHabit` |
| `habit_logged` | `ProgressService.createHabitLog` |
| `reminder_sent` | `ReminderExecutionService.evaluateAndCreate` |
| `reminder_done` | `RemindersService.handleDone` |
| `reminder_snooze` | `RemindersService.handleSnooze` |
| `srbai_submitted` | `SrbaiService.submitAssessment` |

> All events use underscore-separated naming convention.

---

## 7. Infrastructure Layer

### `PrismaService` (`src/infrastructure/prisma/prisma.service.ts`)

Singleton NestJS service wrapping `PrismaClient`. Handles connection lifecycle and is injected into all repository implementations.

**Connection format:** `prisma+postgres://localhost:5432` via the `@prisma/adapter-pg` driver adapter. The Prisma Dev Proxy (`npx prisma dev`) must be running before starting the backend.

### Repository Implementations (`src/infrastructure/persistence/`)

Each file implements one domain repository interface using Prisma. Example pattern:

```typescript
@Injectable()
export class PrismaHabitRepository implements IHabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Habit | null> {
    return this.prisma.habit.findUnique({ where: { id }, include: { ... } });
  }
  // ...
}
```

Implementations are registered in each feature module's `providers` array with the repository injection token:

```typescript
{ provide: HABIT_REPOSITORY, useClass: PrismaHabitRepository }
```

---

## 8. Testing

### Test Setup

- Runner: **Jest 30**
- TypeScript transpiler: **ts-jest 29**
- Config: `jest` block in `package.json`; tsconfig must have `"ignoreDeprecations": "5.0"` (TS 5.9 compatibility)

### Test Suites (52 tests, 8 suites — all passing)

| File | Tests | Covers |
|------|-------|--------|
| `app.controller.spec.ts` | 1 | Root health check |
| `dto-validation.spec.ts` | 7 | DTO field validation with class-validator |
| `auth/auth.service.spec.ts` | 8 | Register, login, JWT issuance, bcrypt |
| `habits/habits.service.spec.ts` | 12 | CRUD, ownership guard, validation |
| `progress/progress.service.spec.ts` | 3 | DONE/NOT_DONE derivation, summary rates |
| `reminders/reminders.service.spec.ts` | ~8 | evaluate-and-create, actions |
| `domain/rules/*.spec.ts` | ~10 | Pure rule functions (no mocking needed) |
| `analytics/analytics.service.spec.ts` | ~3 | Activity logging |

### Running Tests

```bash
cd backend

# Run all tests once
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

---

## 9. Development Guide

### Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 15 running locally
- Prisma CLI: `npm i -g prisma` (or use `npx prisma`)

### First-time setup

```bash
cd backend
npm install

# Apply all migrations to the database
npx prisma migrate dev

# Start the Prisma dev proxy (required for the pg adapter)
npx prisma dev
```

### Starting the server

```bash
# In terminal 1: Prisma dev proxy
npx prisma dev

# In terminal 2: NestJS dev server
npm run start:dev
```

Server listens on `http://localhost:3000`.  
Swagger UI: `http://localhost:3000/api`

### Environment variables

| Variable | Default | Notes |
|----------|---------|-------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret for signing JWT tokens |
| `PORT` | `3000` | HTTP port |

### Building for production

```bash
npm run build       # SWC compiles to dist/
npm run start:prod  # node dist/main
```

### Database workflow

```bash
# Apply pending migrations
npx prisma migrate dev

# Check migration status
npx prisma migrate status

# Reset database and re-apply all migrations (destroys all data)
npx prisma migrate reset --force

# Open Prisma Studio (GUI browser for the DB)
npx prisma studio
```

### Adding a new feature

1. Add/modify models in `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration_name>` to generate the SQL migration.
3. Add the entity interface to `src/domain/entities/`.
4. Add the repository interface + DI token to `src/domain/repositories/`.
5. Implement the repository in `src/infrastructure/persistence/`.
6. Write the application service in the relevant feature module.
7. Write the controller.
8. Register everything in the feature module's `@Module()` decorator.
9. Import the feature module in `app.module.ts`.

---

## Appendix: API Quick Reference

```
POST   /auth/register
POST   /auth/login

POST   /users/:userId/habits
GET    /users/:userId/habits
GET    /users/:userId/habits/today
GET    /users/:userId/habits/:habitId
PATCH  /users/:userId/habits/:habitId
GET    /users/:userId/habits/:habitId/reminder-decision

POST   /users/:userId/habits/:habitId/srbai-assessments
GET    /users/:userId/habits/:habitId/srbai-assessments/latest
GET    /users/:userId/habits/:habitId/srbai-assessments
GET    /users/:userId/habits/:habitId/habit-strength/composite
POST   /users/:userId/habits/:habitId/reminder-policy/apply-tapering
GET    /users/:userId/habits/:habitId/reminder-policy

POST   /users/:userId/habits/:habitId/logs
GET    /users/:userId/habits/:habitId/logs
GET    /users/:userId/habits/:habitId/logs/summary
POST   /users/:userId/habits/:habitId/logs/:logId/difficulty
POST   /users/:userId/habits/:habitId/logs/:logId/reflection

POST   /users/:userId/habits/:habitId/reminders/evaluate-and-create
GET    /users/:userId/reminders
GET    /users/:userId/reminders/:reminderId
POST   /users/:userId/reminders/:reminderId/actions

POST   /users/:userId/activity-logs
GET    /users/:userId/activity-logs
```
