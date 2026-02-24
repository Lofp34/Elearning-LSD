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
      company: {
        select: {
          id: true,
          femaleVoiceId: true,
          maleVoiceId: true,
        },
      },
      modules: {
        include: {
          audioAsset: {
            select: {
              status: true,
            },
          },
          quizQuestions: {
            select: { id: true },
          },
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

  if (!release.company.femaleVoiceId || !release.company.maleVoiceId) {
    return NextResponse.json(
      { error: "Configurez les 2 voix (feminine et masculine) avant la generation audio." },
      { status: 400 }
    );
  }

  if (release.company.femaleVoiceId === release.company.maleVoiceId) {
    return NextResponse.json(
      { error: "Les voix feminine et masculine doivent etre distinctes." },
      { status: 400 }
    );
  }

  const notApproved = release.modules.filter((module) => module.reviewStatus !== "APPROVED").length;
  const invalidQuiz = release.modules.filter((module) => module.quizQuestions.length !== 5).length;
  const emptyScripts = release.modules.filter((module) => module.scriptText.trim().length === 0).length;

  if (notApproved > 0 || invalidQuiz > 0 || emptyScripts > 0) {
    return NextResponse.json(
      {
        error: "Release incomplete pour generation audio.",
        details: {
          notApproved,
          invalidQuiz,
          emptyScripts,
        },
      },
      { status: 400 }
    );
  }

  const activeJob = await prisma.generationJob.findFirst({
    where: {
      releaseId,
      jobType: "GENERATE_AUDIO",
      status: { in: ["PENDING", "RUNNING", "RETRYING"] },
    },
    select: { id: true, status: true, step: true },
  });

  if (activeJob) {
    return NextResponse.json(
      { error: "Un job audio est deja actif pour cette release.", activeJob },
      { status: 409 }
    );
  }

  const job = await prisma.generationJob.create({
    data: {
      companyId: release.companyId,
      releaseId,
      jobType: "GENERATE_AUDIO",
      status: "PENDING",
      step: "AUDIO_PENDING",
      payload: {
        releaseVersion: release.version,
      },
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId: release.companyId,
      actionType: "AUDIO_GENERATION_REQUESTED",
      metadata: {
        jobId: job.id,
        releaseId,
        version: release.version,
      },
    },
  });

  return NextResponse.json({ ok: true, job }, { status: 201 });
}
