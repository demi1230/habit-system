Goal: persistent learning recommendations driven by habit signals + article interaction tracking + frontend learning page integration
In scope: recommendation generation rule engine, AdaptationRecommendation persistence, RecommendationInteraction tracking, ArticleInteraction tracking, LearningModule, LearningController, LearningService, frontend hooks, article content catalog
Out of scope: AI/LLM-generated recommendations, push notifications for recommendations, recommendation expiry scheduling

## Status: IMPLEMENTED

---

## Overview

The Learning & Recommendations feature closes the adaptation loop: the system does not only measure habit strength (Phase 4B) or suggest stateless adaptations (Phase 4C) — it now persists concrete, prioritised recommendations in the database and connects them to educational articles the user can read to improve.

The architecture has two layers:
- **Generation** (`RecommendationGenerationService` in `src/progress/`) — runs the rule engine, reads signals, upserts DB records.
- **Presentation** (`LearningModule` in `src/learning/`) — surfaces recommendations and tracks user engagement.

---

## Database Migration

**Migration:** `20260421042849_add_learning_recommendations`

### New Tables

#### `adaptation_recommendations`
One row per active recommendation per `(userId, habitId, recommendationCode)` combination.

```prisma
model AdaptationRecommendation {
  id                 String                 @id @default(uuid()) @db.Uuid
  userId             String                 @map("user_id") @db.Uuid
  habitId            String                 @map("habit_id") @db.Uuid
  recommendationCode RecommendationCode     @map("recommendation_code")
  reasonCode         ReasonCode             @map("reason_code")
  title              String
  message            String
  priority           Priority
  status             RecommendationStatus   @default(ACTIVE)
  articleIds         String[]               @default([]) @map("article_ids")
  metadata           Json?
  generatedAt        DateTime               @map("generated_at")
  expiresAt          DateTime?              @map("expires_at")
  createdAt          DateTime               @default(now()) @map("created_at")
  updatedAt          DateTime               @updatedAt @map("updated_at")

  @@index([userId, status])
  @@index([habitId, status])
  @@index([userId, generatedAt])
}
```

#### `article_interactions`
Each time a user opens, completes, bookmarks or unbookmarks a learning article.

```prisma
model ArticleInteraction {
  id              String                 @id @default(uuid()) @db.Uuid
  userId          String                 @map("user_id") @db.Uuid
  habitId         String?                @map("habit_id") @db.Uuid
  articleId       String                 @map("article_id")
  sourceType      SourceType             @map("source_type")
  sourceId        String?                @map("source_id")
  interactionType ArticleInteractionType @map("interaction_type")
  occurredAt      DateTime               @map("occurred_at")
  createdAt       DateTime               @default(now()) @map("created_at")

  @@index([userId, occurredAt])
  @@index([habitId, occurredAt])
  @@index([articleId, occurredAt])
  @@index([sourceType, sourceId])
}
```

#### `recommendation_interactions`
Each time a user interacts with a recommendation card (shown, clicked, dismissed, applied).

```prisma
model RecommendationInteraction {
  id               String                        @id @default(uuid()) @db.Uuid
  userId           String                        @map("user_id") @db.Uuid
  recommendationId String                        @map("recommendation_id") @db.Uuid
  interactionType  RecommendationInteractionType @map("interaction_type")
  occurredAt       DateTime                      @map("occurred_at")
  createdAt        DateTime                      @default(now()) @map("created_at")

  @@index([recommendationId])
  @@index([userId, occurredAt])
}
```

### New Enums

