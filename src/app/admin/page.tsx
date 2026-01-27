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
    select: { role: true, company: true, firstName: true, lastName: true },
  });

  if (!adminUser || adminUser.role === "USER") {
    redirect("/parcours");
  }

  const isCompanyAdmin = adminUser.role === "ADMIN";
  const companyScope = isCompanyAdmin ? adminUser.company : null;
  const scopeLabel = companyScope
    ? `Entreprise: ${companyScope}`
    : isCompanyAdmin
      ? "Entreprise non renseignee"
      : "Toutes entreprises";

  const userFilter = isCompanyAdmin
    ? { company: companyScope ?? "__missing__" }
    : undefined;
  const activityFilter = isCompanyAdmin
    ? { user: { company: companyScope ?? "__missing__" } }
    : undefined;

  const [userCount, listenCount, quizCount, loginCount, logs] = await Promise.all([
    prisma.user.count({ where: userFilter }),
    prisma.listenEvent.count({
      where: activityFilter ? activityFilter : {},
    }),
    prisma.quizAttempt.count({
      where: activityFilter ? activityFilter : {},
    }),
    prisma.activityLog.count({
      where: { ...(activityFilter ?? {}), type: "LOGIN" },
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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin" />
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <section className={styles.intro}>
        <span className={styles.pill}>{ROLE_LABELS[adminUser.role]}</span>
        <h1>Tableau admin</h1>
        <p>Suivi des connexions, ecoutes completes et quiz pour {scopeLabel}.</p>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <strong>{userCount}</strong>
          <span>utilisateurs</span>
        </div>
        <div className={styles.statCard}>
          <strong>{loginCount}</strong>
          <span>connexions</span>
        </div>
        <div className={styles.statCard}>
          <strong>{listenCount}</strong>
          <span>ecoutes completes</span>
        </div>
        <div className={styles.statCard}>
          <strong>{quizCount}</strong>
          <span>quiz soumis</span>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Journal d'activite</h2>
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
