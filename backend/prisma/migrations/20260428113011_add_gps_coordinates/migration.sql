/*
  Warnings:

  - You are about to drop the column `current_location` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "habit_cues" ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "current_location",
ADD COLUMN     "current_lat" DOUBLE PRECISION,
ADD COLUMN     "current_lng" DOUBLE PRECISION;