| Enum | Values |
|------|--------|
| `RecommendationCode` | `BUILD_CONSISTENCY`, `SIMPLIFY_HABIT`, `REVIEW_REMINDER_DEPENDENCE`, `CELEBRATE_CONSISTENCY`, `REDUCE_TARGET`, `ADJUST_CUE`, `INCREASE_SUPPORT` |
| `ReasonCode` | `LOW_CONSISTENCY`, `HIGH_DIFFICULTY`, `HIGH_REMINDER_DEPENDENCE`, `LOW_CONTEXT_STABILITY`, `LOW_SELF_INITIATED_RATE`, `PLATEAUED_HABIT_STRENGTH`, `MILESTONE_REACHED` |
| `RecommendationStatus` | `ACTIVE`, `DISMISSED`, `APPLIED`, `EXPIRED` |
| `Priority` | `LOW`, `MEDIUM`, `HIGH` |
| `ArticleInteractionType` | `OPENED`, `COMPLETED`, `BOOKMARKED`, `UNBOOKMARKED` |
| `SourceType` | `LEARNING_PAGE`, `RECOMMENDATION`, `HABIT_DETAIL`, `ANALYTICS_PAGE` |
| `RecommendationInteractionType` | `SHOWN`, `CLICKED`, `DISMISSED`, `APPLIED` |

---

## Backend: Recommendation Generation

### `RecommendationGenerationService` (`src/progress/recommendation-generation.service.ts`)

This service is the rule engine. It is injected into `LearningService` and called on every `refresh` request.

#### Signal Collection

Runs `Promise.all` to gather 4 data sources in parallel:

| Source | What is read |
|--------|-------------|
| `SrbaiService.getCompositeScore` | Composite strength score (0–100) |
| `DifficultyFeedbackRepository.findRecentByHabitId(habitId, 5)` | Last 5 difficulty ratings |
| `HabitLogRepository.findSummaryByHabitId(habitId)` | All habit logs (for rate calculation) |
| `ReminderPolicyRepository.findByHabitId(habitId)` | Current reminder policy mode |

#### Derived Metrics

```
selfInitiatedRate      = SELF_INITIATED DONE logs / total DONE logs
reminderDependenceRate = REMINDER_TRIGGERED DONE logs / total DONE logs
recentDifficultyLevel  = REVERSE_DIFFICULTY[round(avg(last 5 difficulty scores))]
```

Difficulty is mapped to a numeric scale: `very_easy=1, easy=2, moderate=3, hard=4, very_hard=5`.

#### Rule Engine (`computeRecommendations`)

Five independent rules evaluate concurrently — a single refresh call can produce multiple recommendations:

| # | Condition | `RecommendationCode` | `ReasonCode` | Priority |
|---|-----------|---------------------|--------------|----------|
| 1 | `selfInitiatedRate < 0.4` AND `doneCount >= 3` | `BUILD_CONSISTENCY` | `LOW_CONSISTENCY` | HIGH |
| 2 | Avg difficulty ≥ `hard` (≥4) AND `doneCount >= 5` | `SIMPLIFY_HABIT` | `HIGH_DIFFICULTY` | HIGH |
| 3 | `reminderDependenceRate >= 0.7` AND `doneCount >= 5` | `REVIEW_REMINDER_DEPENDENCE` | `HIGH_REMINDER_DEPENDENCE` | MEDIUM |
| 4 | `doneCount ∈ {7, 21, 66}` | `CELEBRATE_CONSISTENCY` | `MILESTONE_REACHED` | MEDIUM |
| 5 | `compositeScore >= 70` AND `selfInitiatedRate >= 0.7` | `REDUCE_TARGET` | `PLATEAUED_HABIT_STRENGTH` | LOW |

Milestones 7, 21, 66 correspond to the habit formation stages in the thesis literature (1 week, 3 weeks, ~2 months).

Each recommendation carries an `articleIds[]` array linking it to specific frontend articles:

| Code | Article IDs |
|------|------------|
| `BUILD_CONSISTENCY` | `build-consistency`, `recover-after-missed-days` |
| `SIMPLIFY_HABIT` | `habit-small-steps`, `reduce-friction` |
| `REVIEW_REMINDER_DEPENDENCE` | `reduce-reminder-dependence`, `fix-your-cues` |
| `CELEBRATE_CONSISTENCY` | `maintain-strong-habits` |
| `REDUCE_TARGET` | `maintain-strong-habits` |

