import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionCookieOptions, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ag_session")?.value;
  if (token) {
    try {
      const payload = await verifySessionToken(token);
      if (payload.sub) {
        await prisma.activityLog.create({
          data: {
            userId: payload.sub,
            type: "LOGOUT",
          },
        });
      }
    } catch {
      // ignore invalid tokens
    }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
  return response;
}
