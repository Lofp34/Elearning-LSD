"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QUIZZES } from "@/data/quizzes";
import styles from "./page.module.css";

export default function QuizPage({ params }: { params: { slug: string } }) {
  const quiz = QUIZZES[params.slug];
  const [answers, setAnswers] = useState<number[]>(
    quiz ? Array(quiz.questions.length).fill(-1) : []
  );
  const [submitted, setSubmitted] = useState(false);

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
          <Link className={styles.primary} href="/parcours">
            Retour au parcours
          </Link>
        </div>
      </main>
    );
  }

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
    setAnswers(Array(quiz.questions.length).fill(-1));
    setSubmitted(false);
  }

  const total = quiz.questions.length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Quiz audio</p>
          <h1>{quiz.title}</h1>
          <p className={styles.subtitle}>5 questions pour valider l'audio.</p>
        </div>
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <form className={styles.quiz} onSubmit={handleSubmit}>
        {quiz.questions.map((question, qIndex) => (
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
