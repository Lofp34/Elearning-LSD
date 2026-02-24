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
    if (!rawSlug && !(releaseId && moduleId)) {
      return NextResponse.json({ error: "Slug manquant." }, { status: 400 });
    }

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

    const existing = await prisma.listenEvent.findUnique({
      where: { userId_audioSlug: { userId, audioSlug: slug } },
    });

    if (!existing) {
      await prisma.listenEvent.create({
        data: {
          userId,
          audioSlug: slug,
          releaseId: trackedReleaseId,
          moduleId: trackedModuleId,
        },
      });
      await prisma.activityLog.create({
        data: {
          userId,
          type: "LISTEN_COMPLETE",
          audioSlug: slug,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
