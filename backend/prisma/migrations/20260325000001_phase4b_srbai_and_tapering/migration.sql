-- Phase 4B: SRBAI assessment + reminder tapering policy
-- Migration: 20260325000001_phase4b_srbai_and_tapering

-- Enums
CREATE TYPE "reminder_policy_mode" AS ENUM ('FULL_SUPPORT', 'MODERATE_SUPPORT', 'FADE_OUT', 'MINIMAL');

-- SRBAI assessment table
CREATE TABLE "srbai_assessments" (
  "id"                   UUID         NOT NULL DEFAULT gen_random_uuid(),
  "user_id"              UUID         NOT NULL,
  "habit_id"             UUID         NOT NULL,
  "item1"                INTEGER      NOT NULL,
  "item2"                INTEGER      NOT NULL,
  "item3"                INTEGER      NOT NULL,
  "item4"                INTEGER      NOT NULL,
  "raw_average"          DOUBLE PRECISION NOT NULL,
  "normalized_score_100" DOUBLE PRECISION NOT NULL,
  "assessed_at"          TIMESTAMP(3) NOT NULL,
  "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "srbai_assessments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "srbai_assessments_habit_id_assessed_at_idx" ON "srbai_assessments"("habit_id", "assessed_at");
CREATE INDEX "srbai_assessments_user_id_assessed_at_idx"  ON "srbai_assessments"("user_id", "assessed_at");

ALTER TABLE "srbai_assessments"
  ADD CONSTRAINT "srbai_assessments_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE;

-- Reminder policy table (one per habit)
CREATE TABLE "reminder_policies" (
  "id"               UUID               NOT NULL DEFAULT gen_random_uuid(),
  "habit_id"         UUID               NOT NULL,
  "mode"             "reminder_policy_mode" NOT NULL DEFAULT 'FULL_SUPPORT',
  "cooldown_minutes" INTEGER            NOT NULL DEFAULT 60,
  "max_per_day"      INTEGER            NOT NULL DEFAULT 3,
  "narrowing_level"  INTEGER            NOT NULL DEFAULT 0,
  "effective_from"   TIMESTAMP(3)       NOT NULL,
  "created_at"       TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3)       NOT NULL,
  CONSTRAINT "reminder_policies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reminder_policies_habit_id_key" ON "reminder_policies"("habit_id");

ALTER TABLE "reminder_policies"
  ADD CONSTRAINT "reminder_policies_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE;
