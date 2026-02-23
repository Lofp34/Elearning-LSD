import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const envPaths = [".env.local", ".env"];
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug || "legacy-company";
  let suffix = 2;

  while (true) {
    const existing = await prisma.company.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function resolveCompanyLabel(user) {
  const trimmed = user.company?.trim();
  if (trimmed) return trimmed;
  const domain = user.email?.split("@")?.[1]?.trim();
  if (domain) return domain;
  return "Legacy Company";
}

async function main() {
  const users = await prisma.user.findMany({
    where: { companyId: null },
    select: { id: true, company: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  if (users.length === 0) {
    console.log("No users to backfill.");
    return;
  }

  const cache = new Map();
  let companyCreatedCount = 0;
  let userUpdatedCount = 0;

  for (const user of users) {
    const companyLabel = resolveCompanyLabel(user);
    const key = companyLabel.toLowerCase();
    let companyId = cache.get(key);

    if (!companyId) {
      const existing = await prisma.company.findFirst({
        where: { name: { equals: companyLabel, mode: "insensitive" } },
        select: { id: true },
      });

      if (existing) {
        companyId = existing.id;
      } else {
        const uniqueSlug = await ensureUniqueSlug(slugify(companyLabel));
        const created = await prisma.company.create({
          data: {
            name: companyLabel,
            slug: uniqueSlug,
          },
          select: { id: true },
        });
        companyId = created.id;
        companyCreatedCount += 1;
      }

      cache.set(key, companyId);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        companyId,
        company: companyLabel,
      },
    });
    userUpdatedCount += 1;
  }

  console.log(`Companies created: ${companyCreatedCount}`);
  console.log(`Users updated: ${userUpdatedCount}`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
