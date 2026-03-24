# Phase 1 Backend Foundation

Энэ баримт нь `Behavior-Based Habit Formation System` төслийн `backend` дотор Phase 1 хүрээнд яг ямар backend foundation хэрэгжүүлснийг тайлбарлана.

## 1. Phase 1-ийн зорилго

Энэ phase-д зөвхөн MVP backend foundation хийгдсэн. Өөрөөр хэлбэл:

- NestJS v11 + Prisma v7 + PostgreSQL суурь интеграци
- SWC compiler ашигласан build pipeline (`nest-cli.json` дотор `"builder": "swc"`)
- thesis-тэй нийцсэн modular backend бүтэц
- MVP domain schema (7 model, 6 enum)
- бүрэн REST API endpoint-ууд (4 module → 11 route)
- global ValidationPipe + class-validator DTO validation
- unit test болон e2e test-ийн суурь

Энэ phase-д дараах зүйлсийг зориуд оруулаагүй:

- full auth flow (register/login)
- JWT guard/strategy
- reminder scheduling engine
- notification delivery
- reward engine
- adaptive reminder / adaptive reinforcement logic

## 2. Технологийн stack

| Технологи | Хувилбар | Зориулалт |
|---|---|---|
| NestJS | ^11.0.1 | Backend framework |
| Prisma | ^7.5.0 | ORM + migration |
| PostgreSQL | — | Database (`@prisma/adapter-pg`, `pg ^8.20.0`) |
| TypeScript | ^5.7.3 | Language |
| SWC | ^1.15.21 | Compiler (`import.meta.url` issue workaround) |
| class-validator | ^0.14.1 | DTO validation |
| class-transformer | ^0.5.1 | Payload transform |
| Jest | ^30.0.0 | Unit & e2e testing |
| @nestjs/swagger | ^11.2.6 | API documentation (installed, not configured) |
| bcrypt | ^6.0.0 | Password hashing (future auth) |
| @nestjs/jwt + passport-jwt | ^11.0.2 / ^4.0.1 | JWT auth (future) |

### SWC compiler сонголтын шалтгаан

Prisma v7 TypeScript generator Node.js v22.12+ дотор ESM detection хийснээс болж `import.meta.url` -ийг CJS environment-д ашиглахад алдаа гардаг. Энэ асуудлыг `nest-cli.json` дотор `"builder": "swc"` тохируулж, SWC-ийн CJS transform ашигласнаар шийдсэн.

## 3. Архитектурын mapping

Phase 1-д practical module structure ашигласан боловч thesis architecture-ийн mapping-ийг кодын түвшинд тодорхой үлдээсэн.

### `auth`

Foundation-only module.

Хариуцлага:

- `ensureUserExists(userId)` — user оршин байгааг шалгах, `NotFoundException` throw
- future auth/access ownership support

Phase 1-д register/login flow хийгдээгүй.

### `habits`

Thesis mapping: habit management, cue/schedule subdomain, motivation profile subdomain

Хэрэгжүүлэгдсэн зүйлс:

- habit CRUD (`createHabit`, `listHabits`, `getOwnedHabitOrThrow`, `updateHabit`)
- `HabitScheduleDay` — weekday давтамж
- `HabitCue` — context cue
- `HabitMotivationProfile` — motivation мэдээлэл
- `ReminderDecisionContext` — reminder-ready foundation interface (`foundation/reminder-decision/`)

Module dependencies: `PrismaModule`, `AuthModule`, `AnalyticsModule`  
Exports: `HabitsService`

### `progress`

Thesis mapping: completion logging, progress summary, future habit-strength input signals

Хэрэгжүүлэгдсэн зүйлс:

- `HabitLog` — `createHabitLog`, `listHabitLogs`
- `getProgressSummary` — aggregation (totalLogs, doneCount, partialCount, notDoneCount, lastLoggedAt, completionByTriggerSource)
- `HabitStrengthSignalSnapshot` / `HabitStrengthInputSignal` — foundation interface (`foundation/habit-strength/`)
- `FeedbackReinforcementContext` — reward engine foundation interface (`foundation/feedback-reinforcement/`)
- `ProgressSummary` interface + `progressStatusCountKeyMap` helper (`interfaces/`)

Module dependencies: `PrismaModule`, `HabitsModule`, `AnalyticsModule`

### `analytics`

