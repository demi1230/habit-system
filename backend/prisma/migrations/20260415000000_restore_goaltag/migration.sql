-- Restore goal_tag column that was dropped in phase6 but is still needed
-- by the Prisma schema, backend services, and frontend UI (goal tag display).
ALTER TABLE "habit_motivation_profiles" ADD COLUMN "goal_tag" TEXT;
