import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { getSessionUserId } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { getActiveLearnerRelease } from "@/lib/learning/user-release";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type LeaderEntry = {
  id: string;
  name: string;
  completedModules: number;
  avgScore: number;
  lastActivityAt: Date | null;
};

function getDomain(email: string) {
  const [, domain] = email.split("@");
  return domain?.toLowerCase() ?? "";
}

function resolveCompany(user: { email: string; company: string | null }) {
  const trimmed = user.company?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : getDomain(user.email) || "Entreprise";
}

function formatDate(value: Date | null) {
  if (!value) return "Aucune activite";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function LeaderboardPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <BrandMark subtitle="Classement" />
          <Link className={styles.back} href="/">
            Retour
          </Link>
        </header>
        <section className={styles.card}>
          <h2>Connecte-toi pour voir le classement</h2>
          <p className={styles.empty}>Le leaderboard est reserve aux membres.</p>
          <div className={styles.callout}>
            <p>Rends-toi sur la page de connexion pour acceder a ton equipe.</p>
          </div>
          <Link className={styles.back} href="/connexion">
            Se connecter
          </Link>
        </section>
      </main>
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, email: true, company: true },
  });

  if (!currentUser) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <BrandMark subtitle="Classement" />
          <Link className={styles.back} href="/parcours">
            Retour
          </Link>
        </header>
        <section className={styles.card}>
          <p className={styles.empty}>Impossible de charger le profil.</p>
        </section>
      </main>
    );
  }

  const activeRelease = await getActiveLearnerRelease(userId);
  const company = resolveCompany(currentUser);

  if (!activeRelease) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <BrandMark subtitle="Classement" />
          <Link className={styles.back} href="/parcours">
            Retour
          </Link>
        </header>
        <section className={styles.card}>
          <h2>Classement indisponible</h2>
          <p className={styles.empty}>Aucune release active pour afficher le classement.</p>
        </section>
      </main>
    );
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { companyId: activeRelease.companyId },
        { company: { equals: company, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
    },
  });

  const userIds = users.map((user) => user.id);
  const progress = await prisma.learnerModuleProgress.findMany({
    where: {
      userId: { in: userIds },
      releaseId: activeRelease.releaseId,
    },
    select: {
      userId: true,
      completedAt: true,
      quizBestScore: true,
      quizBestTotal: true,
      updatedAt: true,
    },
  });

  const entries: LeaderEntry[] = users.map((user) => {
    const rows = progress.filter((row) => row.userId === user.id);
    const completedModules = rows.filter((row) => row.completedAt).length;
    const scoredRows = rows.filter(
      (row) => row.quizBestScore !== null && row.quizBestTotal !== null && row.quizBestTotal > 0
    );
    const avgScore =
      scoredRows.length > 0
        ? Math.round(
            (scoredRows.reduce((sum, row) => {
              return sum + (row.quizBestScore ?? 0) / (row.quizBestTotal ?? 1);
            }, 0) /
              scoredRows.length) *
              100
          )
        : 0;
    const lastActivityAt =
      rows.length > 0
        ? new Date(Math.max(...rows.map((row) => row.updatedAt.getTime())))
        : null;

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName?.slice(0, 1) ?? ""}.`,
      completedModules,
      avgScore,
      lastActivityAt,
    };
  });

  const topList = [...entries].sort((a, b) => {
    if (b.completedModules !== a.completedModules) return b.completedModules - a.completedModules;
    return b.avgScore - a.avgScore;
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Classement" />
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <section className={styles.intro}>
        <h1>Classement {company}</h1>
        <p>Classement interne base sur les modules completes et les resultats de quiz.</p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Top progression</h2>
            <span className={styles.tag}>Release v{activeRelease.version}</span>
          </div>
          <div className={styles.list}>
            {topList.length === 0 ? (
              <p className={styles.empty}>Aucune progression enregistree.</p>
            ) : (
              topList.map((entry, index) => (
                <div key={entry.id} className={`${styles.row} ${index === 0 ? styles.rowTop : ""}`}>
                  <div className={styles.identity}>
                    <span className={styles.name}>{entry.name}</span>
                    <span className={styles.meta}>
                      {entry.completedModules} modules completes | {entry.avgScore}% quiz
                    </span>
                    <span className={styles.meta}>{formatDate(entry.lastActivityAt)}</span>
                  </div>
                  <span className={styles.score}>#{index + 1}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
