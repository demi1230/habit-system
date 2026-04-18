-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon_type" TEXT,
ADD COLUMN     "icon_value" TEXT,
ADD COLUMN     "preceding_routine" TEXT;
