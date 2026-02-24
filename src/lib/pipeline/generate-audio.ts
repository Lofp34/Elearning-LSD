import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { resolveVoiceId } from "@/lib/pipeline/voice-assignment";
import { synthesizeWithElevenLabs } from "@/lib/ai/elevenlabs-client";

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function synthesizeWithRetry(text: string, voiceId: string, retries = 3) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await synthesizeWithElevenLabs({ text, voiceId });
    } catch (error) {
      lastError = error as Error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 600));
    }
  }

  throw lastError ?? new Error("ElevenLabs synthesis failed.");
}

export async function generateAudioForRelease(releaseId: string) {
  const release = await prisma.learningRelease.findUnique({
    where: { id: releaseId },
    include: {
      company: {
        select: {
          id: true,
          slug: true,
          femaleVoiceId: true,
          maleVoiceId: true,
        },
      },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          audioAsset: true,
        },
      },
    },
  });

  if (!release) {
    throw new Error("Release not found.");
  }

  if (!release.company.femaleVoiceId || !release.company.maleVoiceId) {
    throw new Error("Company voice pair is not configured.");
  }

  if (release.company.femaleVoiceId === release.company.maleVoiceId) {
    throw new Error("Company voice pair must contain distinct voice IDs.");
  }

  const notApproved = release.modules.filter((moduleItem) => moduleItem.reviewStatus !== "APPROVED");
  if (notApproved.length > 0) {
    throw new Error("All modules must be APPROVED before generating audio.");
  }

  let generated = 0;
  let skipped = 0;

  for (const moduleItem of release.modules) {
    if (moduleItem.audioAsset?.status === "GENERATED") {
      skipped += 1;
      continue;
    }

    if (moduleItem.scriptText.trim().length === 0) {
      throw new Error(`Module ${moduleItem.contentKey} has no script text.`);
    }

    const voiceId = resolveVoiceId(moduleItem.orderIndex, {
      femaleVoiceId: release.company.femaleVoiceId,
      maleVoiceId: release.company.maleVoiceId,
    });

    try {
      const audio = await synthesizeWithRetry(moduleItem.scriptText, voiceId, 3);
      const safeChapter = sanitizeSegment(moduleItem.chapterKey);
      const filename = `${String(moduleItem.orderIndex).padStart(2, "0")}-${safeChapter}.mp3`;
      const pathname = `audio/companies/${release.company.slug}/releases/v${release.version}/${filename}`;

      const blob = await put(pathname, Buffer.from(audio), {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: "audio/mpeg",
      });

      await prisma.audioAsset.upsert({
        where: { moduleId: moduleItem.id },
        update: {
          blobPath: blob.url,
          provider: "elevenlabs",
          providerVoiceId: voiceId,
          status: "GENERATED",
          errorMessage: null,
        },
        create: {
          moduleId: moduleItem.id,
          blobPath: blob.url,
          provider: "elevenlabs",
          providerVoiceId: voiceId,
          status: "GENERATED",
        },
      });

      generated += 1;
    } catch (error) {
      await prisma.audioAsset.upsert({
        where: { moduleId: moduleItem.id },
        update: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message.slice(0, 2000) : "Audio generation failed",
        },
        create: {
          moduleId: moduleItem.id,
          blobPath: "",
          provider: "elevenlabs",
          providerVoiceId: voiceId,
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message.slice(0, 2000) : "Audio generation failed",
        },
      });

      throw error;
    }
  }

  return { generated, skipped, total: release.modules.length };
}
