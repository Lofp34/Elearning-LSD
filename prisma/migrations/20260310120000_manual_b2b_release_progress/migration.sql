-- Add a light-weight manual release model on top of the existing schema.
CREATE TYPE "ModuleType" AS ENUM ('CORE', 'BONUS');

ALTER TABLE "LearningModule"
ADD COLUMN "moduleType" "ModuleType" NOT NULL DEFAULT 'CORE';

CREATE TABLE "LearnerModuleProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "listenPercentMax" INTEGER NOT NULL DEFAULT 0,
    "lastListenedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "quizBestScore" INTEGER,
    "quizBestTotal" INTEGER,
    "quizPassed" BOOLEAN NOT NULL DEFAULT false,
    "quizPassedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearnerModuleProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearnerModuleProgress_userId_releaseId_moduleId_key"
ON "LearnerModuleProgress"("userId", "releaseId", "moduleId");

CREATE INDEX "LearnerModuleProgress_userId_releaseId_idx"
ON "LearnerModuleProgress"("userId", "releaseId");

CREATE INDEX "LearnerModuleProgress_releaseId_moduleId_idx"
ON "LearnerModuleProgress"("releaseId", "moduleId");

ALTER TABLE "LearnerModuleProgress"
ADD CONSTRAINT "LearnerModuleProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearnerModuleProgress"
ADD CONSTRAINT "LearnerModuleProgress_releaseId_fkey"
FOREIGN KEY ("releaseId") REFERENCES "LearningRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearnerModuleProgress"
ADD CONSTRAINT "LearnerModuleProgress_moduleId_fkey"
FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
