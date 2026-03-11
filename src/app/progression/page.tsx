import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { getSessionUserId } from "@/lib/session-user";
import { getActiveLearnerRelease } from "@/lib/learning/user-release";
import { getLearnerReleaseSnapshot } from "@/lib/learning/release-snapshot";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function ProgressionPage() {
  const userId = await getSessionUserId();
  const activeRelease = userId ? await getActiveLearnerRelease(userId) : null;
  const modules =
    userId && activeRelease
      ? await getLearnerReleaseSnapshot(userId, activeRelease.releaseId)
      : [];

  const totalAudios = modules.length;
  const completedAudios = modules.filter((module) => module.completed).length;
  const quizValidatedCount = modules.filter((module) => module.quizPassed).length;
  const averageListenPercent =
    totalAudios > 0
      ? Math.round(
          modules.reduce((sum, module) => sum + module.listenPercentMax, 0) / totalAudios
        )
      : 0;
  const progressPct =
    totalAudios > 0 ? Math.round((quizValidatedCount / totalAudios) * 100) : 0;

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
        <p>Release active: {activeRelease ? `v${activeRelease.version}` : "Aucune"}</p>
        <p>Audios completes: {completedAudios}</p>
        <p>Quiz valides: {quizValidatedCount}</p>
        <p>Modules au total: {totalAudios}</p>
        <p>Ecoute moyenne: {averageListenPercent}%</p>
        <p>Progression: {progressPct}%</p>
        <Link className={styles.cta} href="/parcours">
          Revenir au parcours
        </Link>
      </section>
    </main>
  );
}
