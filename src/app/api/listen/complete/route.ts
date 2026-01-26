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
    if (!slug) {
      return NextResponse.json({ error: "Slug manquant." }, { status: 400 });
    }

    await prisma.listenEvent.upsert({
      where: { userId_audioSlug: { userId, audioSlug: slug } },
      update: {},
      create: { userId, audioSlug: slug },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
