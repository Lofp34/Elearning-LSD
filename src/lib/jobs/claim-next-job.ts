import { prisma } from "@/lib/prisma";

export async function claimNextGenerationJob(workerId: string) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const nextJob = await tx.generationJob.findFirst({
      where: {
        status: { in: ["PENDING", "RETRYING"] },
        OR: [{ nextRunAt: null }, { nextRunAt: { lte: now } }],
      },
      orderBy: [{ createdAt: "asc" }],
    });

    if (!nextJob) return null;

    return tx.generationJob.update({
      where: { id: nextJob.id },
      data: {
        status: "RUNNING",
        lockedAt: now,
        lockedBy: workerId,
        attempts: { increment: 1 },
      },
    });
  });
}
