import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { BASE_MODULES } from "@/lib/learning/base-structure";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ releaseId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { releaseId } = await params;
  const release = await prisma.learningRelease.findUnique({
    where: { id: releaseId },
    include: {
      modules: {
        include: {
          quizQuestions: true,
          audioAsset: true,
        },
      },
    },
  });

  if (!release) {
    return NextResponse.json({ error: "Release introuvable." }, { status: 404 });
  }

  const allowed = await canAccessCompany(authUser, release.companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  const missingScript = release.modules.filter((module) => module.scriptText.trim().length === 0).length;
  const missingAudio = release.modules.filter((module) => module.audioAsset?.status !== "GENERATED").length;
  const invalidQuiz = release.modules.filter((module) => module.quizQuestions.length !== 5).length;
  const notApproved = release.modules.filter((module) => module.reviewStatus !== "APPROVED").length;

  if (release.modules.length === 0) {
    return NextResponse.json({ error: "Release vide." }, { status: 400 });
  }

  if (release.modules.length !== BASE_MODULES.length) {
    return NextResponse.json(
      {
        error: "Release incomplete: nombre de modules invalide.",
        details: {
          expected: BASE_MODULES.length,
          actual: release.modules.length,
        },
      },
      { status: 400 }
    );
  }

  const invalidScriptLength = release.modules.filter((module) => {
    const length = module.scriptText.trim().length;
    return length < 450 || length > 2200;
  }).length;

  const invalidQuizShape = release.modules.filter((module) =>
    module.quizQuestions.some((question) => {
      const options = Array.isArray(question.options) ? question.options : [];
      const nonEmptyOptions =
        options.length === 4 &&
        options.every((option) => typeof option === "string" && option.trim().length > 0);
      const validAnswerIndex = Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex <= 3;
      return !nonEmptyOptions || !validAnswerIndex || question.question.trim().length === 0;
    })
  ).length;

  if (
    missingScript > 0 ||
    missingAudio > 0 ||
    invalidQuiz > 0 ||
    invalidScriptLength > 0 ||
    invalidQuizShape > 0 ||
    notApproved > 0
  ) {
    return NextResponse.json(
      {
        error: "Release incomplete pour publication.",
        details: {
          missingScript,
          missingAudio,
          invalidQuiz,
          invalidScriptLength,
          invalidQuizShape,
          notApproved,
        },
      },
      { status: 400 }
    );
  }

  const updated = await prisma.learningRelease.update({
    where: { id: release.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId: release.companyId,
      actionType: "RELEASE_PUBLISHED",
      metadata: {
        releaseId: release.id,
        version: release.version,
      },
    },
  });

  return NextResponse.json({ ok: true, release: updated });
}
