import { prisma } from "@/lib/prisma";

export const LISTEN_COMPLETION_THRESHOLD = 90;

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function recordListenProgress(input: {
  userId: string;
  releaseId: string;
  moduleId: string;
  audioSlug: string;
  listenPercent: number;
}) {
  const listenPercent = clampPercent(input.listenPercent);
  const listenedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const current = await tx.learnerModuleProgress.findUnique({
      where: {
        userId_releaseId_moduleId: {
          userId: input.userId,
          releaseId: input.releaseId,
          moduleId: input.moduleId,
        },
      },
      select: {
        id: true,
        listenPercentMax: true,
        completedAt: true,
      },
    });

    const nextMax = Math.max(current?.listenPercentMax ?? 0, listenPercent);
    const completedAt =
      current?.completedAt ??
      (nextMax >= LISTEN_COMPLETION_THRESHOLD ? listenedAt : null);

    const progress = await tx.learnerModuleProgress.upsert({
      where: {
        userId_releaseId_moduleId: {
          userId: input.userId,
          releaseId: input.releaseId,
          moduleId: input.moduleId,
        },
      },
      update: {
        listenPercentMax: nextMax,
        lastListenedAt: listenedAt,
        completedAt,
      },
      create: {
        userId: input.userId,
        releaseId: input.releaseId,
        moduleId: input.moduleId,
        listenPercentMax: nextMax,
        lastListenedAt: listenedAt,
        completedAt,
      },
    });

    if (nextMax >= LISTEN_COMPLETION_THRESHOLD) {
      await tx.listenEvent.upsert({
        where: {
          userId_audioSlug: {
            userId: input.userId,
            audioSlug: input.audioSlug,
          },
        },
        update: {},
        create: {
          userId: input.userId,
          audioSlug: input.audioSlug,
          releaseId: input.releaseId,
          moduleId: input.moduleId,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: input.userId,
          type: "LISTEN_COMPLETE",
          audioSlug: input.audioSlug,
        },
      });
    }

    return progress;
  });
}

export async function recordQuizAttempt(input: {
  userId: string;
  releaseId: string;
  moduleId: string;
  audioSlug: string;
  score: number;
  total: number;
}) {
  const score = Math.max(0, Math.round(input.score));
  const total = Math.max(1, Math.round(input.total));
  const passed = score / total >= 0.7;
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.create({
      data: {
        userId: input.userId,
        audioSlug: input.audioSlug,
        releaseId: input.releaseId,
        moduleId: input.moduleId,
        score,
        total,
        passed,
      },
    });

    const current = await tx.learnerModuleProgress.findUnique({
      where: {
        userId_releaseId_moduleId: {
          userId: input.userId,
          releaseId: input.releaseId,
          moduleId: input.moduleId,
        },
      },
      select: {
        id: true,
        quizBestScore: true,
        quizBestTotal: true,
        quizPassed: true,
        quizPassedAt: true,
      },
    });

    const currentRatio =
      current?.quizBestScore !== null &&
      current?.quizBestScore !== undefined &&
      current?.quizBestTotal
        ? current.quizBestScore / current.quizBestTotal
        : -1;
    const nextRatio = score / total;
    const shouldReplaceBest = nextRatio >= currentRatio;

    await tx.learnerModuleProgress.upsert({
      where: {
        userId_releaseId_moduleId: {
          userId: input.userId,
          releaseId: input.releaseId,
          moduleId: input.moduleId,
        },
      },
      update: {
        ...(shouldReplaceBest
          ? {
              quizBestScore: score,
              quizBestTotal: total,
            }
          : {}),
        quizPassed: current?.quizPassed || passed,
        quizPassedAt: current?.quizPassedAt ?? (passed ? now : null),
      },
      create: {
        userId: input.userId,
        releaseId: input.releaseId,
        moduleId: input.moduleId,
        quizBestScore: score,
        quizBestTotal: total,
        quizPassed: passed,
        quizPassedAt: passed ? now : null,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: input.userId,
        type: "QUIZ_SUBMIT",
        audioSlug: input.audioSlug,
        score,
        total,
        passed,
      },
    });

    return attempt;
  });
}
