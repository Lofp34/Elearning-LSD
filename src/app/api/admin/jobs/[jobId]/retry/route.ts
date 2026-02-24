import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { jobId } = await params;
  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      companyId: true,
      releaseId: true,
      status: true,
      jobType: true,
      attempts: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job introuvable." }, { status: 404 });
  }

  const allowed = await canAccessCompany(authUser, job.companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  if (job.status !== "FAILED") {
    return NextResponse.json(
      { error: "Seuls les jobs FAILED peuvent etre relances." },
      { status: 400 }
    );
  }

  const updated = await prisma.generationJob.update({
    where: { id: job.id },
    data: {
      status: "PENDING",
      step: "RETRY_REQUESTED",
      lastError: null,
      lockedAt: null,
      lockedBy: null,
      nextRunAt: new Date(),
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId: job.companyId,
      actionType: "JOB_RETRY_REQUESTED",
      metadata: {
        jobId: job.id,
        releaseId: job.releaseId,
        jobType: job.jobType,
        attempts: job.attempts,
      },
    },
  });

  return NextResponse.json({ ok: true, job: updated });
}
