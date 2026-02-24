import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { parseReleaseModuleSlug, buildTrackingAudioSlug } from "@/lib/learning/slug";
import { isNewContentEngineEnabled } from "@/lib/feature-flags";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = (await cookies()).get("ag_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  let userId: string | null = null;
  try {
    const payload = await verifySessionToken(token);
    userId = typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    userId = null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const parsed = parseReleaseModuleSlug(slug);

  if (!parsed) {
    return NextResponse.json({ error: "Slug module invalide." }, { status: 400 });
  }

  const learningModule = await prisma.learningModule.findFirst({
    where: {
      releaseId: parsed.releaseId,
      contentKey: parsed.contentKey,
    },
    include: {
      release: {
        select: {
          id: true,
          version: true,
          status: true,
        },
      },
      quizQuestions: {
        orderBy: { orderIndex: "asc" },
        select: {
          orderIndex: true,
          question: true,
          options: true,
          answerIndex: true,
        },
      },
    },
  });

  if (!learningModule) {
    return NextResponse.json({ error: "Module introuvable." }, { status: 404 });
  }

  if (learningModule.release.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Release non publiee." }, { status: 400 });
  }

  if (isNewContentEngineEnabled()) {
    const enrollment = await prisma.learnerEnrollment.findFirst({
      where: {
        userId,
        releaseId: learningModule.release.id,
        isActive: true,
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Aucune assignation active pour ce module." }, { status: 403 });
    }
  }

  if (learningModule.quizQuestions.length !== 5) {
    return NextResponse.json({ error: "Quiz incomplet pour ce module." }, { status: 400 });
  }

  return NextResponse.json({
    quiz: {
      title: learningModule.title,
      releaseId: learningModule.release.id,
      moduleId: learningModule.id,
      trackingSlug: buildTrackingAudioSlug(learningModule.release.version, learningModule.contentKey),
      questions: learningModule.quizQuestions.map((question) => ({
        question: question.question,
        options: Array.isArray(question.options)
          ? question.options.map((item) => String(item))
          : ["", "", "", ""],
        answerIndex: question.answerIndex,
      })),
    },
  });
}
