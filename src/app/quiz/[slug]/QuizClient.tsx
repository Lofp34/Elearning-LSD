"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./page.module.css";

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type QuizData = {
  title: string;
  questions: QuizQuestion[];
  releaseId: string | null;
  moduleId: string | null;
  trackingSlug: string;
};

export default function QuizClient({ quizData }: { quizData: QuizData }) {
  const [answers, setAnswers] = useState<number[]>(Array(quizData.questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const score = useMemo(() => {
    return quizData.questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.answerIndex ? 1 : 0);
    }, 0);
  }, [answers, quizData.questions]);

  const total = quizData.questions.length;

  function handleSelect(questionIndex: number, optionIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (answers.some((value) => value === -1)) {
      setSubmitError("Merci de repondre a toutes les questions.");
      return;
    }

    setSubmitError("");
    setSubmitted(true);

    fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: quizData.trackingSlug,
        score,
        total,
        releaseId: quizData.releaseId,
        moduleId: quizData.moduleId,
      }),
    }).catch(() => null);
  }

  function handleReset() {
    setAnswers(Array(quizData.questions.length).fill(-1));
    setSubmitted(false);
  }

  return (
    <form className={styles.quiz} onSubmit={handleSubmit}>
      {quizData.questions.map((question, qIndex) => (
        <section key={`${question.question}-${qIndex}`} className={styles.card}>
          <p className={styles.questionLabel}>Question {qIndex + 1}</p>
          <h2>{question.question}</h2>
          <div className={styles.options}>
            {question.options.map((option, oIndex) => {
              const selected = answers[qIndex] === oIndex;
              const isCorrect = submitted && question.answerIndex === oIndex;
              const isWrong = submitted && selected && question.answerIndex !== oIndex;

              return (
                <label
                  key={`${option}-${oIndex}`}
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
          <>
            <button className={styles.primary} type="submit">
              Valider le quiz
            </button>
            {submitError ? <p className={styles.error}>{submitError}</p> : null}
          </>
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
  );
}
