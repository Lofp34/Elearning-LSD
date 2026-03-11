import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import CreateReleaseButton from "../../CreateReleaseButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const authUser = await getAuthUserScope();
  if (!authUser) redirect("/connexion");
  if (!isAdminRole(authUser.role)) redirect("/parcours");

  const { companyId } = await params;
  const allowed = await canAccessCompany(authUser, companyId);
  if (!allowed) redirect("/admin/gestion");

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      _count: {
        select: {
          users: true,
          releases: true,
        },
      },
      releases: {
        orderBy: { version: "desc" },
        include: {
          _count: {
            select: {
              modules: true,
              learnerEnrollments: true,
            },
          },
          modules: {
            where: {
              moduleType: "CORE",
            },
            include: {
              quizQuestions: true,
              audioAsset: true,
            },
          },
        },
      },
    },
  });

  if (!company) redirect("/admin/gestion");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Societe" />
        <div className={styles.headerActions}>
          <Link className={styles.back} href="/admin/gestion">
            Retour gestion
          </Link>
        </div>
      </header>

      <section className={styles.introCard}>
        <h1>{company.name}</h1>
        <p>
          Slug: <strong>{company.slug}</strong>
        </p>
        <div className={styles.inlineMeta}>
          <span>{company._count.users} utilisateurs</span>
          <span>{company._count.releases} releases</span>
          <span>{company.isActive ? "Active" : "Inactive"}</span>
        </div>
        <CreateReleaseButton companyId={company.id} />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Releases manuelles</h2>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Version</th>
                <th>Statut</th>
                <th>Scripts OK</th>
                <th>Quiz OK</th>
                <th>Audio OK</th>
                <th>Assignes</th>
                <th>Publiee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {company.releases.length === 0 ? (
                <tr>
                  <td colSpan={8}>Aucune release pour le moment.</td>
                </tr>
              ) : (
                company.releases.map((release) => {
                  const total = release.modules.length;
                  const scripts = release.modules.filter((module) => module.scriptText.trim().length >= 120).length;
                  const quizzes = release.modules.filter((module) => module.quizQuestions.length === 5).length;
                  const audio = release.modules.filter((module) => module.audioAsset?.status === "GENERATED").length;

                  return (
                    <tr key={release.id}>
                      <td>
                        <strong>v{release.version}</strong>
                      </td>
                      <td>{release.status}</td>
                      <td>
                        {scripts}/{total}
                      </td>
                      <td>
                        {quizzes}/{total}
                      </td>
                      <td>
                        {audio}/{total}
                      </td>
                      <td>{release._count.learnerEnrollments}</td>
                      <td>{formatDate(release.publishedAt)}</td>
                      <td>
                        <div className={styles.rowActionsLinks}>
                          <Link className={styles.inlineTextLink} href={`/admin/gestion/releases/${release.id}/review`}>
                            Editer
                          </Link>
                          <Link className={styles.inlineTextLink} href={`/admin/gestion/releases/${release.id}/enrollments`}>
                            Assigner
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