Thesis mapping: user activity logging, usage/engagement events

Хэрэгжүүлэгдсэн зүйлс:

- `createUserActivityLog`, `listUserActivityLogs` — external API
- `recordActivity(userId, activityType, occurredAt?)` — internal helper (бусад service дуудна)
- `activity-log/` болон `engagement-events/` — future extension directory

Module dependencies: `PrismaModule`, `AuthModule`  
Exports: `AnalyticsService`

### `prisma`

- `PrismaService` — `@Global()` module, бүх module-д inject болно

### `common`

- `src/common/enums/domain.enums.ts` — domain-wide shared enum-ууд

## 4. Global setup (`main.ts`)

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,               // DTO-д байхгүй property-г хасна
  transform: true,               // payload-ийг DTO instance болгон хувиргана
  forbidNonWhitelisted: true,    // тодорхойгүй property дээр алдаа throw
  transformOptions: {
    enableImplicitConversion: true  // type автомат conversion
  }
}));
```

Port: `process.env.PORT` (default: `3000`)

## 5. Prisma schema — model болон field-үүд

### `User`

| Field | Type | Тайлбар |
|---|---|---|
| id | UUID | PK |
| email | String | unique |
| passwordHash | String | bcrypt-ready |
| displayName | String? | — |
| createdAt | DateTime | — |
| updatedAt | DateTime | — |

Relations: `habits[]`, `activityLogs[]`

### `Habit`

| Field | Type | Тайлбар |
|---|---|---|
| id | UUID | PK |
| userId | String | FK → User |
| title | String | — |
| description | String? | — |
| trackingType | HabitTrackingType | SIMPLE_CHECKIN \| QUANTITATIVE |
| allowPartialCompletion | Boolean | default false |
| measurementUnit | String? | QUANTITATIVE үед |
| targetValue | Float? | QUANTITATIVE үед |
| minimumSuccessValue | Float? | QUANTITATIVE үед |
| startDate | DateTime | — |
| status | HabitLifecycleStatus | ACTIVE \| PAUSED \| ARCHIVED |
| reminderEnabled | Boolean | default false |
| archivedAt | DateTime? | — |
| createdAt | DateTime | — |
| updatedAt | DateTime | — |

Relations: `scheduleDays[]`, `cues[]`, `motivationProfile?`, `logs[]`  
Indexes: `userId`, `status`

### `HabitScheduleDay`

| Field | Тайлбар |
|---|---|
| id | PK |
| habitId | FK → Habit |
| weekday | Weekday enum |
| createdAt | — |

Unique constraint: `habitId + weekday`

### `HabitCue`

| Field | Тайлбар |
|---|---|
| id | PK |
| habitId | FK → Habit |
| timeWindow | String? |
| dayType | CueDayType |
| coarseLocation | String? |
| precedingRoutine | String? |
| isActive | Boolean |
| createdAt / updatedAt | — |

### `HabitMotivationProfile`

| Field | Тайлбар |
|---|---|
| id | PK |
| habitId | unique FK → Habit |
| goalTag | String? |
| personalReason | String? |
| identityStatement | String? |
| createdAt / updatedAt | — |

### `HabitLog`

| Field | Тайлбар |
|---|---|
| id | PK |
| habitId | FK → Habit |
| status | HabitLogStatus |
| actualValue | Float? |
| completedAt | DateTime |
| loggedAt | DateTime |
| triggerSource | CompletionTriggerSource |

Indexes: `habitId+completedAt`, `habitId+loggedAt`, `triggerSource`

### `UserActivityLog`

| Field | Тайлбар |
|---|---|
| id | PK |
| userId | FK → User |
| activityType | String |
| occurredAt | DateTime |

Index: `userId+occurredAt`

## 6. Enum-ууд

| Enum | Values |
|---|---|
| `HabitTrackingType` | `SIMPLE_CHECKIN`, `QUANTITATIVE` |
| `HabitLogStatus` | `DONE`, `PARTIAL`, `NOT_DONE` |
| `HabitLifecycleStatus` | `ACTIVE`, `PAUSED`, `ARCHIVED` |
| `CompletionTriggerSource` | `SELF_INITIATED`, `REMINDER_TRIGGERED`, `MANUAL_ENTRY` |
| `Weekday` | `MONDAY` – `SUNDAY` |
| `CueDayType` | `ANY`, `WEEKDAY`, `WEEKEND` |

## 7. API endpoint-ууд

### Habit API — `users/:userId/habits`

| Method | Route | Controller method | Тайлбар |
|---|---|---|---|
| POST | `/` | `createHabit()` | Habit үүсгэх |
| GET | `/` | `listHabits()` | Habit жагсаалт (archived filter боломжтой) |
| GET | `/:habitId` | `getHabitById()` | Нэг habit авах |
| PATCH | `/:habitId` | `updateHabit()` | Habit шинэчлэх |

### Progress API — `users/:userId/habits/:habitId`

| Method | Route | Controller method | Тайлбар |
|---|---|---|---|
| POST | `/logs` | `createHabitLog()` | Completion log нэмэх |
| GET | `/logs` | `listHabitLogs()` | Log жагсаалт авах |
| GET | `/progress-summary` | `getProgressSummary()` | Aggregated summary |

### Analytics API — `users/:userId/activity-logs`

| Method | Route | Controller method | Тайлбар |
|---|---|---|---|
| POST | `/` | `createUserActivityLog()` | Activity бичих |
| GET | `/` | `listUserActivityLogs()` | Activity жагсаалт |

### Health API

| Method | Route | Тайлбар |
|---|---|---|
| GET | `/` | Server health check |

## 8. Бизнес дүрэм

### SIMPLE_CHECKIN

- Client `status`-ийг шууд илгээнэ
- `allowPartialCompletion = false` → зөвхөн `DONE` эсвэл `NOT_DONE`
- `allowPartialCompletion = true` → `DONE`, `PARTIAL`, `NOT_DONE` бүгд хүлээн авна

### QUANTITATIVE

- Client зөвхөн `actualValue` илгээнэ — backend автоматаар status тооцно:
  - `actualValue >= targetValue` → `DONE`
  - `actualValue >= minimumSuccessValue` ба `< targetValue` → `PARTIAL`
  - `actualValue < minimumSuccessValue` → `NOT_DONE`

### Trigger source tracking

`HabitLog.triggerSource` хадгалж байгаа тул дараагийн phase-д reminder dependence analysis, self-initiated vs reminder-triggered completion харьцуулалт хийх боломжтой foundation бүрдсэн.

### ProgressSummary aggregation

`getProgressSummary()` дараах утгуудыг буцаана:

```typescript
interface ProgressSummary {
  totalLogs: number;
  doneCount: number;
  partialCount: number;
  notDoneCount: number;
  lastLoggedAt: Date | null;
  lastCompletedAt: Date | null;
  completionByTriggerSource: Record<CompletionTriggerSource, number>;
}
```

## 9. Foundation interface-ууд (future extensibility)

### `ReminderDecisionContext` (`habits/foundation/reminder-decision/`)

```typescript
interface ReminderDecisionContext {
  habitId: string;
  reminderEnabled: boolean;
  cues: Array<{
    timeWindow?: string;
    dayType: CueDayType;
    coarseLocation?: string;
    precedingRoutine?: string;
    isActive: boolean;
  }>;
}
```

Phase 1 дотор reminder scheduling/delivery хийгдээгүй — зөвхөн input contract тодорхойлсон.

### `HabitStrengthSignalSnapshot` / `HabitStrengthInputSignal` (`progress/foundation/habit-strength/`)

```typescript
interface HabitStrengthSignalSnapshot {
  totalLogs: number;
  completionByTriggerSource: Record<string, number>;
  hasCueConfiguration: boolean;
  scheduledWeekdayCount: number;
}

