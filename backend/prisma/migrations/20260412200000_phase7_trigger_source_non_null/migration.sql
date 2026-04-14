-- Phase 7: Make trigger_source non-nullable with UNKNOWN as the default
-- Step 1: back-fill any legacy NULL rows
UPDATE "habit_logs" SET "trigger_source" = 'UNKNOWN' WHERE "trigger_source" IS NULL;

-- Step 2: set the column default
ALTER TABLE "habit_logs" ALTER COLUMN "trigger_source" SET DEFAULT 'UNKNOWN';

-- Step 3: enforce NOT NULL
ALTER TABLE "habit_logs" ALTER COLUMN "trigger_source" SET NOT NULL;
