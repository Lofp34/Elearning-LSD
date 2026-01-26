import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, sessionCookieOptions, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string; password?: string } = {};

  if (request.headers.get("content-type")?.includes("application/json")) {
    body = await request.json();
  } else {
    const formData = await request.formData();
    body = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email ou mot de passe manquant." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ value: token, ...sessionCookieOptions() });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Configuration serveur manquante (DB ou AUTH_SECRET)." },
      { status: 500 }
    );
  }
}
