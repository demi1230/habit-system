-- CreateEnum
CREATE TYPE "recommendation_code" AS ENUM ('SIMPLIFY_HABIT', 'ADJUST_CUE', 'REDUCE_TARGET', 'INCREASE_SUPPORT', 'REVIEW_REMINDER_DEPENDENCE', 'BUILD_CONSISTENCY', 'CELEBRATE_CONSISTENCY');

-- CreateEnum
CREATE TYPE "reason_code" AS ENUM ('LOW_CONSISTENCY', 'HIGH_DIFFICULTY', 'HIGH_REMINDER_DEPENDENCE', 'LOW_CONTEXT_STABILITY', 'LOW_SELF_INITIATED_RATE', 'PLATEAUED_HABIT_STRENGTH', 'MILESTONE_REACHED');

-- CreateEnum
CREATE TYPE "recommendation_status" AS ENUM ('ACTIVE', 'DISMISSED', 'APPLIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "article_interaction_type" AS ENUM ('OPENED', 'COMPLETED', 'BOOKMARKED', 'UNBOOKMARKED');

-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('LEARNING_PAGE', 'RECOMMENDATION', 'HABIT_DETAIL', 'ANALYTICS_PAGE');

-- CreateEnum
CREATE TYPE "recommendation_interaction_type" AS ENUM ('SHOWN', 'CLICKED', 'DISMISSED', 'APPLIED');

-- CreateTable
CREATE TABLE "adaptation_recommendations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "recommendation_code" "recommendation_code" NOT NULL,
    "reason_code" "reason_code" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "priority" NOT NULL,
    "status" "recommendation_status" NOT NULL DEFAULT 'ACTIVE',
    "article_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adaptation_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_interactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "habit_id" UUID,
    "article_id" TEXT NOT NULL,
    "source_type" "source_type" NOT NULL,
    "source_id" TEXT,
    "interaction_type" "article_interaction_type" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_interactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recommendation_id" UUID NOT NULL,
    "interaction_type" "recommendation_interaction_type" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "adaptation_recommendations_user_id_status_idx" ON "adaptation_recommendations"("user_id", "status");

-- CreateIndex
CREATE INDEX "adaptation_recommendations_habit_id_status_idx" ON "adaptation_recommendations"("habit_id", "status");

-- CreateIndex
CREATE INDEX "adaptation_recommendations_user_id_generated_at_idx" ON "adaptation_recommendations"("user_id", "generated_at");

-- CreateIndex
CREATE INDEX "article_interactions_user_id_occurred_at_idx" ON "article_interactions"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "article_interactions_habit_id_occurred_at_idx" ON "article_interactions"("habit_id", "occurred_at");

-- CreateIndex
CREATE INDEX "article_interactions_article_id_occurred_at_idx" ON "article_interactions"("article_id", "occurred_at");

-- CreateIndex
CREATE INDEX "article_interactions_source_type_source_id_idx" ON "article_interactions"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "recommendation_interactions_recommendation_id_idx" ON "recommendation_interactions"("recommendation_id");

-- CreateIndex
CREATE INDEX "recommendation_interactions_user_id_occurred_at_idx" ON "recommendation_interactions"("user_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "adaptation_recommendations" ADD CONSTRAINT "adaptation_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptation_recommendations" ADD CONSTRAINT "adaptation_recommendations_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_interactions" ADD CONSTRAINT "article_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_interactions" ADD CONSTRAINT "article_interactions_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_interactions" ADD CONSTRAINT "recommendation_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_interactions" ADD CONSTRAINT "recommendation_interactions_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "adaptation_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
