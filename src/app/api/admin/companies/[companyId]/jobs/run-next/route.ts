import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { claimNextGenerationJob } from "@/lib/jobs/claim-next-job";
import { failGenerationJob, processGenerationJob } from "@/lib/jobs/process-job-step";

export const runtime = "nodejs";

export async function POST(
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

  const workerId = `manual-${authUser.id}-${Date.now()}`;
  const job = await claimNextGenerationJob(workerId, companyId);
  if (!job) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      message: "Aucun job en attente pour cette societe.",
    });
  }

  try {
    const startedAt = Date.now();
    await processGenerationJob(job.id);
    return NextResponse.json({
      ok: true,
      processed: 1,
      jobId: job.id,
      jobType: job.jobType,
      status: "COMPLETED",
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Job execution failed";
    const retryDelayMs = job.attempts < 3 ? 60_000 : 0;
    await failGenerationJob(job.id, message, retryDelayMs);
    return NextResponse.json(
      {
        ok: false,
        processed: 1,
        jobId: job.id,
        jobType: job.jobType,
        status: retryDelayMs > 0 ? "RETRYING" : "FAILED",
        error: message,
      },
      { status: 500 }
    );
  }
}
