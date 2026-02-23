import { NextResponse } from "next/server";
import { getRequiredEnv } from "@/lib/env";
import { claimNextGenerationJob } from "@/lib/jobs/claim-next-job";
import { failGenerationJob, processGenerationJob } from "@/lib/jobs/process-job-step";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = getRequiredEnv("CRON_SECRET");
  const headerSecret = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return headerSecret === secret || bearer === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerId = `runner-${Date.now()}`;
  const job = await claimNextGenerationJob(workerId);
  if (!job) {
    return NextResponse.json({ ok: true, processed: 0, message: "No pending jobs." });
  }

  try {
    await processGenerationJob(job.id);
    return NextResponse.json({
      ok: true,
      processed: 1,
      jobId: job.id,
      status: "COMPLETED",
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
        status: retryDelayMs > 0 ? "RETRYING" : "FAILED",
        error: message,
      },
      { status: 500 }
    );
  }
}
