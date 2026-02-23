import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { extractTextFromPdfBuffer } from "@/lib/interviews/pdf-extract";

export const runtime = "nodejs";

export async function POST(
  request: Request,
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

  const body = await request.json().catch(() => ({}));
  const documentId = typeof body.documentId === "string" ? body.documentId : null;

  const documents = await prisma.interviewDocument.findMany({
    where: {
      companyId,
      ...(documentId ? { id: documentId } : {}),
      status: { in: ["UPLOADED", "FAILED"] },
    },
    orderBy: { createdAt: "asc" },
  });

  if (documents.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, extracted: 0, failed: 0 });
  }

  let extracted = 0;
  let failed = 0;

  for (const document of documents) {
    try {
      const fileResponse = await fetch(document.blobPath);
      if (!fileResponse.ok) {
        throw new Error(`Blob fetch error ${fileResponse.status}`);
      }

      const arrayBuffer = await fileResponse.arrayBuffer();
      const text = await extractTextFromPdfBuffer(Buffer.from(arrayBuffer));

      await prisma.interviewDocument.update({
        where: { id: document.id },
        data: {
          extractedText: text,
          status: "EXTRACTED",
          errorMessage: null,
        },
      });
      extracted += 1;
    } catch (error) {
      await prisma.interviewDocument.update({
        where: { id: document.id },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Extraction failed",
        },
      });
      failed += 1;
    }
  }

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId,
      actionType: "INTERVIEW_EXTRACTION_RUN",
      metadata: {
        processed: documents.length,
        extracted,
        failed,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    processed: documents.length,
    extracted,
    failed,
  });
}
