-- Phase 2: Refactor habit_cues from day_type/time_window to start_time/end_time
-- Also drops the cue_day_type enum which is no longer used by the schema.

-- Step 1: Drop old columns
ALTER TABLE "habit_cues"
  DROP COLUMN IF EXISTS "day_type",
  DROP COLUMN IF EXISTS "time_window";

-- Step 2: Add new time-range columns
ALTER TABLE "habit_cues"
  ADD COLUMN IF NOT EXISTS "start_time" TEXT,
  ADD COLUMN IF NOT EXISTS "end_time" TEXT;

-- Step 3: Drop old enum (no longer referenced)
DROP TYPE IF EXISTS "cue_day_type";
