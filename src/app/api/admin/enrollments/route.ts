import { NextResponse } from "next/server";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const releaseId = typeof body.releaseId === "string" ? body.releaseId : "";
  const replaceActive = Boolean(body.replaceActive);

  if (!userId || !releaseId) {
    return NextResponse.json({ error: "userId et releaseId sont obligatoires." }, { status: 400 });
  }

  const release = await prisma.learningRelease.findUnique({
    where: { id: releaseId },
    select: { id: true, companyId: true, version: true, status: true },
  });

  if (!release) {
    return NextResponse.json({ error: "Release introuvable." }, { status: 404 });
  }

  if (release.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Seules les releases publiees peuvent etre assignees." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true, company: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  const allowed = await canAccessCompany(authUser, release.companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  if (user.companyId && user.companyId !== release.companyId) {
    return NextResponse.json(
      { error: "Utilisateur et release appartiennent a des societes differentes." },
      { status: 400 }
    );
  }

  if (replaceActive) {
    await prisma.learnerEnrollment.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  const enrollment = await prisma.learnerEnrollment.upsert({
    where: { userId_releaseId: { userId, releaseId } },
    update: { isActive: true, assignedAt: new Date() },
    create: {
      userId,
      releaseId,
      isActive: true,
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId: release.companyId,
      actionType: "ENROLLMENT_ASSIGNED",
      metadata: {
        targetUserId: user.id,
        targetEmail: user.email,
        releaseId: release.id,
        version: release.version,
        replaceActive,
      },
    },
  });

  return NextResponse.json({ ok: true, enrollment }, { status: 201 });
}
