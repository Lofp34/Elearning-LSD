import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { canAccessCompany, getAuthUserScope, isAdminRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import InterviewUploadPanel from "./InterviewUploadPanel";
import VoicesPanel from "./VoicesPanel";
import ReleaseActionButtons from "./ReleaseActionButtons";
import JobRetryButton from "./JobRetryButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export default async function CompanyWizardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const authUser = await getAuthUserScope();
  if (!authUser) redirect("/connexion");
  if (!isAdminRole(authUser.role)) redirect("/parcours");

  const { companyId } = await params;
  const allowed = await canAccessCompany(authUser, companyId);
  if (!allowed) redirect("/admin/gestion");

  const [company, interviews, releases, jobs] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        femaleVoiceName: true,
        maleVoiceName: true,
      },
    }),
    prisma.interviewDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        extractedText: true,
      },
      take: 30,
    }),
    prisma.learningRelease.findMany({
      where: { companyId },
      orderBy: { version: "desc" },
      take: 8,
      include: {
        modules: {
          select: {
            id: true,
            scriptText: true,
            reviewStatus: true,
            quizQuestions: { select: { id: true } },
            audioAsset: { select: { status: true } },
          },
        },
      },
    }),
    prisma.generationJob.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        release: {
          select: {
            version: true,
          },
        },
      },
    }),
  ]);

  if (!company) {
    redirect("/admin/gestion");
  }

  const latestRelease = releases[0];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Wizard societe" />
        <div className={styles.headerActions}>
          <Link className={styles.back} href="/admin/gestion">
            Retour gestion
          </Link>
        </div>
      </header>

      <section className={styles.introCard}>
        <h1>{company.name}</h1>
        <p>
          Slug: <strong>{company.slug}</strong>
        </p>
        <p>
          Derniere release: <strong>{latestRelease ? `v${latestRelease.version}` : "Aucune"}</strong>
        </p>
        <div className={styles.inlineMeta}>
          <span>Voix F: {company.femaleVoiceName ?? "non definie"}</span>
          <span>Voix M: {company.maleVoiceName ?? "non definie"}</span>
        </div>
      </section>

      <InterviewUploadPanel
        companyId={companyId}
        initialInterviews={interviews.map((item) => ({
          id: item.id,
          filename: item.filename,
          status: item.status,
          errorMessage: item.errorMessage,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          extractedTextLength: item.extractedText?.length ?? 0,
        }))}
      />

      <VoicesPanel companyId={companyId} />

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>3. Releases et execution pipeline</h2>
        </div>

        <ReleaseActionButtons companyId={companyId} releaseId={latestRelease?.id} />

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Version</th>
                <th>Statut</th>
                <th>Scripts</th>
                <th>Review</th>
                <th>Quiz OK</th>
                <th>Audio OK</th>
                <th>Publiee</th>
              </tr>
            </thead>
            <tbody>
              {releases.length === 0 ? (
                <tr>
                  <td colSpan={7}>Aucune release.</td>
                </tr>
              ) : (
                releases.map((release) => {
                  const total = release.modules.length;
                  const scripts = release.modules.filter((module) => module.scriptText.trim().length > 0).length;
                  const approved = release.modules.filter((module) => module.reviewStatus === "APPROVED").length;
                  const quizReady = release.modules.filter((module) => module.quizQuestions.length === 5).length;
                  const audioReady = release.modules.filter((module) => module.audioAsset?.status === "GENERATED").length;

                  return (
                    <tr key={release.id}>
                      <td>
                        <strong>v{release.version}</strong>
                      </td>
                      <td>{release.status}</td>
                      <td>
                        {scripts}/{total}
                      </td>
                      <td>
                        {approved}/{total}
                      </td>
                      <td>
                        {quizReady}/{total}
                      </td>
                      <td>
                        {audioReady}/{total}
                      </td>
                      <td>{formatDate(release.publishedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>4. Jobs asynchrones</h2>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job</th>
                <th>Release</th>
                <th>Statut</th>
                <th>Step</th>
                <th>Tentatives</th>
                <th>Maj</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7}>Aucun job pour le moment.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.jobType}</strong>
                      {job.lastError ? <div className={styles.errorSmall}>{job.lastError}</div> : null}
                    </td>
                    <td>{job.release ? `v${job.release.version}` : "-"}</td>
                    <td>{job.status}</td>
                    <td>{job.step ?? "-"}</td>
                    <td>{job.attempts}</td>
                    <td>{formatDate(job.updatedAt)}</td>
                    <td>{job.status === "FAILED" ? <JobRetryButton jobId={job.id} /> : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
