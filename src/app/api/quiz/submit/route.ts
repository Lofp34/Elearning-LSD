import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { isNewContentEngineEnabled } from "@/lib/feature-flags";
import { buildTrackingAudioSlug } from "@/lib/learning/slug";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ag_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    const userId = payload.sub;
    if (!userId) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const body = await request.json();
    const rawSlug = String(body.slug ?? "").trim();
    const releaseId = typeof body.releaseId === "string" ? body.releaseId.trim() : "";
    const moduleId = typeof body.moduleId === "string" ? body.moduleId.trim() : "";
    const score = Number(body.score ?? 0);
    const total = Number(body.total ?? 0);

    if ((!rawSlug && !(releaseId && moduleId)) || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
    }

    const passed = score / total >= 0.7;
    let slug = rawSlug;
    let trackedReleaseId: string | null = null;
    let trackedModuleId: string | null = null;

    if (releaseId || moduleId) {
      if (!releaseId || !moduleId) {
        return NextResponse.json(
          { error: "releaseId et moduleId doivent etre fournis ensemble." },
          { status: 400 }
        );
      }

      const learningModule = await prisma.learningModule.findUnique({
        where: { id: moduleId },
        include: {
          release: {
            select: { id: true, version: true, status: true },
          },
        },
      });

      if (!learningModule || learningModule.releaseId !== releaseId) {
        return NextResponse.json({ error: "Module/release invalide." }, { status: 400 });
      }

      if (isNewContentEngineEnabled()) {
        const enrollment = await prisma.learnerEnrollment.findFirst({
          where: {
            userId,
            releaseId,
            isActive: true,
            release: { status: "PUBLISHED" },
          },
          select: { id: true },
        });
        if (!enrollment) {
          return NextResponse.json(
            { error: "Aucune assignation active sur cette release." },
            { status: 403 }
          );
        }
      }

      slug =
        rawSlug || buildTrackingAudioSlug(learningModule.release.version, learningModule.contentKey);
      trackedReleaseId = releaseId;
      trackedModuleId = moduleId;
    }

    await prisma.quizAttempt.create({
      data: {
        userId,
        audioSlug: slug,
        releaseId: trackedReleaseId,
        moduleId: trackedModuleId,
        score,
        total,
        passed,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        type: "QUIZ_SUBMIT",
        audioSlug: slug,
        score,
        total,
        passed,
      },
    });

    return NextResponse.json({ ok: true, passed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
