import { prisma } from "@/lib/prisma";
import { getBaseModuleContent } from "@/lib/learning/base-content";
import { BASE_MODULES, getModuleContentKey } from "@/lib/learning/base-structure";

export async function createDraftRelease(companyId: string, createdById: string | null) {
  const latest = await prisma.learningRelease.findFirst({
    where: { companyId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return prisma.learningRelease.create({
    data: {
      companyId,
      createdById,
      version: (latest?.version ?? 0) + 1,
      status: "DRAFT",
    },
  });
}

export async function seedDraftModules(releaseId: string) {
  if (!releaseId) throw new Error("releaseId is required");

  const existing = await prisma.learningModule.count({
    where: { releaseId },
  });
  if (existing > 0) return;

  await prisma.$transaction(async (tx) => {
    for (const baseModule of BASE_MODULES) {
      const contentKey = getModuleContentKey(baseModule.partKey, baseModule.chapterKey);
      const baseContent = getBaseModuleContent(contentKey);

      await tx.learningModule.create({
        data: {
          releaseId,
          partKey: baseModule.partKey,
          chapterKey: baseModule.chapterKey,
          contentKey,
          title: baseModule.title,
          orderIndex: baseModule.orderIndex,
          moduleType: "CORE",
          scriptText: baseContent.scriptText,
          quizQuestions: {
            createMany: {
              data: baseContent.quizQuestions.map((question, index) => ({
                orderIndex: index + 1,
                question: question.question,
                options: question.options,
                answerIndex: question.answerIndex,
              })),
            },
          },
        },
      });
    }
  });
}