#### Upsert Logic

```
for each generated recommendation:
  existing = findByUserHabitAndCode(userId, habitId, code)   // only looks at ACTIVE records
  if existing:
    update(existing.id, { articleIds })    // refresh article links, keep same ID
  else:
    create({ userId, habitId, code, reasonCode, title, message, priority, articleIds })
```

This ensures no duplicate active recommendations per `(userId, habitId, code)` triple.

---

## Backend: Learning Module

### Module Files

| File | Purpose |
|------|---------|
| `src/learning/learning.module.ts` | NestJS module — wires service, controllers, repos |
| `src/learning/learning.service.ts` | Business logic — get, refresh, dismiss, log interactions |
| `src/learning/learning.controller.ts` | HTTP layer — `LearningController` + `ArticleController` |
| `src/learning/dto/index.ts` | `LogRecommendationInteractionDto`, `LogArticleInteractionDto` |

### Domain Additions

| File | Purpose |
|------|---------|
| `src/domain/entities/adaptation-recommendation.entity.ts` | `AdaptationRecommendationEntity` interface |
| `src/domain/entities/article-interaction.entity.ts` | `ArticleInteractionEntity` interface |
| `src/domain/entities/recommendation-interaction.entity.ts` | `RecommendationInteractionEntity` interface |
| `src/domain/repositories/adaptation-recommendation.repository.ts` | `IAdaptationRecommendationRepository` + DI token |
| `src/domain/repositories/article-interaction.repository.ts` | `IArticleInteractionRepository` + DI token |
| `src/domain/repositories/recommendation-interaction.repository.ts` | `IRecommendationInteractionRepository` + DI token |

### Infrastructure Additions

| File | Purpose |
|------|---------|
| `src/infrastructure/persistence/adaptation-recommendation.prisma-repository.ts` | Prisma implementation |
| `src/infrastructure/persistence/article-interaction.prisma-repository.ts` | Prisma implementation |
| `src/infrastructure/persistence/recommendation-interaction.prisma-repository.ts` | Prisma implementation |

All three Prisma repositories carry `/* eslint-disable @typescript-eslint/no-unsafe-* */` headers because the generated `client.ts` uses `@ts-nocheck` (Prisma v7 generates with `$Class.getPrismaClientClass()` pattern).

### API Endpoints

#### Recommendations (`LearningController`)

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/users/:userId/recommendations` | Optional `?habitId=` filter. Returns ACTIVE only. |
| `POST` | `/api/users/:userId/recommendations/refresh` | Required `?habitId=` query param (UUID). Runs rule engine. |
| `GET` | `/api/users/:userId/recommendations/:recommendationId` | Single recommendation. |
| `POST` | `/api/users/:userId/recommendations/:recommendationId/interactions` | Body: `{ interactionType, occurredAt? }` |
| `POST` | `/api/users/:userId/recommendations/:recommendationId/dismiss` | Sets status=DISMISSED + logs DISMISSED interaction. |

#### Articles (`ArticleController`)

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/users/:userId/articles/:articleId/interactions` | Body: `LogArticleInteractionDto` |
| `GET` | `/api/users/:userId/articles/interactions` | Optional `?limit=` (default 20) |

### DTOs

**`LogRecommendationInteractionDto`:**
```typescript
class LogRecommendationInteractionDto {
  @IsEnum(RecommendationInteractionType)
  interactionType!: RecommendationInteractionType;

  @IsOptional() @IsDateString()
  occurredAt?: string;
}
```

**`LogArticleInteractionDto`:**
```typescript
class LogArticleInteractionDto {
  @IsString()
  articleId!: string;

  @IsEnum(SourceType)
  sourceType!: SourceType;

  @IsEnum(ArticleInteractionType)
  interactionType!: ArticleInteractionType;

  @IsOptional() @IsString()
  sourceId?: string;

  @IsOptional() @IsUUID()
  habitId?: string;
}
```

---

## Frontend Integration

