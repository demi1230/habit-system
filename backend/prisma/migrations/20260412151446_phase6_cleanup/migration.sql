/*
  Warnings:

  - You are about to drop the column `expires_at` on the `reminders` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "difficulty_rating" AS ENUM ('VERY_EASY', 'EASY', 'MODERATE', 'HARD', 'VERY_HARD');

-- DropForeignKey
ALTER TABLE "habit_logs" DROP CONSTRAINT "habit_logs_linked_reminder_id_fkey";

-- DropForeignKey
ALTER TABLE "reminder_actions" DROP CONSTRAINT "reminder_actions_reminder_id_fkey";

-- DropForeignKey
ALTER TABLE "reminder_actions" DROP CONSTRAINT "reminder_actions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reminder_policies" DROP CONSTRAINT "reminder_policies_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "srbai_assessments" DROP CONSTRAINT "srbai_assessments_habit_id_fkey";

-- AlterTable
ALTER TABLE "habit_logs" ADD COLUMN     "coarse_location" TEXT,
ADD COLUMN     "completion_hour" INTEGER,
ADD COLUMN     "preceding_routine" TEXT;

-- AlterTable
ALTER TABLE "reminder_actions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reminder_policies" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reminders" DROP COLUMN "expires_at",
ADD COLUMN     "effective_until" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "srbai_assessments" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "difficulty_feedbacks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "log_id" UUID NOT NULL,
    "rating" "difficulty_rating" NOT NULL,
    "note" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "difficulty_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "log_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reflections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "difficulty_feedbacks_habit_id_occurred_at_idx" ON "difficulty_feedbacks"("habit_id", "occurred_at");

-- CreateIndex
CREATE INDEX "difficulty_feedbacks_user_id_occurred_at_idx" ON "difficulty_feedbacks"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "reflections_habit_id_occurred_at_idx" ON "reflections"("habit_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_linked_reminder_id_fkey" FOREIGN KEY ("linked_reminder_id") REFERENCES "reminders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "difficulty_feedbacks" ADD CONSTRAINT "difficulty_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "difficulty_feedbacks" ADD CONSTRAINT "difficulty_feedbacks_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "difficulty_feedbacks" ADD CONSTRAINT "difficulty_feedbacks_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "habit_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "habit_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_actions" ADD CONSTRAINT "reminder_actions_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_actions" ADD CONSTRAINT "reminder_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "srbai_assessments" ADD CONSTRAINT "srbai_assessments_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_policies" ADD CONSTRAINT "reminder_policies_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "reminder_actions_user_id_acted_idx" RENAME TO "reminder_actions_user_id_acted_at_idx";
