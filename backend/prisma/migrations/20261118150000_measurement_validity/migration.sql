-- SRBAI item wording version. Existing answers used the earlier item wording
-- (version 1); the app now records version 2 (Gardner et al., 2012 items).
-- AlterTable
ALTER TABLE "srbai_assessments" ADD COLUMN "instrument_version" INTEGER NOT NULL DEFAULT 1;

-- completion_hour was never written before. Backfill the Asia/Ulaanbaatar hour
-- for logs recorded on the same day they describe; catch-up entries for an
-- earlier day carry a placeholder time and stay NULL (not observed).
-- Run `npm run diagnose:log-time-offset` first: if old logs are shifted by the
-- host timezone, correct them before applying this migration.
UPDATE "habit_logs"
SET "completion_hour" = EXTRACT(
  HOUR FROM (("completed_at" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ulaanbaatar')
)::int
WHERE "completion_hour" IS NULL
  AND (("completed_at" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ulaanbaatar')::date
    = (("logged_at" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ulaanbaatar')::date;
