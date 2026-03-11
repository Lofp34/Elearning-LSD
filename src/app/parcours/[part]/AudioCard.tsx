"use client";

import Link from "next/link";
import { useRef } from "react";
import styles from "./page.module.css";

type AudioItem = {
  url: string;
  title: string;
  index: number;
  slug: string;
  releaseId?: string;
  moduleId?: string;
  trackingSlug?: string;
};

type QuizResult = { score: number; total: number; passed: boolean };

export default function AudioCard({
  item,
  accent,
  listened,
  listenPercent,
  quizResult,
}: {
  item: AudioItem;
  accent: string;
  listened: boolean;
  listenPercent: number;
  quizResult?: QuizResult;
}) {
  const sentMilestonesRef = useRef<Set<number>>(new Set());

  async function sendProgress(progress: number) {
    if (!item.releaseId || !item.moduleId) return;
    try {
      await fetch("/api/listen/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: item.trackingSlug ?? item.slug,
          releaseId: item.releaseId,
          moduleId: item.moduleId,
          listenPercent: progress,
        }),
      });
    } catch {
      // ignore network errors
    }
  }

  function handleTimeUpdate(event: React.SyntheticEvent<HTMLAudioElement>) {
    const audio = event.currentTarget;
    if (!audio.duration || Number.isNaN(audio.duration)) return;
    const percent = Math.round((audio.currentTime / audio.duration) * 100);
    const milestones = [25, 50, 75, 90];
    for (const milestone of milestones) {
      if (percent >= milestone && !sentMilestonesRef.current.has(milestone)) {
        sentMilestonesRef.current.add(milestone);
        void sendProgress(milestone);
      }
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.index} style={{ color: accent }}>
          {item.index.toString().padStart(2, "0")}
        </span>
        <div>
          <h3>{item.title}</h3>
          <p>Audio court + quiz 5 questions</p>
        </div>
      </div>
      <audio
        controls
        preload="none"
        src={item.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => void sendProgress(100)}
      />
      <div className={styles.statusRow}>
        {listened ? (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>Ecoutee</span>
        ) : (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>{listenPercent}% ecoute</span>
        )}
        {quizResult ? (
          <span
            className={`${styles.badge} ${
              quizResult.passed ? styles.badgeSuccess : styles.badgeWarning
            }`}
          >
            Quiz: {quizResult.score}/{quizResult.total}
          </span>
        ) : (
          <span className={styles.badge}>Quiz non fait</span>
        )}
      </div>
      <div className={styles.cardActions}>
        <Link className={styles.primary} href={`/quiz/${encodeURIComponent(item.slug)}`}>
          Lancer le quiz
        </Link>
      </div>
    </article>
  );
}
