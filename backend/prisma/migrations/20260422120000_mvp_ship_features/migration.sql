CREATE TYPE "badge_code" AS ENUM ('FIRST_DONE', 'STREAK_7', 'STREAK_21', 'TOTAL_30');

ALTER TABLE "users"
ADD COLUMN "total_xp" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "habit_steps" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_badges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "habit_id" UUID,
    "badge_code" "badge_code" NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "habit_steps_habit_id_order_index_key" ON "habit_steps"("habit_id", "order_index");
CREATE INDEX "habit_steps_habit_id_idx" ON "habit_steps"("habit_id");

CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

CREATE UNIQUE INDEX "user_badges_user_id_badge_code_key" ON "user_badges"("user_id", "badge_code");
CREATE INDEX "user_badges_user_id_awarded_at_idx" ON "user_badges"("user_id", "awarded_at");

ALTER TABLE "habit_steps"
ADD CONSTRAINT "habit_steps_habit_id_fkey"
FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "push_subscriptions"
ADD CONSTRAINT "push_subscriptions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges"
ADD CONSTRAINT "user_badges_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges"
ADD CONSTRAINT "user_badges_habit_id_fkey"
FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
