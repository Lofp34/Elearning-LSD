import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ releaseId: string; moduleId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { releaseId, moduleId } = await params;

  const learningModule = await prisma.learningModule.findUnique({
    where: { id: moduleId },
    include: {
      release: {
        include: {
          company: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      },
      audioAsset: true,
    },
  });

  if (!learningModule || learningModule.releaseId !== releaseId) {
    return NextResponse.json({ error: "Module introuvable." }, { status: 404 });
  }

  const allowed = await canAccessCompany(authUser, learningModule.release.companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier MP3 manquant." }, { status: 400 });
  }

  const contentType = file.type || "audio/mpeg";
  if (!contentType.startsWith("audio/")) {
    return NextResponse.json({ error: "Le fichier doit etre un audio." }, { status: 400 });
  }

  const extension = file.name.toLowerCase().endsWith(".mp3") ? "mp3" : "bin";
  const pathname = [
    "audio",
    "companies",
    learningModule.release.company.slug,
    "releases",
    `v${learningModule.release.version}`,
    `${String(learningModule.orderIndex).padStart(2, "0")}-${learningModule.contentKey}.${extension}`,
  ].join("/");

  const arrayBuffer = await file.arrayBuffer();
  const blob = await put(pathname, new Blob([arrayBuffer], { type: contentType }), {
    access: "public",
  });

  const audioAsset = await prisma.audioAsset.upsert({
    where: { moduleId },
    update: {
      blobPath: blob.url,
      provider: "manual-upload",
      providerVoiceId: "manual",
      status: "GENERATED",
      errorMessage: null,
    },
    create: {
      moduleId,
      blobPath: blob.url,
      provider: "manual-upload",
      providerVoiceId: "manual",
      status: "GENERATED",
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId: learningModule.release.companyId,
      actionType: "MODULE_AUDIO_UPLOADED",
      metadata: {
        releaseId,
        moduleId,
        blobPath: blob.url,
      },
    },
  });

  return NextResponse.json({ ok: true, audioAsset });
}
