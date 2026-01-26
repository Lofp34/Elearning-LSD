import Link from "next/link";
import { list } from "@vercel/blob";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import BrandMark from "@/components/BrandMark";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type LeaderEntry = {
  id: string;
  name: string;
  company: string;
  listenedCount: number;
  proportion: number;
  durationHours: number;
  avgScore: number;
  quizCount: number;
};

function getDomain(email: string) {
  const [, domain] = email.split("@");
  return domain?.toLowerCase() ?? "";
}

function resolveCompany(user: { email: string; company: string | null }) {
  const trimmed = user.company?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : getDomain(user.email) || "Entreprise";
}

function formatDuration(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) {
    return "0h";
  }
  const days = Math.floor(hours / 24);
  if (days >= 1) {
    const rest = Math.round((hours - days * 24) * 10) / 10;
    return rest > 0 ? `${days}j ${rest}h` : `${days}j`;
  }
  return `${Math.round(hours * 10) / 10}h`;
}

export default async function LeaderboardPage() {
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

  const company = resolveCompany(currentUser);
  const { blobs } = await list({ prefix: "audio/", limit: 200 });
  const totalAudios = blobs.length;

  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, company: true },
  });

  const companyUsers = users.filter((user) => resolveCompany(user) === company);

  if (companyUsers.length === 0) {
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
          <p className={styles.empty}>Aucun membre trouve pour {company}.</p>
        </section>
      </main>
    );
  }

  const userIds = companyUsers.map((user) => user.id);

  const [listenStats, quizAttempts] = await Promise.all([
    prisma.listenEvent.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _count: { _all: true },
      _min: { completedAt: true },
      _max: { completedAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      select: { userId: true, audioSlug: true, score: true, total: true },
    }),
  ]);

  const listenMap = new Map<
    string,
    { count: number; min: Date | null; max: Date | null }
  >();
  for (const stat of listenStats) {
    listenMap.set(stat.userId, {
      count: stat._count._all,
      min: stat._min.completedAt ?? null,
      max: stat._max.completedAt ?? null,
    });
  }

  const latestQuizMap = new Map<string, Map<string, { score: number; total: number }>>();
  for (const attempt of quizAttempts) {
    let userMap = latestQuizMap.get(attempt.userId);
    if (!userMap) {
      userMap = new Map();
      latestQuizMap.set(attempt.userId, userMap);
    }
    if (!userMap.has(attempt.audioSlug)) {
      userMap.set(attempt.audioSlug, { score: attempt.score, total: attempt.total });
    }
  }

  const entries: LeaderEntry[] = companyUsers.map((user) => {
    const listen = listenMap.get(user.id);
    const listenedCount = listen?.count ?? 0;
    const durationHours =
      listen?.min && listen?.max
        ? Math.max(0, (listen.max.getTime() - listen.min.getTime()) / 36e5)
        : 0;
    const proportion = totalAudios > 0 ? listenedCount / totalAudios : 0;

    const quizMap = latestQuizMap.get(user.id);
    let quizSum = 0;
    let quizCount = 0;
    if (quizMap) {
      for (const attempt of quizMap.values()) {
        if (attempt.total > 0) {
          quizSum += attempt.score / attempt.total;
          quizCount += 1;
        }
      }
    }
    const avgScore = quizCount > 0 ? Math.round((quizSum / quizCount) * 100) : 0;

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName?.slice(0, 1) ?? ""}.`,
      company: resolveCompany(user),
      listenedCount,
      proportion,
      durationHours,
      avgScore,
      quizCount,
    };
  });

  const topListens = [...entries].sort((a, b) => b.listenedCount - a.listenedCount).slice(0, 5);
  const topScores = [...entries]
    .sort((a, b) => (b.avgScore !== a.avgScore ? b.avgScore - a.avgScore : b.quizCount - a.quizCount))
    .slice(0, 5);
  const topSprint = [...entries]
    .sort((a, b) => {
      if (b.proportion !== a.proportion) return b.proportion - a.proportion;
      return a.durationHours - b.durationHours;
    })
    .slice(0, 5);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Classement" />
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <section className={styles.intro}>
        <h1>Leaderboard {company}</h1>
        <p>
          Classement interne par entreprise. Score moyen des quiz et rythme
          d'ecoute pour stimuler le collectif.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Top ecoutes</h2>
            <span className={styles.tag}>Volume</span>
          </div>
          <div className={styles.list}>
            {topListens.length === 0 ? (
              <p className={styles.empty}>Aucune ecoute enregistree.</p>
            ) : (
              topListens.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`${styles.row} ${index === 0 ? styles.rowTop : ""}`}
                >
                  <div className={styles.identity}>
                    <span className={styles.name}>{entry.name}</span>
                    <span className={styles.meta}>{entry.listenedCount} ecoutes</span>
                  </div>
                  <span className={styles.score}>#{index + 1}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Meilleur score quiz</h2>
            <span className={styles.tag}>Moyenne</span>
          </div>
          <div className={styles.list}>
            {topScores.length === 0 ? (
              <p className={styles.empty}>Aucun quiz valide.</p>
            ) : (
              topScores.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`${styles.row} ${index === 0 ? styles.rowTop : ""}`}
                >
                  <div className={styles.identity}>
                    <span className={styles.name}>{entry.name}</span>
                    <span className={styles.meta}>
                      {entry.quizCount} quiz • {entry.avgScore}%
                    </span>
                  </div>
                  <span className={styles.score}>#{index + 1}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Sprint audio</h2>
            <span className={styles.tag}>Rythme</span>
          </div>
          <div className={styles.list}>
            {topSprint.length === 0 ? (
              <p className={styles.empty}>Aucune progression mesuree.</p>
            ) : (
              topSprint.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`${styles.row} ${index === 0 ? styles.rowTop : ""}`}
                >
                  <div className={styles.identity}>
                    <span className={styles.name}>{entry.name}</span>
                    <span className={styles.meta}>
                      {Math.round(entry.proportion * 100)}% en {formatDuration(entry.durationHours)}
                    </span>
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