interface HabitStrengthInputSignal {
  triggerSource: CompletionTriggerSource;
  completedAt: Date;
}
```

Phase 1 дотор raw signal хадгалдаг — automaticity score тооцохгүй.

### `FeedbackReinforcementContext` (`progress/foundation/feedback-reinforcement/`)

```typescript
interface FeedbackReinforcementContext {
  userId: string;
  habitId: string;
  status: HabitLogStatus;
  triggerSource: CompletionTriggerSource;
  completedAt: Date;
}
```

Phase 1 дотор reward engine хийгдээгүй — зөвхөн future contract.

## 10. Validation ба test

### Test coverage

| Файл | Test case |
|---|---|
| `habits.service.spec.ts` | QUANTITATIVE habit-д measurement field байхгүй бол reject |
| | `minimumSuccessValue > targetValue` бол reject |
| `progress.service.spec.ts` | SIMPLE_CHECKIN + `allowPartialCompletion=false` → PARTIAL reject |
| | SIMPLE_CHECKIN + `allowPartialCompletion=true` → PARTIAL accept |
| | QUANTITATIVE: `actualValue >= targetValue` → DONE |
| | QUANTITATIVE: `minimumSuccessValue <= actualValue < targetValue` → PARTIAL |
| | QUANTITATIVE: `actualValue < minimumSuccessValue` → NOT_DONE |
| | ProgressSummary aggregation бүрэн тооцогдох |
| `dto-validation.spec.ts` | Habit DTO: хоосон title, invalid trackingType, invalid date, invalid weekday |
| | HabitLog DTO: invalid date, invalid triggerSource |
| | ActivityLog DTO: хоосон activityType, invalid date |
| `app.e2e-spec.ts` | `GET /` health check |
| | `GET /users/:userId/habits` e2e route |

### Ажилласан verification command-ууд

```bash
npm run build
npm run test -- --runInBand
npm run test:e2e -- --runInBand
npx prisma validate
npx prisma generate
```

## 11. Migration-ийн төлөв

### Амжилттай болсон зүйл

- Prisma schema valid болсон
- Prisma client (`src/generated/prisma/`) generate болсон
- Initial migration SQL файл үүссэн:

```
prisma/migrations/20260323105500_phase1_backend_foundation/migration.sql
```

### Database development workflow

```bash
# 1. Prisma local DB эхлүүлэх (background-д байлгах)
npx prisma dev

