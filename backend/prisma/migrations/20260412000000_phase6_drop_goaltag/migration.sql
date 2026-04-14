-- Phase 6: Drop goal_tag column from habit_motivation_profiles
-- goal_tag was an early design artefact (short category label).
-- The reason column covers all motivation context needed for the thesis.
-- AlterTable
ALTER TABLE "habit_motivation_profiles" DROP COLUMN "goal_tag";
