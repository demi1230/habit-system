-- When the user's current location was last reported. Location-based
-- reminders ignore locations older than 30 minutes; existing rows have no
-- timestamp and are treated as stale until the app reports a fresh location.
-- AlterTable
ALTER TABLE "users" ADD COLUMN "current_location_at" TIMESTAMP(3);
