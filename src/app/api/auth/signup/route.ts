import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

const SUPER_ADMIN_EMAILS = new Set(["ls@laurentserre.com"]);
const ADMIN_EMAILS = new Set(["f.bricaud@auditionconseil66.fr"]);

function resolveRole(email: string) {
  if (SUPER_ADMIN_EMAILS.has(email)) return "SUPER_ADMIN";
  if (ADMIN_EMAILS.has(email)) return "ADMIN";
  return "USER";
}

export async function POST(request: Request) {
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    company?: string;
  } = {};

  if (request.headers.get("content-type")?.includes("application/json")) {
    body = await request.json();
  } else {
    const formData = await request.formData();
    body = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      company: String(formData.get("company") ?? ""),
    };
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const company = body.company?.trim();

  if (!firstName || !lastName || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Champs invalides. Mot de passe: 8 caracteres minimum." },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe deja avec cet email." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const fallbackCompany = email?.split("@")[1] ?? null;
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        company: company || fallbackCompany,
        role: resolveRole(email),
      },
    });

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
