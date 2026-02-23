-- CreateEnum
CREATE TYPE "LearningReleaseStatus" AS ENUM ('DRAFT', 'REVIEW_READY', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VoiceSlot" AS ENUM ('FEMALE', 'MALE');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('UPLOADED', 'EXTRACTED', 'FAILED');

-- CreateEnum
CREATE TYPE "GenerationJobType" AS ENUM ('FULL_PIPELINE', 'ANALYZE_INTERVIEWS', 'GENERATE_SCRIPTS', 'GENERATE_QUIZZES', 'GENERATE_AUDIO');

-- CreateEnum
CREATE TYPE "GenerationJobStatus" AS ENUM ('PENDING', 'RUNNING', 'RETRYING', 'FAILED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AudioAssetStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRelease" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "LearningReleaseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningModule" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "partKey" TEXT NOT NULL,
    "chapterKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "scriptText" TEXT NOT NULL,
    "voiceSlot" "VoiceSlot" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningQuizQuestion" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "answerIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewDocument" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "blobPath" TEXT NOT NULL,
    "extractedText" TEXT,
    "uploadedById" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'UPLOADED',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "releaseId" TEXT,
    "jobType" "GenerationJobType" NOT NULL,
    "status" "GenerationJobStatus" NOT NULL DEFAULT 'PENDING',
    "step" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "lastError" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioAsset" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "blobPath" TEXT NOT NULL,
    "durationSec" INTEGER,
    "provider" TEXT NOT NULL,
    "providerVoiceId" TEXT NOT NULL,
    "status" "AudioAssetStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LearnerEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "companyId" TEXT,
    "actionType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_isActive_idx" ON "Company"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LearningRelease_companyId_version_key" ON "LearningRelease"("companyId", "version");

-- CreateIndex
CREATE INDEX "LearningRelease_companyId_status_idx" ON "LearningRelease"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LearningModule_releaseId_partKey_chapterKey_key" ON "LearningModule"("releaseId", "partKey", "chapterKey");

-- CreateIndex
CREATE INDEX "LearningModule_releaseId_orderIndex_idx" ON "LearningModule"("releaseId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "LearningQuizQuestion_moduleId_orderIndex_key" ON "LearningQuizQuestion"("moduleId", "orderIndex");

-- CreateIndex
CREATE INDEX "LearningQuizQuestion_moduleId_idx" ON "LearningQuizQuestion"("moduleId");

-- CreateIndex
CREATE INDEX "InterviewDocument_companyId_status_createdAt_idx" ON "InterviewDocument"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationJob_companyId_status_createdAt_idx" ON "GenerationJob"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationJob_status_nextRunAt_idx" ON "GenerationJob"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "GenerationJob_releaseId_idx" ON "GenerationJob"("releaseId");

-- CreateIndex
CREATE UNIQUE INDEX "AudioAsset_moduleId_key" ON "AudioAsset"("moduleId");

-- CreateIndex
CREATE INDEX "AudioAsset_status_createdAt_idx" ON "AudioAsset"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerEnrollment_userId_releaseId_key" ON "LearnerEnrollment"("userId", "releaseId");

-- CreateIndex
CREATE INDEX "LearnerEnrollment_userId_isActive_idx" ON "LearnerEnrollment"("userId", "isActive");

-- CreateIndex
CREATE INDEX "LearnerEnrollment_releaseId_isActive_idx" ON "LearnerEnrollment"("releaseId", "isActive");

-- CreateIndex
CREATE INDEX "AdminActionLog_actorUserId_createdAt_idx" ON "AdminActionLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_companyId_createdAt_idx" ON "AdminActionLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_actionType_idx" ON "AdminActionLog"("actionType");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRelease" ADD CONSTRAINT "LearningRelease_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRelease" ADD CONSTRAINT "LearningRelease_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningModule" ADD CONSTRAINT "LearningModule_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "LearningRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningQuizQuestion" ADD CONSTRAINT "LearningQuizQuestion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewDocument" ADD CONSTRAINT "InterviewDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewDocument" ADD CONSTRAINT "InterviewDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "LearningRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioAsset" ADD CONSTRAINT "AudioAsset_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearningModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerEnrollment" ADD CONSTRAINT "LearnerEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerEnrollment" ADD CONSTRAINT "LearnerEnrollment_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "LearningRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
