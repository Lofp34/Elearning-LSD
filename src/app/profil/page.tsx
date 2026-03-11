import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./LogoutButton";
import { getSessionUserId } from "@/lib/session-user";
import { getActiveLearnerRelease } from "@/lib/learning/user-release";
import { getLearnerReleaseSnapshot } from "@/lib/learning/release-snapshot";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatJoined(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
}

export default async function ProfilPage() {
  const userId = await getSessionUserId();

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

  const [activeRelease, user] = await Promise.all([
    getActiveLearnerRelease(userId),
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

  const modules =
    activeRelease ? await getLearnerReleaseSnapshot(userId, activeRelease.releaseId) : [];

  const totalAudios = modules.length;
  const completedAudios = modules.filter((module) => module.completed).length;
  const quizCount = modules.filter((module) => module.quizBestScore !== null).length;
  const quizPassedCount = modules.filter((module) => module.quizPassed).length;
  const avgScore =
    quizCount > 0
      ? Math.round(
          (modules.reduce((sum, module) => {
            if (module.quizBestScore === null || module.quizBestTotal === null || module.quizBestTotal === 0) {
              return sum;
            }
            return sum + module.quizBestScore / module.quizBestTotal;
          }, 0) /
            quizCount) *
            100
        )
      : 0;
  const completionPct =
    totalAudios > 0 ? Math.round((quizPassedCount / totalAudios) * 100) : 0;

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
            {activeRelease ? (
              <div>
                <span className={styles.metaLabel}>Release active</span>
                <span className={styles.metaValue}>v{activeRelease.version}</span>
              </div>
            ) : null}
          </div>
        </article>

        <article className={styles.card}>
          <p className={styles.label}>Progression</p>
          <h2>Resume d&apos;avancement</h2>
          <p className={styles.subtitle}>
            L&apos;objectif: ecouter chaque audio a 90% minimum et valider le quiz.
          </p>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <strong>{completedAudios}</strong>
              <span>audios completes</span>
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
              <span>parcours valide</span>
            </div>
          </div>
          <p className={styles.note}>
            Continue ton rythme: l&apos;important est la regularite et la mise en pratique.
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
