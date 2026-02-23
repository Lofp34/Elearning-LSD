import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
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
  const missingAudio = release.modules.filter((module) => !module.audioAsset).length;
  const invalidQuiz = release.modules.filter((module) => module.quizQuestions.length < 5).length;

  if (missingScript > 0 || missingAudio > 0 || invalidQuiz > 0) {
    return NextResponse.json(
      {
        error: "Release incomplete pour publication.",
        details: {
          missingScript,
          missingAudio,
          invalidQuiz,
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
