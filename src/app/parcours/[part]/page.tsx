import { list } from "@vercel/blob";
import Link from "next/link";
import { notFound } from "next/navigation";
import AudioCard from "./AudioCard";
import styles from "./page.module.css";
import BrandMark from "@/components/BrandMark";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session-user";
import { getActiveLearnerRelease } from "@/lib/learning/user-release";
import { buildReleaseModuleSlug, buildTrackingAudioSlug } from "@/lib/learning/slug";

export const dynamic = "force-dynamic";

const PARTS: Record<string, { title: string; subtitle: string; prefix: string; accent: string }> = {
  mental: {
    title: "Mental",
    subtitle: "Posture, confiance, resilience",
    prefix: "audio/elearning1-",
    accent: "#ff6b4a",
  },
  pyramide: {
    title: "Pyramide de la vente",
    subtitle: "De la prise de contact au closing",
    prefix: "audio/elearning2-",
    accent: "#2f5f59",
  },
  techniques: {
    title: "Techniques",
    subtitle: "Ecoute, questionnement, rythme",
    prefix: "audio/elearning3-",
    accent: "#f1a95f",
  },
};

type Item = {
  url: string;
  title: string;
  index: number;
  slug: string;
  moduleId?: string;
  releaseId?: string;
  trackingSlug?: string;
};

function formatTitle(filename: string) {
  const base = filename.replace(/\.mp3$/i, "").replace(/^elearning\d+-\d+-/, "");
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIndex(filename: string) {
  const match = filename.match(/elearning\d+-(\d+)-/i);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export default async function PartPage({
  params,
}: {
  params: { part: string } | Promise<{ part: string }>;
}) {
  const { part } = await Promise.resolve(params);
  const config = PARTS[part];
  if (!config) {
    notFound();
  }

  const userId = await getSessionUserId();
  const activeRelease = userId ? await getActiveLearnerRelease(userId) : null;

  let items: Item[] = [];

  if (activeRelease) {
    const modules = await prisma.learningModule.findMany({
      where: {
        releaseId: activeRelease.releaseId,
        partKey: part,
      },
      orderBy: { orderIndex: "asc" },
      include: {
        audioAsset: {
          select: {
            blobPath: true,
            status: true,
          },
        },
      },
    });

    items = modules
      .filter((module) => module.audioAsset?.status === "GENERATED")
      .map((module) => ({
        url: module.audioAsset?.blobPath ?? "",
        title: module.title,
        index: module.orderIndex,
        slug: buildReleaseModuleSlug(activeRelease.releaseId, module.contentKey),
        moduleId: module.id,
        releaseId: activeRelease.releaseId,
        trackingSlug: buildTrackingAudioSlug(activeRelease.version, module.contentKey),
      }));
  } else {
    const { blobs } = await list({ prefix: config.prefix, limit: 200 });
    items = blobs
      .map((blob) => {
        const filename = blob.pathname.split("/").pop() ?? "";
        return {
          url: blob.url,
          title: formatTitle(filename),
          index: getIndex(filename),
          slug: filename.replace(/\.mp3$/i, ""),
        };
      })
      .sort((a, b) => a.index - b.index);
  }

  let listened = new Set<string>();
  const quizMap = new Map<string, { score: number; total: number; passed: boolean }>();

  if (userId && items.length > 0) {
    if (activeRelease) {
      const moduleIds = items.map((item) => item.moduleId).filter(Boolean) as string[];

      const [listenEvents, quizAttempts] = await Promise.all([
        prisma.listenEvent.findMany({
          where: {
            userId,
            releaseId: activeRelease.releaseId,
            moduleId: { in: moduleIds },
          },
          select: { moduleId: true },
        }),
        prisma.quizAttempt.findMany({
          where: {
            userId,
            releaseId: activeRelease.releaseId,
            moduleId: { in: moduleIds },
          },
          orderBy: { createdAt: "desc" },
          select: { moduleId: true, score: true, total: true, passed: true },
        }),
      ]);

      listened = new Set(listenEvents.map((event) => event.moduleId ?? "").filter(Boolean));

      for (const attempt of quizAttempts) {
        if (attempt.moduleId && !quizMap.has(attempt.moduleId)) {
          quizMap.set(attempt.moduleId, {
            score: attempt.score,
            total: attempt.total,
            passed: attempt.passed,
          });
        }
      }
    } else {
      const slugs = items.map((item) => item.slug);
      const listenEvents = await prisma.listenEvent.findMany({
        where: { userId, audioSlug: { in: slugs } },
        select: { audioSlug: true },
      });
      listened = new Set(listenEvents.map((event) => event.audioSlug));

      const quizAttempts = await prisma.quizAttempt.findMany({
        where: { userId, audioSlug: { in: slugs } },
        orderBy: { createdAt: "desc" },
        select: { audioSlug: true, score: true, total: true, passed: true },
      });

      for (const attempt of quizAttempts) {
        if (!quizMap.has(attempt.audioSlug)) {
          quizMap.set(attempt.audioSlug, {
            score: attempt.score,
            total: attempt.total,
            passed: attempt.passed,
          });
        }
      }
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <BrandMark subtitle="Parcours" />
          <div>
            <h1>{config.title}</h1>
            <p className={styles.subtitle}>{config.subtitle}</p>
          </div>
        </div>
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <section className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucun audio dans cette partie.</p>
            <Link href="/audio">Voir les fichiers Blob</Link>
          </div>
        ) : (
          items.map((item) => (
            <AudioCard
              key={item.slug}
              item={item}
              accent={config.accent}
              listened={activeRelease ? (item.moduleId ? listened.has(item.moduleId) : false) : listened.has(item.slug)}
              quizResult={quizMap.get(activeRelease ? (item.moduleId ?? "") : item.slug)}
            />
          ))
        )}
      </section>
    </main>
  );
}
