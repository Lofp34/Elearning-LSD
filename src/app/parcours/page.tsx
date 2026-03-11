import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { getSessionUserId } from "@/lib/session-user";
import { getActiveLearnerRelease } from "@/lib/learning/user-release";
import { getLearnerReleaseSnapshot } from "@/lib/learning/release-snapshot";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const PARTS = [
  { slug: "mental", title: "Mental", tone: "#ff6b4a" },
  { slug: "pyramide", title: "Pyramide de la vente", tone: "#2f5f59" },
  { slug: "techniques", title: "Techniques", tone: "#f1a95f" },
] as const;

export default async function ParcoursPage() {
  const userId = await getSessionUserId();
  const activeRelease = userId ? await getActiveLearnerRelease(userId) : null;
  const modules =
    userId && activeRelease
      ? await getLearnerReleaseSnapshot(userId, activeRelease.releaseId)
      : [];

  const totalAudios = modules.length;
  const completedAudioCount = modules.filter((module) => module.completed).length;
  const quizValidatedCount = modules.filter((module) => module.quizPassed).length;
  const progressPct =
    totalAudios > 0 ? Math.round((quizValidatedCount / totalAudios) * 100) : 0;

  const entriesWithProgress = PARTS.map((part) => {
    const items = modules.filter((module) => module.partKey === part.slug);
    const listenedCount = items.filter((item) => item.completed).length;
    const progress =
      items.length > 0 ? Math.round((listenedCount / items.length) * 100) : 0;
    const nextItem = items.find((item) => !item.completed);

    return {
      part,
      items,
      listenedCount,
      progress,
      nextItem,
      quizPassedCount: items.filter((item) => item.quizPassed).length,
    };
  });

  const partsUnlocked = entriesWithProgress.filter(
    (entry) => entry.items.length > 0 && entry.items.every((item) => item.quizPassed)
  ).length;

  const nextEntry = entriesWithProgress.find((entry) => entry.nextItem);
  const nextAudio = nextEntry?.nextItem;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Parcours du jour" />
        <div className={styles.avatar}>LS</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.progressCard}>
          <p className={styles.cardLabel}>Progression globale</p>
          <div className={styles.progressRow}>
            <div className={styles.progressRing} style={{ ["--progress" as string]: `${progressPct}%` }}>
              <span>{progressPct}%</span>
            </div>
            <div>
              <h2>Parcours commercial B2B</h2>
              <p>
                {activeRelease
                  ? `Tu as ${totalAudios} audios a parcourir sur la release v${activeRelease.version}.`
                  : "Aucune release active ne t'est assignee pour le moment."}
              </p>
            </div>
          </div>
          <div className={styles.milestones}>
            <div>
              <strong>{completedAudioCount}</strong>
              <span>audios completes</span>
            </div>
            <div>
              <strong>{quizValidatedCount}</strong>
              <span>quiz valides</span>
            </div>
            <div>
              <strong>{partsUnlocked}</strong>
              <span>parties validees</span>
            </div>
          </div>
        </div>

        <div className={styles.nextCard}>
          <p className={styles.cardLabel}>A faire maintenant</p>
          <h3>
            {nextAudio
              ? `${nextEntry?.part.title} - ${nextAudio.title}`
              : activeRelease
                ? "Parcours termine"
                : "Aucune release"}
          </h3>
          <p>
            {nextAudio
              ? "Prochain audio a ecouter"
              : activeRelease
                ? "Bravo, tout le socle commun est complete."
                : "Attends l'assignation de ton parcours par l'administration."}
          </p>
          <div className={styles.nextActions}>
            {nextAudio ? (
              <Link className={styles.primary} href={`/parcours/${nextEntry?.part.slug}`}>
                Continuer
              </Link>
            ) : (
              <Link className={styles.primary} href="/profil">
                Voir mon profil
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className={styles.tracks}>
        <h2>Mes parties</h2>
        <div className={styles.trackGrid}>
          {entriesWithProgress.map(({ part, items, nextItem, progress, quizPassedCount }) => (
            <article key={part.title} className={styles.trackCard}>
              <div className={styles.trackHeader}>
                <div className={styles.trackTitle}>
                  <h3>{part.title}</h3>
                  <p>{items.length} audios</p>
                </div>
                <span className={styles.trackDot} style={{ background: part.tone }} />
              </div>
              <p className={styles.trackNext}>
                Prochain audio : {nextItem?.title ?? (items.length > 0 ? "Termine" : "Aucun audio")}
              </p>
              <div className={styles.progressBar}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.trackProgress}>
                {progress}% ecoute | {quizPassedCount}/{items.length} quiz valides
              </p>
              <Link className={styles.secondary} href={`/parcours/${part.slug}`}>
                Ouvrir la partie
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
