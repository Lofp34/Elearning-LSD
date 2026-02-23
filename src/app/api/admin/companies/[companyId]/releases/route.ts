import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { createDraftRelease, seedDraftModules } from "@/lib/pipeline/generate-company-release";
import { prisma } from "@/lib/prisma";

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

  const releases = await prisma.learningRelease.findMany({
    where: { companyId },
    orderBy: { version: "desc" },
    include: {
      _count: {
        select: {
          modules: true,
          generationJobs: true,
          learnerEnrollments: true,
        },
      },
    },
  });

  return NextResponse.json({ releases });
}

export async function POST(
  request: Request,
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

  const body = await request.json().catch(() => ({}));
  const startPipeline = Boolean(body.startPipeline);

  const release = await createDraftRelease(companyId, authUser.id);
  await seedDraftModules(release.id);

  if (startPipeline) {
    await prisma.generationJob.create({
      data: {
        companyId,
        releaseId: release.id,
        jobType: "FULL_PIPELINE",
        status: "PENDING",
        step: "UPLOADED",
        payload: {},
      },
    });
  }

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId,
      actionType: "RELEASE_DRAFT_CREATED",
      metadata: {
        releaseId: release.id,
        version: release.version,
        startPipeline,
      },
    },
  });

  return NextResponse.json({ ok: true, release }, { status: 201 });
}
