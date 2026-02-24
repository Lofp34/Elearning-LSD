import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { QUIZZES } from "@/data/quizzes";
import { prisma } from "@/lib/prisma";
import { isNewContentEngineEnabled } from "@/lib/feature-flags";
import { getSessionUserId } from "@/lib/session-user";
import {
  RELEASE_MODULE_SEPARATOR,
  buildTrackingAudioSlug,
  parseReleaseModuleSlug,
} from "@/lib/learning/slug";
import QuizClient, { type QuizData } from "./QuizClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function resolveQuizKey(slug: string) {
  const normalized = decodeURIComponent(slug)
    .replace(/\.mp3$/i, "")
    .replace(/_/g, "-")
    .toLowerCase();

  if (QUIZZES[normalized]) return normalized;

  const keys = Object.keys(QUIZZES);
  return (
    keys.find((key) => key.toLowerCase() === normalized) ??
    keys.find((key) => key.toLowerCase().endsWith(normalized)) ??
    keys.find((key) => normalized.endsWith(key.toLowerCase()))
  );
}

export default async function QuizPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const rawSlug = resolvedParams.slug;
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : "";

  const key = rawSlug ? resolveQuizKey(rawSlug) : undefined;
  const legacyQuiz = key ? QUIZZES[key] : undefined;

  let quizData: QuizData | null = null;
  let errorMessage = "";

  if (legacyQuiz) {
    quizData = {
      title: legacyQuiz.title,
      questions: legacyQuiz.questions,
      releaseId: null,
      moduleId: null,
      trackingSlug: key ?? decodedSlug,
    };
  } else if (decodedSlug.includes(RELEASE_MODULE_SEPARATOR)) {
    const parsed = parseReleaseModuleSlug(decodedSlug);
    if (!parsed) {
      errorMessage = "Slug module invalide.";
    } else {
      const userId = await getSessionUserId();
      if (!userId) {
        errorMessage = "Connecte-toi pour acceder a ce quiz.";
      } else {
        const learningModule = await prisma.learningModule.findFirst({
          where: {
            releaseId: parsed.releaseId,
            contentKey: parsed.contentKey,
          },
          include: {
            release: {
              select: {
                id: true,
                version: true,
                status: true,
              },
            },
            quizQuestions: {
              orderBy: { orderIndex: "asc" },
              select: {
                question: true,
                options: true,
                answerIndex: true,
              },
            },
          },
        });

        if (!learningModule) {
          errorMessage = "Module introuvable.";
        } else if (learningModule.release.status !== "PUBLISHED") {
          errorMessage = "Release non publiee.";
        } else if (learningModule.quizQuestions.length !== 5) {
          errorMessage = "Quiz incomplet pour ce module.";
        } else {
          if (isNewContentEngineEnabled()) {
            const enrollment = await prisma.learnerEnrollment.findFirst({
              where: {
                userId,
                releaseId: learningModule.release.id,
                isActive: true,
              },
              select: { id: true },
            });

            if (!enrollment) {
              errorMessage = "Aucune assignation active pour ce module.";
            }
          }

          if (!errorMessage) {
            quizData = {
              title: learningModule.title,
              releaseId: learningModule.release.id,
              moduleId: learningModule.id,
              trackingSlug: buildTrackingAudioSlug(
                learningModule.release.version,
                learningModule.contentKey
              ),
              questions: learningModule.quizQuestions.map((question) => ({
                question: question.question,
                options: Array.isArray(question.options)
                  ? question.options.map((item) => String(item))
                  : ["", "", "", ""],
                answerIndex: question.answerIndex,
              })),
            };
          }
        }
      }
    }
  } else {
    errorMessage = "Ce quiz n'existe pas.";
  }

  if (!quizData) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.tag}>Quiz introuvable</p>
          <h1>Ce quiz n&apos;existe pas</h1>
          <p>Retourne au parcours pour choisir un audio valide.</p>
          <p className={styles.slug}>Slug recu: {decodedSlug}</p>
          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
          <Link className={styles.primary} href="/parcours">
            Retour au parcours
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <BrandMark subtitle="Quiz audio" />
          <div className={styles.headerText}>
            <h1>{quizData.title}</h1>
            <p className={styles.subtitle}>5 questions pour valider l&apos;audio.</p>
          </div>
        </div>
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <QuizClient key={`${decodedSlug}-${quizData.releaseId ?? "legacy"}`} quizData={quizData} />
    </main>
  );
}
