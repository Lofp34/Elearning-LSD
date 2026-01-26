import { list } from "@vercel/blob";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import BrandMark from "@/components/BrandMark";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function ProgressionPage() {
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

  const { blobs } = await list({ prefix: "audio/", limit: 200 });
  const totalAudios = blobs.length;

  let listensCount = 0;
  let quizValidatedCount = 0;
  let progressPct = 0;

  if (userId) {
    listensCount = await prisma.listenEvent.count({ where: { userId } });
    const passedQuizzes = await prisma.quizAttempt.findMany({
      where: { userId, passed: true },
      distinct: ["audioSlug"],
      select: { audioSlug: true },
    });
    quizValidatedCount = passedQuizzes.length;
    progressPct = totalAudios > 0 ? Math.round((quizValidatedCount / totalAudios) * 100) : 0;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Progression" />
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>
      <section className={styles.card}>
        <p className={styles.label}>Suivi en cours</p>
        <h2>Ta progression globale</h2>
        <p>Quiz valides: {quizValidatedCount}</p>
        <p>Ecoutes completees: {listensCount}</p>
        <p>Progression: {progressPct}%</p>
        <Link className={styles.cta} href="/parcours">
          Revenir au parcours
        </Link>
      </section>
    </main>
  );
}
