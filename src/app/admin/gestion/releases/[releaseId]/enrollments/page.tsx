import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import AssignEnrollmentButton from "./AssignEnrollmentButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function ReleaseEnrollmentsPage({
  params,
}: {
  params: Promise<{ releaseId: string }>;
}) {
  const authUser = await getAuthUserScope();
  if (!authUser) redirect("/connexion");
  if (!isAdminRole(authUser.role)) redirect("/parcours");

  const { releaseId } = await params;

  const release = await prisma.learningRelease.findUnique({
    where: { id: releaseId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!release) {
    redirect("/admin/gestion");
  }

  const allowed = await canAccessCompany(authUser, release.companyId);
  if (!allowed) {
    redirect("/admin/gestion");
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { companyId: release.companyId },
        {
          companyId: null,
          company: {
            equals: release.company.name,
            mode: "insensitive",
          },
        },
      ],
      role: { in: ["USER", "ADMIN"] },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      learnerEnrollments: {
        where: { isActive: true },
        include: {
          release: {
            select: {
              id: true,
              version: true,
              status: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Assignations" />
        <Link className={styles.back} href={`/admin/gestion/releases/${release.id}/review`}>
          Retour review
        </Link>
      </header>

      <section className={styles.card}>
        <h1>
          Assigner les apprenants - {release.company.name} - v{release.version}
        </h1>
        <p>
          L&apos;assignation active est manuelle. Les apprenants en cours ne sont pas reassignes automatiquement.
        </p>
      </section>

      <section className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Apprenant</th>
              <th>Email</th>
              <th>Release active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4}>Aucun utilisateur pour cette societe.</td>
              </tr>
            ) : (
              users.map((user) => {
                const active = user.learnerEnrollments[0] ?? null;
                const isCurrent = active?.releaseId === release.id;

                return (
                  <tr key={user.id}>
                    <td>
                      {user.firstName} {user.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>{active ? `v${active.release.version} (${active.release.status})` : "Aucune"}</td>
                    <td>
                      <AssignEnrollmentButton
                        userId={user.id}
                        releaseId={release.id}
                        isActive={Boolean(isCurrent)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