# 2. Backend эхлүүлэх
npm run start:dev
```

- `prisma dev` нь PostgreSQL-ийг port `51214`-д, proxy-г `5432`-д эхлүүлдэг
- `DATABASE_URL` format: `prisma+postgres://localhost:5432/?api_key=...`
- `npx prisma dev` ажиллаагүй үед backend database connection хийж чадахгүй

## 12. Үндсэн өөрчлөгдсөн файлууд

```
prisma/
  schema.prisma
  migrations/20260323105500_phase1_backend_foundation/migration.sql

src/
  main.ts
  app.module.ts
  prisma/prisma.module.ts
  prisma/prisma.service.ts
  auth/auth.module.ts
  auth/auth.service.ts
  habits/habits.module.ts
  habits/habits.controller.ts
  habits/habits.service.ts
  habits/habits.service.spec.ts
  habits/dto/create-habit.dto.ts
  habits/dto/update-habit.dto.ts
  habits/dto/habit-query.dto.ts
  habits/cues/dto/create-habit-cue.dto.ts
  habits/motivation/dto/create-habit-motivation-profile.dto.ts
  habits/schedule/dto/create-habit-schedule-day.dto.ts
  habits/foundation/reminder-decision/reminder-decision.types.ts
  progress/progress.module.ts
  progress/progress.controller.ts
  progress/progress.service.ts
  progress/progress.service.spec.ts
  progress/dto/create-habit-log.dto.ts
  progress/interfaces/progress-summary.interface.ts
  progress/foundation/habit-strength/habit-strength.types.ts
  progress/foundation/feedback-reinforcement/feedback-reinforcement.types.ts
  analytics/analytics.module.ts
  analytics/analytics.controller.ts
  analytics/analytics.service.ts
  analytics/dto/create-user-activity-log.dto.ts
  common/enums/domain.enums.ts
  generated/prisma/  (Prisma generated client)

test/
  app.e2e-spec.ts

src/
  dto-validation.spec.ts

nest-cli.json  (SWC builder)
```

## 13. Дараагийн phase-д үлдсэн ажил

Phase 2 ба түүнээс хойш хийх боломжтой зүйлс:

- User registration/login endpoint (`POST /auth/register`, `POST /auth/login`)
- JWT authorization guard + strategy
- Habit ownership enforcement via JWT (userId from token)
- Reminder decision service implementation (`ReminderDecisionContext` ашиглан)
- Notification delivery flow
- Habit-strength score computation (`HabitStrengthSignalSnapshot` → automaticity score)
- Reinforcement/reward behavior logic (`FeedbackReinforcementContext` ашиглан)
- Richer analytics and engagement event tracking (`engagement-events/` directory)
- Swagger/OpenAPI documentation configuration
