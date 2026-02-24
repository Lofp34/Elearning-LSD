import { prisma } from "@/lib/prisma";
import { executeFullPipelineJob } from "@/lib/pipeline/full-pipeline";
import { generateAudioForRelease } from "@/lib/pipeline/generate-audio";

export async function processGenerationJob(jobId: string) {
  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      jobType: true,
      releaseId: true,
      companyId: true,
      attempts: true,
    },
  });

  if (!job) {
    throw new Error("Job introuvable.");
  }

  if (job.status !== "RUNNING") {
    throw new Error("Job non claim.");
  }

  try {
    switch (job.jobType) {
      case "FULL_PIPELINE":
        await executeFullPipelineJob(job.id);
        break;
      case "GENERATE_AUDIO":
        if (!job.releaseId) throw new Error("GENERATE_AUDIO job requires releaseId.");
        await prisma.generationJob.update({
          where: { id: job.id },
          data: { step: "AUDIO_GENERATING" },
        });
        await generateAudioForRelease(job.releaseId);
        await prisma.generationJob.update({
          where: { id: job.id },
          data: { step: "AUDIO_READY" },
        });
        break;
      case "ANALYZE_INTERVIEWS":
      case "GENERATE_SCRIPTS":
      case "GENERATE_QUIZZES":
        throw new Error(`Job type ${job.jobType} is deprecated. Use FULL_PIPELINE.`);
      default:
        throw new Error(`Type de job non supporte: ${job.jobType}`);
    }

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        lockedAt: null,
        lockedBy: null,
        lastError: null,
        nextRunAt: null,
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function failGenerationJob(jobId: string, errorMessage: string, retryDelayMs = 0) {
  const now = new Date();
  const nextRunAt = retryDelayMs > 0 ? new Date(now.getTime() + retryDelayMs) : null;

  await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      status: nextRunAt ? "RETRYING" : "FAILED",
      lastError: errorMessage.slice(0, 2000),
      lockedAt: null,
      lockedBy: null,
      nextRunAt,
    },
  });
}
