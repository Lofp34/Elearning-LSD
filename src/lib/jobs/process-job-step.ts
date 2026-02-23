import { prisma } from "@/lib/prisma";

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

  // V1 du runner: skeleton operationnel.
  // Les etapes de generation detaillees seront ajoutees par type de job.
  switch (job.jobType) {
    case "FULL_PIPELINE":
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          step: "REVIEW_READY",
          lockedAt: null,
          lockedBy: null,
          lastError: null,
        },
      });
      break;
    case "ANALYZE_INTERVIEWS":
    case "GENERATE_SCRIPTS":
    case "GENERATE_QUIZZES":
    case "GENERATE_AUDIO":
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          step: "DONE",
          lockedAt: null,
          lockedBy: null,
          lastError: null,
        },
      });
      break;
    default:
      throw new Error(`Type de job non supporte: ${job.jobType}`);
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
