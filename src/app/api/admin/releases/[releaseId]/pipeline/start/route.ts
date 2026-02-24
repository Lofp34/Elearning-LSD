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
    select: {
      id: true,
      companyId: true,
      status: true,
      version: true,
    },
  });

  if (!release) {
    return NextResponse.json({ error: "Release introuvable." }, { status: 404 });
  }

  const allowed = await canAccessCompany(authUser, release.companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  if (release.status === "PUBLISHED") {
    return NextResponse.json(
      { error: "Release deja publiee. Creez un nouveau draft pour regenerer." },
      { status: 400 }
    );
  }

  const activeJob = await prisma.generationJob.findFirst({
    where: {
      releaseId,
      status: { in: ["PENDING", "RUNNING", "RETRYING"] },
    },
    select: { id: true, status: true, jobType: true, step: true },
  });

  if (activeJob) {
    return NextResponse.json(
      { error: "Un job est deja actif sur cette release.", activeJob },
      { status: 409 }
    );
  }

  const extractedInterviews = await prisma.interviewDocument.count({
    where: {
      companyId: release.companyId,
      status: "EXTRACTED",
      extractedText: { not: null },
    },
  });

  if (extractedInterviews === 0) {
    return NextResponse.json(
      { error: "Aucun entretien extrait disponible pour cette societe." },
      { status: 400 }
    );
  }

  const job = await prisma.generationJob.create({
    data: {
      companyId: release.companyId,
      releaseId: release.id,
      jobType: "FULL_PIPELINE",
      status: "PENDING",
      step: "UPLOADED",
      payload: { releaseVersion: release.version },
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId: release.companyId,
      actionType: "PIPELINE_START_REQUESTED",
      metadata: {
        releaseId: release.id,
        version: release.version,
        jobId: job.id,
      },
    },
  });

  return NextResponse.json({ ok: true, job }, { status: 201 });
}
