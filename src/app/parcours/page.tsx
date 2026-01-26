import { list } from "@vercel/blob";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const parts = [
  {
    slug: "mental",
    title: "Mental",
    prefix: "audio/elearning1-",
    tone: "#ff6b4a",
  },
  {
    slug: "pyramide",
    title: "Pyramide de la vente",
    prefix: "audio/elearning2-",
    tone: "#2f5f59",
  },
  {
    slug: "techniques",
    title: "Techniques",
    prefix: "audio/elearning3-",
    tone: "#f1a95f",
  },
];

function formatTitle(filename: string) {
  const base = filename.replace(/\.mp3$/i, "").replace(/^elearning\\d+-\\d+-/, "");
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIndex(filename: string) {
  const match = filename.match(/elearning\\d+-(\\d+)-/i);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export default async function ParcoursPage() {
  const { blobs } = await list({ prefix: "audio/", limit: 200 });
  const token = (await cookies()).get("ag_session")?.value;
  let userId: string | null = null;

  if (token) {
    try {
      const payload = await verifySessionToken(token);
      userId = payload.sub ?? null;
    } catch {
      userId = null;
    }
  }

  const entriesByPart = parts.map((part) => {
    const items = blobs
      .filter((blob) => blob.pathname.startsWith(part.prefix))
      .map((blob) => {
        const filename = blob.pathname.split("/").pop() ?? "";
        return {
          url: blob.url,
          title: formatTitle(filename),
          index: getIndex(filename),
          slug: filename.replace(/\.mp3$/i, ""),
        };
      })
      .sort((a, b) => a.index - b.index);

    return { part, items };
  });

  const totalAudios = entriesByPart.reduce((acc, entry) => acc + entry.items.length, 0);
  const nextEntry = entriesByPart.find((entry) => entry.items.length > 0);
  const nextAudio = nextEntry?.items[0];
  let listensCount = 0;
  let quizValidatedCount = 0;
  let partsUnlocked = 0;
  let progressPct = 0;

  if (userId) {
    const listenEvents = await prisma.listenEvent.findMany({
      where: { userId },
      select: { audioSlug: true },
    });
    listensCount = listenEvents.length;
    const listenedSlugs = new Set(listenEvents.map((event) => event.audioSlug));

    const passedQuizzes = await prisma.quizAttempt.findMany({
      where: { userId, passed: true },
      distinct: ["audioSlug"],
      select: { audioSlug: true },
    });
    quizValidatedCount = passedQuizzes.length;
    const passedSlugs = new Set(passedQuizzes.map((item) => item.audioSlug));

    partsUnlocked = entriesByPart.filter((entry) =>
      entry.items.length > 0 &&
      entry.items.every((item) => passedSlugs.has(item.slug))
    ).length;

    progressPct = totalAudios > 0 ? Math.round((quizValidatedCount / totalAudios) * 100) : 0;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>AG</div>
          <div>
            <p className={styles.wordmark}>Parcours</p>
            <p className={styles.wordsub}>Ton entrainement du jour</p>
          </div>
        </div>
        <div className={styles.avatar}>LS</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.progressCard}>
          <p className={styles.cardLabel}>Progression globale</p>
          <div className={styles.progressRow}>
            <div
              className={styles.progressRing}
              style={{ ["--progress" as string]: `${progressPct}%` }}
            >
              <span>{progressPct}%</span>
            </div>
            <div>
              <h2>Commence ton parcours</h2>
              <p>
                {totalAudios > 0
                  ? `Tu as ${totalAudios} audios a parcourir.`
                  : "Les audios arrivent. Importe-les dans Vercel Blob."}
              </p>
            </div>
          </div>
          <div className={styles.milestones}>
            <div>
              <strong>{listensCount}</strong>
              <span>ecoutes</span>
            </div>
            <div>
              <strong>{quizValidatedCount}</strong>
              <span>quiz valides</span>
            </div>
            <div>
              <strong>{partsUnlocked}</strong>
              <span>partie debloquee</span>
            </div>
          </div>
        </div>

        <div className={styles.nextCard}>
          <p className={styles.cardLabel}>A faire maintenant</p>
          <h3>
            {nextEntry ? `${nextEntry.part.title} - ${nextAudio?.title}` : "Aucun audio"}
          </h3>
          <p>{nextEntry ? "Audio de demarrage" : "Importe tes audios"}</p>
          <div className={styles.nextActions}>
            {nextEntry ? (
              <Link className={styles.primary} href={`/parcours/${nextEntry.part.slug}`}>
                Ecouter l'audio
              </Link>
            ) : (
              <Link className={styles.primary} href="/audio">
                Voir les fichiers
              </Link>
            )}
            <Link className={styles.ghost} href="/audio">
              Voir les fichiers
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.tracks}>
        <h2>Mes parties</h2>
        <div className={styles.trackGrid}>
          {entriesByPart.map(({ part, items }) => (
            <article key={part.title} className={styles.trackCard}>
              <div className={styles.trackHeader}>
                <div className={styles.trackTitle}>
                  <h3>{part.title}</h3>
                  <p>{items.length} audios</p>
                </div>
                <span className={styles.trackDot} style={{ background: part.tone }} />
              </div>
              <p className={styles.trackNext}>
                Prochain audio : {items[0]?.title ?? "Aucun audio"}
              </p>
              <div className={styles.progressBar}>
                <span style={{ width: "0%" }} />
              </div>
              <p className={styles.trackProgress}>0% termine</p>
              <Link className={styles.secondary} href={`/parcours/${part.slug}`}>
                Ouvrir la partie
              </Link>
            </article>
          ))}
        </div>
      </section>

      <nav className={styles.nav}>
        <Link className={`${styles.navItem} ${styles.active}`} href="/parcours">
          Parcours
        </Link>
        <Link className={styles.navItem} href="/progression">
          Progression
        </Link>
        <Link className={styles.navItem} href="/profil">
          Profil
        </Link>
      </nav>
    </main>
  );
}
