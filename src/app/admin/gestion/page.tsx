import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { getAuthUserScope, isAdminRole, isSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import CreateReleaseButton from "./CreateReleaseButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined) {
  if (!value) return "Non publie";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminGestionPage() {
  const authUser = await getAuthUserScope();
  if (!authUser) redirect("/connexion");
  if (!isAdminRole(authUser.role)) redirect("/parcours");

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
          id: true,
          version: true,
          status: true,
          publishedAt: true,
        },
      },
    },
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Gestion" />
        <Link className={styles.back} href="/admin">
          Retour
        </Link>
      </header>

      <section className={styles.intro}>
        <h1>Gestion des societes</h1>
        <p>
          Societes configurees: <strong>{companies.length}</strong>
        </p>
        {isSuperAdmin(authUser.role) ? (
          <Link className={styles.primary} href="/admin/gestion/companies/new">
            Creer une nouvelle societe
          </Link>
        ) : null}
      </section>

      <section className={styles.grid}>
        {companies.length === 0 ? (
          <div className={styles.empty}>Aucune societe configuree pour le moment.</div>
        ) : (
          companies.map((company) => {
            const latestRelease = company.releases[0];
            return (
              <article key={company.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>{company.name}</h2>
                  <span className={styles.badge}>{company.slug}</span>
                </div>
                <div className={styles.stats}>
                  <span>{company._count.users} utilisateurs</span>
                  <span>{company._count.releases} versions</span>
                  <span>{company._count.generationJobs} jobs</span>
                </div>
                <div className={styles.release}>
                  <strong>
                    {latestRelease
                      ? `Derniere version: v${latestRelease.version}`
                      : "Aucune version publiee"}
                  </strong>
                  <span>
                    {latestRelease
                      ? `${latestRelease.status} - ${formatDate(latestRelease.publishedAt)}`
                      : "Lancez le wizard de generation pour demarrer."}
                  </span>
                </div>
                <CreateReleaseButton companyId={company.id} />
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
