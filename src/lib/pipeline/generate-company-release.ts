import { prisma } from "@/lib/prisma";
import { BASE_MODULES } from "@/lib/learning/base-structure";
import { resolveVoiceSlot } from "@/lib/pipeline/voice-assignment";

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

  const payload = BASE_MODULES.map((module) => ({
    releaseId,
    partKey: module.partKey,
    chapterKey: module.chapterKey,
    title: module.title,
    orderIndex: module.orderIndex,
    scriptText: "",
    voiceSlot: resolveVoiceSlot(module.orderIndex),
  }));

  if (payload.length === 0) return;

  await prisma.learningModule.createMany({
    data: payload,
    skipDuplicates: true,
  });
}
