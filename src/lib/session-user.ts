import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function getSessionUserId() {
  const token = (await cookies()).get("ag_session")?.value;
  if (!token) return null;

  try {
    const payload = await verifySessionToken(token);
    const userId = payload.sub;
    return typeof userId === "string" && userId.length > 0 ? userId : null;
  } catch {
    return null;
  }
}
