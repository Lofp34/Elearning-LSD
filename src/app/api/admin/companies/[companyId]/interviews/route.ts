import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const { companyId } = await params;
  const allowed = await canAccessCompany(authUser, companyId);
  if (!allowed) {
    return NextResponse.json({ error: "Scope entreprise invalide." }, { status: 403 });
  }

  const interviews = await prisma.interviewDocument.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      status: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
      extractedText: true,
    },
  });

  return NextResponse.json({
    interviews: interviews.map((item) => ({
      id: item.id,
      filename: item.filename,
      status: item.status,
      errorMessage: item.errorMessage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      extractedTextLength: item.extractedText?.length ?? 0,
    })),
  });
}
