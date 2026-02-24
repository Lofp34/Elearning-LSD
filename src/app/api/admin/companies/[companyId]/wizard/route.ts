import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { companyId } = await params;
  const allowed = await canAccessCompany(authUser, companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      femaleVoiceId: true,
      femaleVoiceName: true,
      maleVoiceId: true,
      maleVoiceName: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Societe introuvable." }, { status: 404 });
  }

  const [interviewStats, latestDraftRelease, latestPublishedRelease, jobs] = await Promise.all([
    prisma.interviewDocument.groupBy({
      by: ["status"],
      where: { companyId },
      _count: { _all: true },
    }),
    prisma.learningRelease.findFirst({
      where: { companyId, status: { in: ["DRAFT", "REVIEW_READY"] } },
      orderBy: { version: "desc" },
      select: {
        id: true,
        version: true,
        status: true,
        publishedAt: true,
        analysisSummary: true,
      },
    }),
    prisma.learningRelease.findFirst({
      where: { companyId, status: "PUBLISHED" },
      orderBy: { version: "desc" },
      select: { id: true, version: true, status: true, publishedAt: true },
    }),
    prisma.generationJob.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        releaseId: true,
        jobType: true,
        status: true,
        step: true,
        attempts: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const release = latestDraftRelease ?? latestPublishedRelease;
  const analysisReady = Boolean(latestDraftRelease?.analysisSummary);

  let releaseProgress = {
    totalModules: 0,
    scriptedModules: 0,
    approvedModules: 0,
    quizReadyModules: 0,
    audioReadyModules: 0,
  };

  if (release) {
    const modules = await prisma.learningModule.findMany({
      where: { releaseId: release.id },
      select: {
        id: true,
        scriptText: true,
        reviewStatus: true,
        quizQuestions: { select: { id: true } },
        audioAsset: { select: { status: true } },
      },
    });

    releaseProgress = {
      totalModules: modules.length,
      scriptedModules: modules.filter((module) => module.scriptText.trim().length > 0).length,
      approvedModules: modules.filter((module) => module.reviewStatus === "APPROVED").length,
      quizReadyModules: modules.filter((module) => module.quizQuestions.length === 5).length,
      audioReadyModules: modules.filter((module) => module.audioAsset?.status === "GENERATED").length,
    };
  }

  const interviewByStatus = new Map(interviewStats.map((row) => [row.status, row._count._all]));
  const uploaded = interviewByStatus.get("UPLOADED") ?? 0;
  const extracted = interviewByStatus.get("EXTRACTED") ?? 0;
  const failed = interviewByStatus.get("FAILED") ?? 0;

  const steps = {
    companyCreated: true,
    interviewsUploaded: uploaded + extracted + failed > 0,
    interviewsExtracted: extracted > 0,
    analysisReady,
    scriptsReady:
      releaseProgress.totalModules > 0 && releaseProgress.scriptedModules === releaseProgress.totalModules,
    reviewReady:
      releaseProgress.totalModules > 0 && releaseProgress.approvedModules === releaseProgress.totalModules,
    audioReady:
      releaseProgress.totalModules > 0 && releaseProgress.audioReadyModules === releaseProgress.totalModules,
    published: Boolean(latestPublishedRelease),
  };

  return NextResponse.json({
    company,
    release,
    latestPublishedRelease,
    interviews: {
      uploaded,
      extracted,
      failed,
      total: uploaded + extracted + failed,
    },
    releaseProgress,
    jobs,
    steps,
  });
}
