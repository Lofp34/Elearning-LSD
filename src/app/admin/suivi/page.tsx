import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { getAuthUserScope, isAdminRole, isSuperAdmin } from "@/lib/authz";
import { getProgressReportRows } from "@/lib/reporting/progress-report";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
};

type LearnerSummary = {
  key: string;
  companyName: string;
  releaseVersion: number;
  learnerName: string;
  learnerEmail: string;
  totalModules: number;
  completedModules: number;
  quizPassedModules: number;
  listenTotal: number;
  quizScoreTotal: number;
  quizTotalTotal: number;
  lastActivityAt: Date | null;
};

function formatDate(value: Date | null) {
  if (!value) return "Aucune activite";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default async function AdminFollowUpPage() {
  const authUser = await getAuthUserScope();
  if (!authUser) {
    redirect("/connexion");
  }
  if (!isAdminRole(authUser.role)) {
    redirect("/parcours");
  }

  const rows = await getProgressReportRows(authUser);
  const scopeLabel = isSuperAdmin(authUser.role)
    ? "Toutes entreprises"
    : authUser.company ?? "Entreprise non renseignee";

  const learnerSummaries = Array.from(
    rows.reduce((acc, row) => {
      const key = `${row.userId}:${row.releaseId}`;
      const current = acc.get(key) ?? {
        key,
        companyName: row.companyName,
        releaseVersion: row.releaseVersion,
        learnerName: row.learnerName,
        learnerEmail: row.learnerEmail,
        totalModules: 0,
        completedModules: 0,
        quizPassedModules: 0,
        listenTotal: 0,
        quizScoreTotal: 0,
        quizTotalTotal: 0,
        lastActivityAt: null,
      };

      current.totalModules += 1;
      current.completedModules += row.completed ? 1 : 0;
      current.quizPassedModules += row.quizPassed ? 1 : 0;
      current.listenTotal += row.listenPercentMax;
      current.quizScoreTotal += row.quizBestScore ?? 0;
      current.quizTotalTotal += row.quizBestTotal ?? 0;

      if (!current.lastActivityAt || (row.lastActivityAt && row.lastActivityAt > current.lastActivityAt)) {
        current.lastActivityAt = row.lastActivityAt;
      }

      acc.set(key, current);
      return acc;
    }, new Map<string, LearnerSummary>()).values()
  )
    .map((entry) => ({
      ...entry,
      completionRate:
        entry.totalModules > 0 ? Math.round((entry.completedModules / entry.totalModules) * 100) : 0,
      quizPassRate:
        entry.totalModules > 0 ? Math.round((entry.quizPassedModules / entry.totalModules) * 100) : 0,
      avgListen:
        entry.totalModules > 0 ? Math.round(entry.listenTotal / entry.totalModules) : 0,
      avgQuizScore:
        entry.quizTotalTotal > 0 ? Math.round((entry.quizScoreTotal / entry.quizTotalTotal) * 100) : 0,
    }))
    .sort((a, b) => {
      const activityDelta = (b.lastActivityAt?.getTime() ?? 0) - (a.lastActivityAt?.getTime() ?? 0);
      if (activityDelta !== 0) return activityDelta;
      return a.learnerName.localeCompare(b.learnerName, "fr");
    });

  const companySummaries = Array.from(
    learnerSummaries.reduce((acc, learner) => {
      const current = acc.get(learner.companyName) ?? {
        companyName: learner.companyName,
        learnerCount: 0,
        completionRateTotal: 0,
        quizRateTotal: 0,
        avgListenTotal: 0,
      };

      current.learnerCount += 1;
      current.completionRateTotal += learner.completionRate;
      current.quizRateTotal += learner.quizPassRate;
      current.avgListenTotal += learner.avgListen;
      acc.set(learner.companyName, current);
      return acc;
    }, new Map<
      string,
      {
        companyName: string;
        learnerCount: number;
        completionRateTotal: number;
        quizRateTotal: number;
        avgListenTotal: number;
      }
    >()).values()
  )
    .map((entry) => ({
      companyName: entry.companyName,
      learnerCount: entry.learnerCount,
      completionRate:
        entry.learnerCount > 0 ? Math.round(entry.completionRateTotal / entry.learnerCount) : 0,
      quizRate:
        entry.learnerCount > 0 ? Math.round(entry.quizRateTotal / entry.learnerCount) : 0,
      avgListen:
        entry.learnerCount > 0 ? Math.round(entry.avgListenTotal / entry.learnerCount) : 0,
    }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName, "fr"));

  const recentRows = [...rows]
    .sort((a, b) => {
      const activityDelta = (b.lastActivityAt?.getTime() ?? 0) - (a.lastActivityAt?.getTime() ?? 0);
      if (activityDelta !== 0) return activityDelta;
      return a.learnerName.localeCompare(b.learnerName, "fr");
    })
    .slice(0, 24);

  const uniqueLearners = new Set(rows.map((row) => row.userId)).size;
  const uniqueReleases = new Set(rows.map((row) => row.releaseId)).size;
  const completionRate =
    rows.length > 0 ? Math.round((rows.filter((row) => row.completed).length / rows.length) * 100) : 0;
  const quizPassRate =
    rows.length > 0 ? Math.round((rows.filter((row) => row.quizPassed).length / rows.length) * 100) : 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Suivi" />
        <Link className={styles.back} href="/admin">
          Retour
        </Link>
      </header>

      <section className={styles.intro}>
        <span className={styles.pill}>{ROLE_LABELS[authUser.role] ?? "Admin"}</span>
        <h1>Suivi apprenants</h1>
        <p>
          Scope: <strong>{scopeLabel}</strong>
        </p>
        <p>
          Tableau Qualiopi des ecoutes, quiz, completions et derniere activite par apprenant et par
          release.
        </p>
        <a className={styles.back} href="/api/admin/reports/progress">
          Export CSV
        </a>
      </section>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <strong>{uniqueLearners}</strong>
          <span>Apprenants suivis</span>
        </article>
        <article className={styles.statCard}>
          <strong>{uniqueReleases}</strong>
          <span>Releases actives</span>
        </article>
        <article className={styles.statCard}>
          <strong>{formatPercent(completionRate)}</strong>
          <span>Modules completes</span>
        </article>
        <article className={styles.statCard}>
          <strong>{formatPercent(quizPassRate)}</strong>
          <span>Quiz valides</span>
        </article>
      </section>

      {isSuperAdmin(authUser.role) ? (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Vue entreprises</h2>
            <span className={styles.tag}>Consolide</span>
          </div>

          {companySummaries.length === 0 ? (
            <p className={styles.empty}>Aucune donnee de progression disponible.</p>
          ) : (
            <div className={styles.companyGrid}>
              {companySummaries.map((company) => (
                <article key={company.companyName} className={styles.miniCard}>
                  <div className={styles.miniHeader}>
                    <strong>{company.companyName}</strong>
                    <small>{company.learnerCount} apprenants</small>
                  </div>
                  <div className={styles.metrics}>
                    <div className={styles.metric}>
                      <strong>{formatPercent(company.completionRate)}</strong>
                      <span>Completion</span>
                    </div>
                    <div className={styles.metric}>
                      <strong>{formatPercent(company.quizRate)}</strong>
                      <span>Quiz valides</span>
                    </div>
                    <div className={styles.metric}>
                      <strong>{formatPercent(company.avgListen)}</strong>
                      <span>Ecoute moyenne</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Vue apprenants</h2>
          <span className={styles.tag}>Release active</span>
        </div>

        {learnerSummaries.length === 0 ? (
          <p className={styles.empty}>Aucun apprenant assigne ou aucune progression disponible.</p>
        ) : (
          <div className={styles.userGrid}>
            {learnerSummaries.map((learner) => (
              <article key={learner.key} className={styles.miniCard}>
                <div className={styles.miniHeader}>
                  <div>
                    <strong>{learner.learnerName}</strong>
                    <small>{learner.learnerEmail}</small>
                  </div>
                  <small>
                    {learner.companyName} · v{learner.releaseVersion}
                  </small>
                </div>

                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <strong>{formatPercent(learner.completionRate)}</strong>
                    <span>Completion</span>
                  </div>
                  <div className={styles.metric}>
                    <strong>{formatPercent(learner.avgListen)}</strong>
                    <span>Ecoute moyenne</span>
                  </div>
                  <div className={styles.metric}>
                    <strong>{formatPercent(learner.avgQuizScore)}</strong>
                    <span>Score quiz</span>
                  </div>
                </div>

                <div className={styles.metaRow}>
                  <span>
                    Quiz valides: {learner.quizPassedModules}/{learner.totalModules}
                  </span>
                  <span>Derniere activite: {formatDate(learner.lastActivityAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Details modules</h2>
          <span className={styles.tag}>Preuves Qualiopi</span>
        </div>

        {recentRows.length === 0 ? (
          <p className={styles.empty}>Aucune activite module disponible.</p>
        ) : (
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.rowHeader}`}>
              <div className={styles.cell}>Apprenant / module</div>
              <div className={styles.cell}>Ecoute / quiz</div>
              <div className={styles.cell}>Derniere activite</div>
            </div>

            {recentRows.map((row) => (
              <div key={`${row.userId}:${row.releaseId}:${row.moduleId}`} className={styles.row}>
                <div className={styles.cell}>
                  <strong>{row.learnerName}</strong>
                  <small>{row.learnerEmail}</small>
                  <small>
                    {row.companyName} · v{row.releaseVersion} · Module {row.orderIndex}
                  </small>
                  <small>{row.moduleTitle}</small>
                </div>

                <div className={styles.cell}>
                  <span className={styles.status}>
                    <span
                      className={`${styles.badge} ${row.completed ? styles.badgeSuccess : styles.badgeWarn}`}
                    >
                      Ecoute {row.listenPercentMax}%
                    </span>
                  </span>
                  <span className={styles.status}>
                    <span
                      className={`${styles.badge} ${row.quizPassed ? styles.badgeSuccess : styles.badgeWarn}`}
                    >
                      Quiz {row.quizBestScore ?? 0}/{row.quizBestTotal ?? 0}
                    </span>
                  </span>
                  <small>{row.partKey}</small>
                </div>

                <div className={styles.cell}>
                  <strong>{formatDate(row.lastActivityAt)}</strong>
                  <small>{row.moduleType}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
