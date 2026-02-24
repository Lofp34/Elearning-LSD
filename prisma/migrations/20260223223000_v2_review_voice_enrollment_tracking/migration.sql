-- CreateEnum
CREATE TYPE "ModuleReviewStatus" AS ENUM ('DRAFT', 'APPROVED', 'NEEDS_CHANGES');

-- AlterTable
ALTER TABLE "Company"
ADD COLUMN "femaleVoiceId" TEXT,
ADD COLUMN "femaleVoiceName" TEXT,
ADD COLUMN "maleVoiceId" TEXT,
ADD COLUMN "maleVoiceName" TEXT;

-- AlterTable
ALTER TABLE "LearningRelease"
ADD COLUMN "analysisSummary" JSONB;

-- AlterTable
ALTER TABLE "LearningModule"
ADD COLUMN "contentKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN "reviewStatus" "ModuleReviewStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT,
ADD COLUMN "reviewComment" TEXT;

-- Backfill contentKey with fixed key format
UPDATE "LearningModule"
SET "contentKey" = "partKey" || '.' || "chapterKey"
WHERE "contentKey" = '';

-- Remove default after backfill
ALTER TABLE "LearningModule"
ALTER COLUMN "contentKey" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ListenEvent"
ADD COLUMN "releaseId" TEXT,
ADD COLUMN "moduleId" TEXT;

-- AlterTable
ALTER TABLE "QuizAttempt"
ADD COLUMN "releaseId" TEXT,
ADD COLUMN "moduleId" TEXT;

-- DropIndex
DROP INDEX "LearningModule_releaseId_partKey_chapterKey_key";

-- CreateIndex
CREATE UNIQUE INDEX "LearningModule_releaseId_contentKey_key" ON "LearningModule"("releaseId", "contentKey");

-- CreateIndex
CREATE INDEX "LearningModule_reviewedById_idx" ON "LearningModule"("reviewedById");

-- CreateIndex
CREATE INDEX "ListenEvent_userId_releaseId_idx" ON "ListenEvent"("userId", "releaseId");

-- CreateIndex
CREATE INDEX "ListenEvent_moduleId_idx" ON "ListenEvent"("moduleId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_releaseId_idx" ON "QuizAttempt"("userId", "releaseId");

-- CreateIndex
CREATE INDEX "QuizAttempt_moduleId_idx" ON "QuizAttempt"("moduleId");

-- AddForeignKey
ALTER TABLE "LearningModule" ADD CONSTRAINT "LearningModule_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListenEvent" ADD CONSTRAINT "ListenEvent_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "LearningRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListenEvent" ADD CONSTRAINT "ListenEvent_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "LearningRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
