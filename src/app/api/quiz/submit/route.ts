import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

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
    const slug = String(body.slug ?? "");
    const score = Number(body.score ?? 0);
    const total = Number(body.total ?? 0);

    if (!slug || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
    }

    const passed = score / total >= 0.7;

    await prisma.quizAttempt.create({
      data: {
        userId,
        audioSlug: slug,
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
