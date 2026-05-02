/*
  Warnings:

  - You are about to drop the column `rating` on the `user_feedbacks` table. All the data in the column will be lost.
  - Made the column `message` on table `user_feedbacks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_feedbacks" DROP COLUMN "rating",
ALTER COLUMN "message" SET NOT NULL;
