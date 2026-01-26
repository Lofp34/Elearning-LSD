"use client";

import Link from "next/link";
import { useRef } from "react";
import styles from "./page.module.css";

type AudioItem = {
  url: string;
  title: string;
  index: number;
  slug: string;
};

type QuizResult = { score: number; total: number; passed: boolean };

export default function AudioCard({
  item,
  accent,
  listened,
  quizResult,
}: {
  item: AudioItem;
  accent: string;
  listened: boolean;
  quizResult?: QuizResult;
}) {
  const sentRef = useRef(false);

  async function markComplete() {
    if (sentRef.current) return;
    sentRef.current = true;
    try {
      await fetch("/api/listen/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug }),
      });
    } catch {
      // ignore network errors
    }
  }

  function handleTimeUpdate(event: React.SyntheticEvent<HTMLAudioElement>) {
    const audio = event.currentTarget;
    if (!audio.duration || Number.isNaN(audio.duration)) return;
    const progress = audio.currentTime / audio.duration;
    if (progress >= 0.9) {
      markComplete();
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
        onEnded={markComplete}
      />
      <div className={styles.statusRow}>
        {listened ? (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>Ecoutee</span>
        ) : (
          <span className={styles.badge}>A ecouter</span>
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
        <Link className={styles.primary} href={`/quiz/${item.slug}`}>
          Lancer le quiz
        </Link>
      </div>
    </article>
  );
}
