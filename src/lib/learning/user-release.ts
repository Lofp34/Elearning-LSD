import { prisma } from "@/lib/prisma";
import { isNewContentEngineEnabled } from "@/lib/feature-flags";

export type ActiveLearnerRelease = {
  enrollmentId: string;
  releaseId: string;
  version: number;
  companyId: string;
};

export async function getActiveLearnerRelease(userId: string): Promise<ActiveLearnerRelease | null> {
  if (!isNewContentEngineEnabled()) return null;

  const enrollment = await prisma.learnerEnrollment.findFirst({
    where: {
      userId,
      isActive: true,
      release: { status: "PUBLISHED" },
    },
    orderBy: { assignedAt: "desc" },
    include: {
      release: {
        select: {
          id: true,
          version: true,
          companyId: true,
        },
      },
    },
  });

  if (!enrollment) return null;

  return {
    enrollmentId: enrollment.id,
    releaseId: enrollment.release.id,
    version: enrollment.release.version,
    companyId: enrollment.release.companyId,
  };
}

export async function getLatestPublishedReleaseForCompany(companyId: string) {
  return prisma.learningRelease.findFirst({
    where: { companyId, status: "PUBLISHED" },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      companyId: true,
    },
  });
}

export async function ensureUserEnrollmentOnRelease(
  userId: string,
  releaseId: string,
  replaceActive = false
) {
  return prisma.$transaction(async (tx) => {
    if (replaceActive) {
      await tx.learnerEnrollment.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });
    }

    return tx.learnerEnrollment.upsert({
      where: { userId_releaseId: { userId, releaseId } },
      update: {
        isActive: true,
        assignedAt: new Date(),
      },
      create: {
        userId,
        releaseId,
        isActive: true,
      },
    });
  });
}
