-- Phase 4A: Reminder execution + reminder action flow + completion source linkage
-- Migration: 20260325000000_phase4a_reminder_execution

-- Enums
CREATE TYPE "reminder_status" AS ENUM ('PENDING', 'SENT', 'ACTED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "reminder_decision_reason" AS ENUM ('REMINDER_DISABLED', 'NOT_SCHEDULED_TODAY', 'NO_ACTIVE_CUES', 'SHOULD_REMIND');
CREATE TYPE "reminder_action_type" AS ENUM ('DONE', 'SNOOZE');

-- Extend HabitLog with reminder linkage fields
ALTER TABLE "habit_logs"
  ADD COLUMN "linked_reminder_id" UUID,
  ADD COLUMN "source_confidence" DOUBLE PRECISION;

-- Reminder table
CREATE TABLE "reminders" (
  "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"           UUID        NOT NULL,
  "habit_id"          UUID        NOT NULL,
  "linked_cue_id"     UUID,
  "decision_reason"   "reminder_decision_reason" NOT NULL,
  "status"            "reminder_status" NOT NULL DEFAULT 'PENDING',
  "scheduled_for"     TIMESTAMP(3) NOT NULL,
  "evaluated_at"      TIMESTAMP(3) NOT NULL,
  "sent_at"           TIMESTAMP(3),
  "delivered_at"      TIMESTAMP(3),
  "expires_at"        TIMESTAMP(3),
  "cooldown_key"      TEXT,
  "explanation"       JSONB,
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reminders_user_id_scheduled_for_idx" ON "reminders"("user_id", "scheduled_for");
CREATE INDEX "reminders_habit_id_status_idx"       ON "reminders"("habit_id", "status");
CREATE INDEX "reminders_cooldown_key_idx"           ON "reminders"("cooldown_key");

ALTER TABLE "reminders"
  ADD CONSTRAINT "reminders_user_id_fkey"  FOREIGN KEY ("user_id")  REFERENCES "users"("id")  ON DELETE CASCADE,
  ADD CONSTRAINT "reminders_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE;

-- ReminderAction table
CREATE TABLE "reminder_actions" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "reminder_id"   UUID        NOT NULL,
  "user_id"       UUID        NOT NULL,
  "action_type"   "reminder_action_type" NOT NULL,
  "acted_at"      TIMESTAMP(3) NOT NULL,
  "snoozed_until" TIMESTAMP(3),
  "metadata"      JSONB,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reminder_actions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reminder_actions_reminder_id_idx"   ON "reminder_actions"("reminder_id");
CREATE INDEX "reminder_actions_user_id_acted_idx" ON "reminder_actions"("user_id", "acted_at");

ALTER TABLE "reminder_actions"
  ADD CONSTRAINT "reminder_actions_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE CASCADE,
  ADD CONSTRAINT "reminder_actions_user_id_fkey"     FOREIGN KEY ("user_id")     REFERENCES "users"("id")    ON DELETE CASCADE;

-- FK from habit_logs.linked_reminder_id → reminders.id
ALTER TABLE "habit_logs"
  ADD CONSTRAINT "habit_logs_linked_reminder_id_fkey"
    FOREIGN KEY ("linked_reminder_id") REFERENCES "reminders"("id") ON DELETE SET NULL;
