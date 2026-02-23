import type { Prisma, UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuthUserScope = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company: string | null;
  companyId: string | null;
};

export function isAdminRole(role: UserRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role: UserRole) {
  return role === "SUPER_ADMIN";
}

export async function getAuthUserScope(): Promise<AuthUserScope | null> {
  const token = (await cookies()).get("ag_session")?.value;
  if (!token) return null;

  try {
    const payload = await verifySessionToken(token);
    const userId = payload.sub;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        companyId: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export function adminUserScopeFilter(user: AuthUserScope): Prisma.UserWhereInput | undefined {
  if (isSuperAdmin(user.role)) return undefined;

  if (user.companyId) {
    return { companyId: user.companyId };
  }

  if (user.company) {
    return { company: user.company };
  }

  return { id: "__missing__" };
}

export async function canAccessCompany(user: AuthUserScope, companyId: string) {
  if (isSuperAdmin(user.role)) return true;
  if (user.companyId === companyId) return true;
  if (!user.company) return false;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });
  if (!company) return false;
  return company.name.trim().toLowerCase() === user.company.trim().toLowerCase();
}
