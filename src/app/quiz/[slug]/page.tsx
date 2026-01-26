"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { QUIZZES } from "@/data/quizzes";
import styles from "./page.module.css";

function resolveQuizKey(slug: string) {
  const normalized = decodeURIComponent(slug)
    .replace(/\.mp3$/i, "")
    .replace(/_/g, "-")
    .toLowerCase();

  if (QUIZZES[normalized]) {
    return normalized;
  }

  const keys = Object.keys(QUIZZES);
  return (
    keys.find((key) => key.toLowerCase() === normalized) ??
    keys.find((key) => key.toLowerCase().endsWith(normalized)) ??
    keys.find((key) => normalized.endsWith(key.toLowerCase()))
  );
}

export default function QuizPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const rawSlug = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug;
  const key = rawSlug ? resolveQuizKey(rawSlug) : undefined;
  const quiz = key ? QUIZZES[key] : undefined;
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (quiz) {
      setAnswers(Array(quiz.questions.length).fill(-1));
      setSubmitted(false);
    }
  }, [quiz]);

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.answerIndex ? 1 : 0);
    }, 0);
  }, [answers, quiz]);

  if (!quiz) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.tag}>Quiz introuvable</p>
          <h1>Ce quiz n'existe pas</h1>
          <p>Retourne au parcours pour choisir un audio valide.</p>
          <p className={styles.slug}>
            Slug recu: {rawSlug ? decodeURIComponent(rawSlug) : "undefined"}
          </p>
          <Link className={styles.primary} href="/parcours">
            Retour au parcours
          </Link>
        </div>
      </main>
    );
  }

  const quizData = quiz;

  function handleSelect(questionIndex: number, optionIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleReset() {
    setAnswers(Array(quizData.questions.length).fill(-1));
    setSubmitted(false);
  }

  const total = quizData.questions.length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Quiz audio</p>
          <h1>{quizData.title}</h1>
          <p className={styles.subtitle}>5 questions pour valider l'audio.</p>
        </div>
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <form className={styles.quiz} onSubmit={handleSubmit}>
        {quizData.questions.map((question, qIndex) => (
          <section key={question.question} className={styles.card}>
            <p className={styles.questionLabel}>Question {qIndex + 1}</p>
            <h2>{question.question}</h2>
            <div className={styles.options}>
              {question.options.map((option, oIndex) => {
                const selected = answers[qIndex] === oIndex;
                const isCorrect = submitted && question.answerIndex === oIndex;
                const isWrong = submitted && selected && question.answerIndex !== oIndex;

                return (
                  <label
                    key={option}
                    className={`${styles.option} ${selected ? styles.selected : ""} ${
                      isCorrect ? styles.correct : ""
                    } ${isWrong ? styles.wrong : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={oIndex}
                      checked={selected}
                      onChange={() => handleSelect(qIndex, oIndex)}
                      disabled={submitted}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}

        <div className={styles.actions}>
          {!submitted ? (
            <button className={styles.primary} type="submit">
              Valider le quiz
            </button>
          ) : (
            <>
              <div className={styles.score}>
                Score: {score} / {total}
              </div>
              <button className={styles.secondary} type="button" onClick={handleReset}>
                Refaire le quiz
              </button>
              <Link className={styles.primary} href="/parcours">
                Retour au parcours
              </Link>
            </>
          )}
        </div>
      </form>
    </main>
  );
}
