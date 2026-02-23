import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";

export const runtime = "nodejs";

const MAX_PDF_SIZE = 20 * 1024 * 1024;

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

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier PDF manquant." }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Le fichier doit etre un PDF." }, { status: 400 });
  }

  if (file.size > MAX_PDF_SIZE) {
    return NextResponse.json(
      { error: `Le fichier depasse ${Math.round(MAX_PDF_SIZE / 1024 / 1024)} MB.` },
      { status: 400 }
    );
  }

  const blob = await put(
    `interviews/${companyId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
    file,
    {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }
  );

  const interviewDocument = await prisma.interviewDocument.create({
    data: {
      companyId,
      filename: file.name,
      blobPath: blob.url,
      uploadedById: authUser.id,
      status: "UPLOADED",
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId,
      actionType: "INTERVIEW_UPLOADED",
      metadata: {
        interviewDocumentId: interviewDocument.id,
        filename: file.name,
        blobUrl: blob.url,
        size: file.size,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    interviewDocument: {
      id: interviewDocument.id,
      filename: interviewDocument.filename,
      status: interviewDocument.status,
    },
  });
}
