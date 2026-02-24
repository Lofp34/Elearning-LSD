import { prisma } from "@/lib/prisma";

export async function claimNextGenerationJob(workerId: string, companyId?: string) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const staleRunningCutoff = new Date(now.getTime() - 15 * 60_000);

    await tx.generationJob.updateMany({
      where: {
        status: "RUNNING",
        lockedAt: { lt: staleRunningCutoff },
        ...(companyId ? { companyId } : {}),
      },
      data: {
        status: "RETRYING",
        lockedAt: null,
        lockedBy: null,
        nextRunAt: now,
      },
    });

    const nextJob = await tx.generationJob.findFirst({
      where: {
        ...(companyId ? { companyId } : {}),
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
