import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserScope, isAdminRole, isSuperAdmin } from "@/lib/authz";

export const runtime = "nodejs";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function ensureUniqueSlug(baseSlug: string) {
  let slug = baseSlug || "societe";
  let suffix = 2;

  while (true) {
    const existing = await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function GET() {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  const where =
    authUser.role === "SUPER_ADMIN"
      ? {}
      : authUser.companyId
        ? { id: authUser.companyId }
        : authUser.company
          ? { name: { equals: authUser.company, mode: "insensitive" as const } }
          : { id: "__missing__" };

  const companies = await prisma.company.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          users: true,
          releases: true,
          generationJobs: true,
        },
      },
      releases: {
        orderBy: { version: "desc" },
        take: 1,
        select: {
          version: true,
          status: true,
          publishedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const authUser = await getAuthUserScope();
  if (!authUser || !isAdminRole(authUser.role) || !isSuperAdmin(authUser.role)) {
    return NextResponse.json({ error: "Non autorise." }, { status: 403 });
  }

  let name = "";
  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = await request.json();
    name = String(body.name ?? "");
  } else {
    const formData = await request.formData();
    name = String(formData.get("name") ?? "");
  }

  const normalizedName = name.trim();
  if (normalizedName.length < 2) {
    return NextResponse.json(
      { error: "Le nom de societe doit contenir au moins 2 caracteres." },
      { status: 400 }
    );
  }

  const slug = await ensureUniqueSlug(slugify(normalizedName));
  const company = await prisma.company.create({
    data: {
      name: normalizedName,
      slug,
    },
  });

  await prisma.adminActionLog.create({
    data: {
      actorUserId: authUser.id,
      companyId: company.id,
      actionType: "COMPANY_CREATED",
      metadata: {
        companyName: company.name,
        companySlug: company.slug,
      },
    },
  });

  return NextResponse.json({ ok: true, company }, { status: 201 });
}