### React Query Hooks (`src/features/learning/hooks/useRecommendations.ts`)

| Hook | Method | Description |
|------|--------|-------------|
| `useRecommendations(userId, habitId?)` | `GET` | Fetches active recommendations |
| `useRefreshRecommendations(userId)` | `POST` | Triggers rule engine for a habit |
| `useLogRecommendationInteraction(userId)` | `POST` | Logs SHOWN/CLICKED/DISMISSED/APPLIED |
| `useDismissRecommendation(userId)` | `POST` | Dismisses a recommendation |
| `useLogArticleInteraction(userId)` | `POST` | Logs article engagement |
| `useArticleInteractionHistory(userId, limit?)` | `GET` | Article interaction history |

All hooks use `api` from `frontend/src/api/client.ts` (not axios — `api.get/post` returns data directly).

### Article Catalog (`src/features/learning/content/articles.ts`)

7 articles in Mongolian covering the main recommendation topics:

| ID | Title |
|----|-------|
| `build-consistency` | Тогтвортой байдлыг бий болгох |
| `recover-after-missed-days` | Алдсан өдрүүдээс сэргэх |
| `habit-small-steps` | Жижиг алхмуудаас эхэл |
| `reduce-friction` | Саад тотгорыг арилга |
| `fix-your-cues` | Өдөөгчөө тохируул |
| `reduce-reminder-dependence` | Сануулалтаас хамаарлыг бууруул |
| `maintain-strong-habits` | Хүчтэй дадлыг хадгал |

### Pages

- **`LearnPage.tsx`** (`/learn`) — Lists active recommendations with article links; refresh button per habit
- **`ArticleDetailPage.tsx`** (`/learn/articles/:articleId`) — Full article reader; logs `OPENED` interaction on mount

---

## Integration with Existing Modules

- `ProgressModule` exports `RecommendationGenerationService` — `LearningModule` imports it
- `PrismaModule` is `@Global()` — all 3 new repositories receive `PrismaService` automatically
- `LearningModule` is imported in `AppModule`
- `HabitsModule` is imported in `LearningModule` (for `HabitsService.getOwnedHabitOrThrow` ownership check inside generation)

---

## Files Created (Phase 5)

**Domain:**
- `src/domain/entities/adaptation-recommendation.entity.ts`
- `src/domain/entities/article-interaction.entity.ts`
- `src/domain/entities/recommendation-interaction.entity.ts`
- `src/domain/repositories/adaptation-recommendation.repository.ts`
- `src/domain/repositories/article-interaction.repository.ts`
- `src/domain/repositories/recommendation-interaction.repository.ts`

**Infrastructure:**
- `src/infrastructure/persistence/adaptation-recommendation.prisma-repository.ts`
- `src/infrastructure/persistence/article-interaction.prisma-repository.ts`
- `src/infrastructure/persistence/recommendation-interaction.prisma-repository.ts`

**Application:**
- `src/progress/recommendation-generation.service.ts`
- `src/learning/learning.module.ts`
- `src/learning/learning.service.ts`
- `src/learning/learning.controller.ts`
- `src/learning/dto/index.ts`

**Migration:**
- `prisma/migrations/20260421042849_add_learning_recommendations/migration.sql`

**Frontend:**
- `frontend/src/features/learning/hooks/useRecommendations.ts`
- `frontend/src/features/learning/content/articles.ts`
- `frontend/src/pages/LearnPage.tsx`
- `frontend/src/pages/ArticleDetailPage.tsx`

## Files Modified (Phase 5)

- `prisma/schema.prisma` — 3 new models, 7 new enums
- `src/domain/enums/domain.enums.ts` — 7 new enums added
- `src/progress/progress.module.ts` — exports `RecommendationGenerationService`
- `src/app.module.ts` — `LearningModule` registered
- `frontend/src/App.tsx` — `/learn` and `/learn/articles/:articleId` routes
- `frontend/src/main.tsx` — `QueryClientProvider` added, `@tanstack/react-query` installed
