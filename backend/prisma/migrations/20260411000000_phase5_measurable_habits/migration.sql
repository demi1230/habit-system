-- Phase 5: All habits are measurable; partial completion removed; motivation simplified
-- 1. Drop unused PARTIAL enum value and old tracking-type enum
-- 2. Make measurement fields required on habits
-- 3. Rename minimumSuccessValue → minimumTarget
-- 4. Simplify motivation profile (drop personalReason + identityStatement, add reason)

-- ── Step 1: Migrate any PARTIAL log statuses to DONE before removing enum value ──
UPDATE "habit_logs"
  SET "status" = 'DONE'
  WHERE "status" = 'PARTIAL';

-- ── Step 2: Drop the PARTIAL enum value ──
-- PostgreSQL does not support removing enum values directly; create new enum and cast.
ALTER TABLE "habit_logs"
  ALTER COLUMN "status" TYPE TEXT;

DROP TYPE IF EXISTS "habit_log_status";

CREATE TYPE "habit_log_status" AS ENUM ('DONE', 'NOT_DONE');

ALTER TABLE "habit_logs"
  ALTER COLUMN "status" TYPE "habit_log_status" USING "status"::"habit_log_status";

-- ── Step 3: Drop old HabitTrackingType enum and columns from habits ──
ALTER TABLE "habits"
  DROP COLUMN IF EXISTS "tracking_type",
  DROP COLUMN IF EXISTS "allow_partial_completion";

DROP TYPE IF EXISTS "habit_tracking_type";

-- ── Step 4: Rename minimumSuccessValue → minimumTarget; make measurement columns required ──
-- First provide defaults for rows that might be NULL (legacy data)
UPDATE "habits"
  SET "minimum_success_value" = COALESCE("minimum_success_value", "target_value", 1)
  WHERE "minimum_success_value" IS NULL;

UPDATE "habits"
  SET "target_value" = COALESCE("target_value", 1)
  WHERE "target_value" IS NULL;

UPDATE "habits"
  SET "measurement_unit" = COALESCE("measurement_unit", 'unit')
  WHERE "measurement_unit" IS NULL;

-- Rename column
ALTER TABLE "habits"
  RENAME COLUMN "minimum_success_value" TO "minimum_target";

-- Make columns NOT NULL
ALTER TABLE "habits"
  ALTER COLUMN "measurement_unit" SET NOT NULL,
  ALTER COLUMN "target_value" SET NOT NULL,
  ALTER COLUMN "minimum_target" SET NOT NULL;

-- ── Step 5: Simplify motivation profile table ──
ALTER TABLE "habit_motivation_profiles"
  ADD COLUMN IF NOT EXISTS "reason" TEXT;

-- Migrate existing data: combine personalReason + identityStatement into reason
UPDATE "habit_motivation_profiles"
  SET "reason" = TRIM(
    COALESCE("personal_reason", '') ||
    CASE
      WHEN "personal_reason" IS NOT NULL AND "identity_statement" IS NOT NULL THEN ' '
      ELSE ''
    END ||
    COALESCE("identity_statement", '')
  )
  WHERE "personal_reason" IS NOT NULL OR "identity_statement" IS NOT NULL;

ALTER TABLE "habit_motivation_profiles"
  DROP COLUMN IF EXISTS "personal_reason",
  DROP COLUMN IF EXISTS "identity_statement";
