import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type ActivityRow = {
  id: string;
  type: string;
  audioSlug: string | null;
  score: number | null;
  total: number | null;
  passed: boolean | null;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
  };
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  USER: "Utilisateur",
};

const EVENT_LABELS: Record<string, string> = {
  LOGIN: "Connexion",
  LOGOUT: "Deconnexion",
  LISTEN_COMPLETE: "Ecoute complete",
  QUIZ_SUBMIT: "Quiz soumis",
};

const WINDOW_DAYS = 7;

type CompanyAggregate = {
  company: string;
  users: number;
  activeUsers: number;
  listens: number;
  quizAttempts: number;
  sumScore: number;
  sumTotal: number;
};

function formatName(firstName: string, lastName: string) {
  const initial = lastName?.slice(0, 1) ?? "";
  return `${firstName} ${initial}.`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function formatAudioTitle(slug: string | null) {
  if (!slug) return "—";
  const base = slug.replace(/\.mp3$/i, "").replace(/^elearning\\d+-\\d+-/, "");
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCompany(value: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Entreprise non renseignee";
}

export default async function AdminPage() {
  const token = (await cookies()).get("ag_session")?.value;
  if (!token) {
    redirect("/connexion");
  }

  let userId: string | null = null;
  try {
    const payload = await verifySessionToken(token);
    userId = payload.sub ?? null;
  } catch {
    userId = null;
  }

  if (!userId) {
    redirect("/connexion");
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, company: true, companyId: true, firstName: true, lastName: true },
  });

  if (!adminUser || adminUser.role === "USER") {
    redirect("/parcours");
  }

  const isCompanyAdmin = adminUser.role === "ADMIN";
  const companyScope = isCompanyAdmin ? adminUser.company : null;
  const companyScopeId = isCompanyAdmin ? adminUser.companyId : null;
  const scopeLabel = companyScope
    ? `Entreprise: ${companyScope}`
    : isCompanyAdmin
      ? "Entreprise non renseignee"
      : "Toutes entreprises";

  const userFilter = isCompanyAdmin
    ? companyScopeId
      ? { companyId: companyScopeId }
      : { company: companyScope ?? "__missing__" }
    : undefined;
  const activityFilter = isCompanyAdmin
    ? companyScopeId
      ? { user: { companyId: companyScopeId } }
      : { user: { company: companyScope ?? "__missing__" } }
    : undefined;

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);

  const [users, listenStats7d, quizStats7d, activeUsers7d, lastActivity, logs] =
    await Promise.all([
      prisma.user.findMany({
        where: userFilter,
        select: { id: true, firstName: true, lastName: true, email: true, company: true },
      }),
      prisma.listenEvent.groupBy({
        by: ["userId"],
        where: {
          ...(activityFilter ?? {}),
          completedAt: { gte: windowStart },
        },
        _count: { _all: true },
      }),
      prisma.quizAttempt.groupBy({
        by: ["userId"],
        where: {
          ...(activityFilter ?? {}),
          createdAt: { gte: windowStart },
        },
        _count: { _all: true },
        _sum: { score: true, total: true },
      }),
      prisma.activityLog.groupBy({
        by: ["userId"],
        where: {
          ...(activityFilter ?? {}),
          createdAt: { gte: windowStart },
        },
        _count: { _all: true },
      }),
      prisma.activityLog.groupBy({
        by: ["userId"],
        where: activityFilter ? activityFilter : {},
        _max: { createdAt: true },
      }),
      prisma.activityLog.findMany({
        where: activityFilter ? activityFilter : {},
        orderBy: { createdAt: "desc" },
        take: 120,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, company: true },
          },
        },
      }),
    ]);

  const rows = logs as ActivityRow[];
  const userCount = users.length;
  const activeUserIds = new Set(activeUsers7d.map((row) => row.userId));

  const listenMap = new Map<string, number>();
  for (const row of listenStats7d) {
    listenMap.set(row.userId, row._count._all);
  }

  const quizMap = new Map<string, { count: number; sumScore: number; sumTotal: number }>();
  for (const row of quizStats7d) {
    quizMap.set(row.userId, {
      count: row._count._all,
      sumScore: row._sum.score ?? 0,
      sumTotal: row._sum.total ?? 0,
    });
  }

  const lastActivityMap = new Map<string, Date | null>();
  for (const row of lastActivity) {
    lastActivityMap.set(row.userId, row._max.createdAt ?? null);
  }

  const listenCount7d = listenStats7d.reduce((acc, row) => acc + row._count._all, 0);
  const quizCount7d = quizStats7d.reduce((acc, row) => acc + row._count._all, 0);

  const userCards = users.map((user) => {
    const listens = listenMap.get(user.id) ?? 0;
    const quizStat = quizMap.get(user.id);
    const quizAttempts = quizStat?.count ?? 0;
    const avgScore =
      quizStat && quizStat.sumTotal > 0
        ? Math.round((quizStat.sumScore / quizStat.sumTotal) * 100)
        : 0;
    const lastActive = lastActivityMap.get(user.id);
    return {
      id: user.id,
      name: formatName(user.firstName, user.lastName),
      email: user.email,
      company: formatCompany(user.company),
      listens,
      quizAttempts,
      avgScore,
      active: activeUserIds.has(user.id),
      lastActive,
    };
  });

  const companyCards = isCompanyAdmin
    ? []
    : Array.from(
        userCards.reduce((acc, card) => {
          const existing = acc.get(card.company) ?? {
            company: card.company,
            users: 0,
            activeUsers: 0,
            listens: 0,
            quizAttempts: 0,
            sumScore: 0,
            sumTotal: 0,
          };
          existing.users += 1;
          existing.activeUsers += card.active ? 1 : 0;
          existing.listens += card.listens;
          existing.quizAttempts += card.quizAttempts;
          if (card.quizAttempts > 0) {
            const quizStat = quizMap.get(card.id);
            existing.sumScore += quizStat?.sumScore ?? 0;
            existing.sumTotal += quizStat?.sumTotal ?? 0;
          }
          acc.set(card.company, existing);
          return acc;
        }, new Map<string, CompanyAggregate>()).values()
      ).map((entry) => ({
        company: entry.company,
        users: entry.users,
        activeUsers: entry.activeUsers,
        listens: entry.listens,
        quizAttempts: entry.quizAttempts,
        avgScore:
          entry.sumTotal > 0 ? Math.round((entry.sumScore / entry.sumTotal) * 100) : 0,
      }));

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Suivi" />
        <Link className={styles.back} href="/admin">
          Retour
        </Link>
      </header>

      <section className={styles.intro}>
        <span className={styles.pill}>{ROLE_LABELS[adminUser.role]}</span>
        <h1>Suivi des apprenants</h1>
        <p>Vue 7 derniers jours pour {scopeLabel}.</p>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <strong>{userCount}</strong>
          <span>utilisateurs</span>
        </div>
        <div className={styles.statCard}>
          <strong>{activeUserIds.size}</strong>
          <span>actifs 7j</span>
        </div>
        <div className={styles.statCard}>
          <strong>{listenCount7d}</strong>
          <span>ecoutes 7j</span>
        </div>
        <div className={styles.statCard}>
          <strong>{quizCount7d}</strong>
          <span>quiz 7j</span>
        </div>
      </section>

      {!isCompanyAdmin ? (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Vue entreprises</h2>
            <span className={styles.tag}>7 derniers jours</span>
          </div>
          <div className={styles.companyGrid}>
            {companyCards.length === 0 ? (
              <p className={styles.empty}>Aucune entreprise disponible.</p>
            ) : (
              companyCards.map((company) => (
                <div key={company.company} className={styles.miniCard}>
                  <div className={styles.miniHeader}>
                    <strong>{company.company}</strong>
                    <span className={styles.badge}>
                      {company.activeUsers}/{company.users} actifs
                    </span>
                  </div>
                  <div className={styles.metrics}>
                    <div className={styles.metric}>
                      <strong>{company.listens}</strong>
                      <span>ecoutes 7j</span>
                    </div>
                    <div className={styles.metric}>
                      <strong>{company.quizAttempts}</strong>
                      <span>quiz 7j</span>
                    </div>
                    <div className={styles.metric}>
                      <strong>{company.avgScore}%</strong>
                      <span>moyenne quiz</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Vue utilisateurs</h2>
          <span className={styles.tag}>7 derniers jours</span>
        </div>
        <div className={styles.userGrid}>
          {userCards.length === 0 ? (
            <p className={styles.empty}>Aucun utilisateur disponible.</p>
          ) : (
            userCards.map((user) => (
              <div key={user.id} className={styles.miniCard}>
                <div className={styles.miniHeader}>
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    {!isCompanyAdmin ? <small>{user.company}</small> : null}
                  </div>
                  <span
                    className={`${styles.badge} ${
                      user.active ? styles.badgeSuccess : styles.badgeWarn
                    }`}
                  >
                    {user.active ? "Actif" : "Inactif"}
                  </span>
                </div>
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <strong>{user.listens}</strong>
                    <span>ecoutes 7j</span>
                  </div>
                  <div className={styles.metric}>
                    <strong>{user.quizAttempts}</strong>
                    <span>quiz 7j</span>
                  </div>
                  <div className={styles.metric}>
                    <strong>{user.avgScore}%</strong>
                    <span>moyenne quiz</span>
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span>Derniere activite</span>
                  <span>
                    {user.lastActive ? formatDate(user.lastActive) : "Aucune"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Journal d&apos;activite</h2>
          <span className={styles.tag}>Derniers evenements</span>
        </div>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.rowHeader}`}>
            <div>Utilisateur</div>
            <div>Action</div>
            <div>Details</div>
          </div>
          {rows.length === 0 ? (
            <p className={styles.empty}>Aucune activite recente.</p>
          ) : (
            rows.map((log) => {
              const quizLabel =
                log.type === "QUIZ_SUBMIT" && log.total
                  ? `${log.score ?? 0}/${log.total}`
                  : null;
              return (
                <div key={log.id} className={styles.row}>
                  <div className={styles.cell}>
                    <span>{formatName(log.user.firstName, log.user.lastName)}</span>
                    <small>{log.user.email}</small>
                    <small>{log.user.company ?? "Entreprise non renseignee"}</small>
                  </div>
                  <div className={styles.cell}>
                    <span>{EVENT_LABELS[log.type] ?? log.type}</span>
                    <small>{formatDate(log.createdAt)}</small>
                  </div>
                  <div className={styles.cell}>
                    <span>{formatAudioTitle(log.audioSlug)}</span>
                    <div className={styles.status}>
                      {quizLabel ? (
                        <span
                          className={`${styles.badge} ${
                            log.passed ? styles.badgeSuccess : styles.badgeWarn
                          }`}
                        >
                          {quizLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
