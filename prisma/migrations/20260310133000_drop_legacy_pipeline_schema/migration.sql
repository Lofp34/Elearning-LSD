ALTER TABLE "Company"
DROP COLUMN IF EXISTS "femaleVoiceId",
DROP COLUMN IF EXISTS "femaleVoiceName",
DROP COLUMN IF EXISTS "maleVoiceId",
DROP COLUMN IF EXISTS "maleVoiceName";

ALTER TABLE "LearningRelease"
DROP COLUMN IF EXISTS "analysisSummary";

ALTER TABLE "LearningModule"
DROP COLUMN IF EXISTS "voiceSlot",
DROP COLUMN IF EXISTS "reviewStatus",
DROP COLUMN IF EXISTS "reviewedAt",
DROP COLUMN IF EXISTS "reviewedById",
DROP COLUMN IF EXISTS "reviewComment";

DROP TABLE IF EXISTS "InterviewDocument";
DROP TABLE IF EXISTS "GenerationJob";

DROP TYPE IF EXISTS "InterviewStatus";
DROP TYPE IF EXISTS "GenerationJobType";
DROP TYPE IF EXISTS "GenerationJobStatus";
DROP TYPE IF EXISTS "ModuleReviewStatus";
DROP TYPE IF EXISTS "VoiceSlot";
