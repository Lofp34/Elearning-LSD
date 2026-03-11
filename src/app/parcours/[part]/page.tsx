import Link from "next/link";
import { notFound } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { getSessionUserId } from "@/lib/session-user";
import { getActiveLearnerRelease } from "@/lib/learning/user-release";
import { buildReleaseModuleSlug, buildTrackingAudioSlug } from "@/lib/learning/slug";
import { getLearnerReleaseSnapshot } from "@/lib/learning/release-snapshot";
import AudioCard from "./AudioCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const PARTS: Record<string, { title: string; subtitle: string; accent: string }> = {
  mental: {
    title: "Mental",
    subtitle: "Posture, confiance, resilience",
    accent: "#ff6b4a",
  },
  pyramide: {
    title: "Pyramide de la vente",
    subtitle: "De la prise de contact au closing",
    accent: "#2f5f59",
  },
  techniques: {
    title: "Techniques",
    subtitle: "Ecoute, questionnement, rythme",
    accent: "#f1a95f",
  },
};

export default async function PartPage({
  params,
}: {
  params: { part: string } | Promise<{ part: string }>;
}) {
  const { part } = await Promise.resolve(params);
  const config = PARTS[part];
  if (!config) notFound();

  const userId = await getSessionUserId();
  const activeRelease = userId ? await getActiveLearnerRelease(userId) : null;
  const snapshot =
    userId && activeRelease
      ? await getLearnerReleaseSnapshot(userId, activeRelease.releaseId)
      : [];

  const items = snapshot
    .filter((module) => module.partKey === part)
    .map((module) => ({
      url: module.blobPath,
      title: module.title,
      index: module.orderIndex,
      slug: buildReleaseModuleSlug(activeRelease!.releaseId, module.contentKey),
      moduleId: module.id,
      releaseId: activeRelease!.releaseId,
      trackingSlug: buildTrackingAudioSlug(activeRelease!.version, module.contentKey),
      listenPercent: module.listenPercentMax,
      quizResult:
        module.quizBestScore !== null && module.quizBestTotal !== null
          ? {
              score: module.quizBestScore,
              total: module.quizBestTotal,
              passed: module.quizPassed,
            }
          : undefined,
    }));

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <BrandMark subtitle="Parcours" />
          <div>
            <h1>{config.title}</h1>
            <p className={styles.subtitle}>{config.subtitle}</p>
          </div>
        </div>
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <section className={styles.list}>
        {!activeRelease ? (
          <div className={styles.empty}>
            <p>Aucune release active ne t&apos;est assignee pour le moment.</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucun audio disponible dans cette partie.</p>
          </div>
        ) : (
          items.map((item) => (
            <AudioCard
              key={item.slug}
              item={item}
              accent={config.accent}
              listened={item.listenPercent >= 90}
              listenPercent={item.listenPercent}
              quizResult={item.quizResult}
            />
          ))
        )}
      </section>
    </main>
  );
}
