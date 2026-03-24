-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "habit_tracking_type" AS ENUM ('SIMPLE_CHECKIN', 'QUANTITATIVE');

-- CreateEnum
CREATE TYPE "habit_log_status" AS ENUM ('DONE', 'PARTIAL', 'NOT_DONE');

-- CreateEnum
CREATE TYPE "habit_lifecycle_status" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "completion_trigger_source" AS ENUM ('SELF_INITIATED', 'REMINDER_TRIGGERED', 'MANUAL_ENTRY');

-- CreateEnum
CREATE TYPE "weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "cue_day_type" AS ENUM ('ANY', 'WEEKDAY', 'WEEKEND');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tracking_type" "habit_tracking_type" NOT NULL,
    "allow_partial_completion" BOOLEAN NOT NULL DEFAULT false,
    "measurement_unit" TEXT,
    "target_value" DOUBLE PRECISION,
    "minimum_success_value" DOUBLE PRECISION,
    "start_date" DATE NOT NULL,
    "status" "habit_lifecycle_status" NOT NULL DEFAULT 'ACTIVE',
    "reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_schedule_days" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "weekday" "weekday" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_schedule_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_cues" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "time_window" TEXT,
    "day_type" "cue_day_type" NOT NULL DEFAULT 'ANY',
    "coarse_location" TEXT,
    "preceding_routine" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_cues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_motivation_profiles" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "goal_tag" TEXT,
    "personal_reason" TEXT,
    "identity_statement" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_motivation_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_logs" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "status" "habit_log_status" NOT NULL,
    "actual_value" DOUBLE PRECISION,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trigger_source" "completion_trigger_source",

    CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "activity_type" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "habits_user_id_idx" ON "habits"("user_id");

-- CreateIndex
CREATE INDEX "habits_status_idx" ON "habits"("status");

-- CreateIndex
CREATE INDEX "habit_schedule_days_habit_id_idx" ON "habit_schedule_days"("habit_id");

-- CreateIndex
CREATE UNIQUE INDEX "habit_schedule_days_habit_id_weekday_key" ON "habit_schedule_days"("habit_id", "weekday");

-- CreateIndex
CREATE INDEX "habit_cues_habit_id_idx" ON "habit_cues"("habit_id");

-- CreateIndex
CREATE UNIQUE INDEX "habit_motivation_profiles_habit_id_key" ON "habit_motivation_profiles"("habit_id");

-- CreateIndex
CREATE INDEX "habit_logs_habit_id_completed_at_idx" ON "habit_logs"("habit_id", "completed_at");

-- CreateIndex
CREATE INDEX "habit_logs_habit_id_logged_at_idx" ON "habit_logs"("habit_id", "logged_at");

-- CreateIndex
CREATE INDEX "habit_logs_trigger_source_idx" ON "habit_logs"("trigger_source");

-- CreateIndex
CREATE INDEX "user_activity_logs_user_id_occurred_at_idx" ON "user_activity_logs"("user_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_schedule_days" ADD CONSTRAINT "habit_schedule_days_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_cues" ADD CONSTRAINT "habit_cues_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_motivation_profiles" ADD CONSTRAINT "habit_motivation_profiles_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
