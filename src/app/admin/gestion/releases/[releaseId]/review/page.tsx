import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import ReviewEditor from "./ReviewEditor";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function ReviewReleasePage({
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
          slug: true,
        },
      },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          quizQuestions: {
            orderBy: { orderIndex: "asc" },
          },
          audioAsset: {
            select: {
              id: true,
              status: true,
              blobPath: true,
            },
          },
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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Review release" />
        <div className={styles.headerActions}>
          <Link className={styles.back} href={`/admin/gestion/companies/${release.companyId}`}>
            Retour wizard
          </Link>
        </div>
      </header>

      <section className={styles.introCard}>
        <h1>
          {release.company.name} - v{release.version}
        </h1>
        <p>
          Statut release: <strong>{release.status}</strong>
        </p>
        <p>Modules: {release.modules.length}</p>
      </section>

      <ReviewEditor
        releaseId={release.id}
        initialModules={release.modules.map((module) => ({
          id: module.id,
          contentKey: module.contentKey,
          title: module.title,
          partKey: module.partKey,
          chapterKey: module.chapterKey,
          orderIndex: module.orderIndex,
          scriptText: module.scriptText,
          reviewStatus: module.reviewStatus,
          reviewComment: module.reviewComment,
          quizQuestions: module.quizQuestions.map((question) => ({
            id: question.id,
            question: question.question,
            options: Array.isArray(question.options)
              ? question.options.map((option) => String(option))
              : ["", "", "", ""],
            answerIndex: question.answerIndex,
          })),
        }))}
      />
    </main>
  );
}
