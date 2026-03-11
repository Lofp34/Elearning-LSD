import { prisma } from "@/lib/prisma";

export type ReleaseModuleSnapshot = {
  id: string;
  title: string;
  partKey: string;
  contentKey: string;
  orderIndex: number;
  blobPath: string;
  listenPercentMax: number;
  completed: boolean;
  quizBestScore: number | null;
  quizBestTotal: number | null;
  quizPassed: boolean;
  lastActivityAt: Date | null;
};

export async function getLearnerReleaseSnapshot(userId: string, releaseId: string) {
  const [modules, progress] = await Promise.all([
    prisma.learningModule.findMany({
      where: {
        releaseId,
        moduleType: "CORE",
        audioAsset: {
          is: {
            status: "GENERATED",
          },
        },
      },
      orderBy: { orderIndex: "asc" },
      include: {
        audioAsset: {
          select: {
            blobPath: true,
          },
        },
      },
    }),
    prisma.learnerModuleProgress.findMany({
      where: {
        userId,
        releaseId,
      },
      select: {
        moduleId: true,
        listenPercentMax: true,
        completedAt: true,
        quizBestScore: true,
        quizBestTotal: true,
        quizPassed: true,
        lastListenedAt: true,
        quizPassedAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const progressMap = new Map(
    progress.map((item) => [
      item.moduleId,
      item,
    ])
  );

  return modules.map((module): ReleaseModuleSnapshot => {
    const item = progressMap.get(module.id);
    const lastActivityCandidates = [
      item?.lastListenedAt ?? null,
      item?.quizPassedAt ?? null,
      item?.updatedAt ?? null,
    ].filter((value): value is Date => value instanceof Date);

    return {
      id: module.id,
      title: module.title,
      partKey: module.partKey,
      contentKey: module.contentKey,
      orderIndex: module.orderIndex,
      blobPath: module.audioAsset?.blobPath ?? "",
      listenPercentMax: item?.listenPercentMax ?? 0,
      completed: Boolean(item?.completedAt),
      quizBestScore: item?.quizBestScore ?? null,
      quizBestTotal: item?.quizBestTotal ?? null,
      quizPassed: item?.quizPassed ?? false,
      lastActivityAt:
        lastActivityCandidates.length > 0
          ? new Date(Math.max(...lastActivityCandidates.map((value) => value.getTime())))
          : null,
    };
  });
}
