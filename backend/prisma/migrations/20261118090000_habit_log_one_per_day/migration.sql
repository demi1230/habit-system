-- One habit log per habit per calendar day.
--
-- log_date is the calendar day of completed_at in the application timezone
-- (Asia/Ulaanbaatar, see src/shared/time.ts). completed_at stores UTC without a
-- zone, so it is first marked as UTC and then converted.
--
-- Existing duplicates must be merged first, otherwise the unique index cannot
-- be created. The check runs before any change so a failure leaves the table
-- untouched:
--   npm run cleanup:habit-log-dupes            (dry run: review the plan)
--   npm run cleanup:habit-log-dupes -- --apply (merge duplicates)
DO $$
DECLARE
  duplicate_days integer;
BEGIN
  SELECT count(*) INTO duplicate_days
  FROM (
    SELECT 1
    FROM "habit_logs"
    GROUP BY
      "habit_id",
      (("completed_at" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ulaanbaatar')::date
    HAVING count(*) > 1
  ) AS duplicates;

  IF duplicate_days > 0 THEN
    RAISE EXCEPTION
      'habit_logs has % habit/day group(s) with more than one log. Run "npm run cleanup:habit-log-dupes -- --apply" (after reviewing the dry run) and apply this migration again.',
      duplicate_days;
  END IF;
END $$;

-- AlterTable
ALTER TABLE "habit_logs" ADD COLUMN "log_date" DATE;

UPDATE "habit_logs"
SET "log_date" = (("completed_at" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ulaanbaatar')::date;

ALTER TABLE "habit_logs" ALTER COLUMN "log_date" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "habit_logs_habit_id_log_date_key" ON "habit_logs"("habit_id", "log_date");
