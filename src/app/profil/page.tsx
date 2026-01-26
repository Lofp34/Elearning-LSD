import Link from "next/link";
import { cookies } from "next/headers";
import { list } from "@vercel/blob";
import BrandMark from "@/components/BrandMark";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatJoined(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
}

export default async function ProfilPage() {
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

  if (!userId) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <BrandMark subtitle="Profil" />
          <Link className={styles.back} href="/">
            Retour
          </Link>
        </header>
        <section className={styles.card}>
          <p className={styles.label}>Acces</p>
          <h2>Connecte-toi pour personnaliser ton profil</h2>
          <p className={styles.subtitle}>
            Tes informations et ta progression apparaissent apres connexion.
          </p>
          <div className={styles.actions}>
            <Link className={styles.cta} href="/connexion">
              Se connecter
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const [user, { blobs }, listensCount, quizAttempts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        createdAt: true,
      },
    }),
    list({ prefix: "audio/", limit: 200 }),
    prisma.listenEvent.count({ where: { userId } }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { audioSlug: true, score: true, total: true },
    }),
  ]);

  if (!user) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <BrandMark subtitle="Profil" />
          <Link className={styles.back} href="/parcours">
            Retour
          </Link>
        </header>
        <section className={styles.card}>
          <p className={styles.subtitle}>Impossible de charger le profil.</p>
        </section>
      </main>
    );
  }

  const totalAudios = blobs.length;
  const completionPct =
    totalAudios > 0 ? Math.round((listensCount / totalAudios) * 100) : 0;

  const latestQuizMap = new Map<string, { score: number; total: number }>();
  for (const attempt of quizAttempts) {
    if (!latestQuizMap.has(attempt.audioSlug)) {
      latestQuizMap.set(attempt.audioSlug, { score: attempt.score, total: attempt.total });
    }
  }
  let quizSum = 0;
  let quizCount = 0;
  for (const attempt of latestQuizMap.values()) {
    if (attempt.total > 0) {
      quizSum += attempt.score / attempt.total;
      quizCount += 1;
    }
  }
  const avgScore = quizCount > 0 ? Math.round((quizSum / quizCount) * 100) : 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Profil" />
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <section className={styles.profileGrid}>
        <article className={styles.card}>
          <p className={styles.label}>Identite</p>
          <h2>
            Bonjour {user.firstName} {user.lastName}
          </h2>
          <p className={styles.subtitle}>
            Voici ton espace personnel pour suivre ta montee en competence.
          </p>
          <div className={styles.metaList}>
            <div>
              <span className={styles.metaLabel}>Email</span>
              <span className={styles.metaValue}>{user.email}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>Entreprise</span>
              <span className={styles.metaValue}>{user.company ?? "Non renseignee"}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>Membre depuis</span>
              <span className={styles.metaValue}>{formatJoined(user.createdAt)}</span>
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <p className={styles.label}>Progression</p>
          <h2>Resume d'avancement</h2>
          <p className={styles.subtitle}>
            L'objectif: ecouter chaque audio et valider les quiz avec 70% minimum.
          </p>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <strong>{listensCount}</strong>
              <span>ecoutes</span>
            </div>
            <div className={styles.statCard}>
              <strong>{quizCount}</strong>
              <span>quiz faits</span>
            </div>
            <div className={styles.statCard}>
              <strong>{avgScore}%</strong>
              <span>moyenne quiz</span>
            </div>
            <div className={styles.statCard}>
              <strong>{completionPct}%</strong>
              <span>audios ecoutes</span>
            </div>
          </div>
          <p className={styles.note}>
            Continue ta serie: 10 minutes par jour suffisent pour ancrer les
            bons reflexes.
          </p>
          <div className={styles.actions}>
            <Link className={styles.cta} href="/parcours">
              Revenir au parcours
            </Link>
            <LogoutButton className={styles.ghost} />
          </div>
        </article>
      </section>
    </main>
  );
}
