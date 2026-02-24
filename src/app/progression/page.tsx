import { list } from "@vercel/blob";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BrandMark from "@/components/BrandMark";
import { getSessionUserId } from "@/lib/session-user";
import { getActiveLearnerRelease } from "@/lib/learning/user-release";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function ProgressionPage() {
  const userId = await getSessionUserId();
  const activeRelease = userId ? await getActiveLearnerRelease(userId) : null;

  let totalAudios = 0;
  let listensCount = 0;
  let quizValidatedCount = 0;
  let progressPct = 0;

  if (userId) {
    if (activeRelease) {
      const [modules, listens, passedQuizzes] = await Promise.all([
        prisma.learningModule.count({
          where: {
            releaseId: activeRelease.releaseId,
            audioAsset: { is: { status: "GENERATED" } },
          },
        }),
        prisma.listenEvent.count({
          where: {
            userId,
            releaseId: activeRelease.releaseId,
          },
        }),
        prisma.quizAttempt.findMany({
          where: {
            userId,
            releaseId: activeRelease.releaseId,
            passed: true,
            moduleId: { not: null },
          },
          distinct: ["moduleId"],
          select: { moduleId: true },
        }),
      ]);

      totalAudios = modules;
      listensCount = listens;
      quizValidatedCount = passedQuizzes.length;
      progressPct = totalAudios > 0 ? Math.round((quizValidatedCount / totalAudios) * 100) : 0;
    } else {
      const { blobs } = await list({ prefix: "audio/", limit: 200 });
      totalAudios = blobs.length;
      listensCount = await prisma.listenEvent.count({ where: { userId } });
      const passedQuizzes = await prisma.quizAttempt.findMany({
        where: { userId, passed: true },
        distinct: ["audioSlug"],
        select: { audioSlug: true },
      });
      quizValidatedCount = passedQuizzes.length;
      progressPct = totalAudios > 0 ? Math.round((quizValidatedCount / totalAudios) * 100) : 0;
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Progression" />
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>
      <section className={styles.card}>
        <p className={styles.label}>Suivi en cours</p>
        <h2>Ta progression globale</h2>
        <p>Quiz valides: {quizValidatedCount}</p>
        <p>Ecoutes completees: {listensCount}</p>
        <p>Audios totaux: {totalAudios}</p>
        <p>Progression: {progressPct}%</p>
        <Link className={styles.cta} href="/parcours">
          Revenir au parcours
        </Link>
      </section>
    </main>
  );
}
