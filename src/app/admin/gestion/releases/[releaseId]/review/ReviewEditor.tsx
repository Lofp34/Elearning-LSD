"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type QuizQuestion = {
  id?: string;
  question: string;
  options: string[];
  answerIndex: number;
};

type ReviewModule = {
  id: string;
  contentKey: string;
  title: string;
  partKey: string;
  chapterKey: string;
  orderIndex: number;
  scriptText: string;
  reviewStatus: "DRAFT" | "APPROVED" | "NEEDS_CHANGES";
  reviewComment: string | null;
  quizQuestions: QuizQuestion[];
};

function normalizeQuestions(questions: QuizQuestion[]) {
  if (questions.length === 5 && questions.every((q) => q.options.length === 4)) {
    return questions;
  }

  return Array.from({ length: 5 }).map((_, index) => {
    const existing = questions[index];
    return {
      question: existing?.question ?? "",
      options:
        existing?.options?.length === 4
          ? existing.options
          : Array.from({ length: 4 }).map((__, optionIndex) =>
              existing?.options?.[optionIndex] ?? ""
            ),
      answerIndex:
        typeof existing?.answerIndex === "number" && existing.answerIndex >= 0 && existing.answerIndex <= 3
          ? existing.answerIndex
          : 0,
    };
  });
}

export default function ReviewEditor({
  releaseId,
  initialModules,
}: {
  releaseId: string;
  initialModules: ReviewModule[];
}) {
  const [modules, setModules] = useState(
    initialModules.map((module) => ({
      ...module,
      quizQuestions: normalizeQuestions(module.quizQuestions),
    }))
  );
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    const total = modules.length;
    const approved = modules.filter((module) => module.reviewStatus === "APPROVED").length;
    return { total, approved };
  }, [modules]);

  function setModule(moduleId: string, updater: (module: ReviewModule) => ReviewModule) {
    setModules((current) => current.map((module) => (module.id === moduleId ? updater(module) : module)));
  }

  async function saveModule(module: ReviewModule) {
    setLoadingModuleId(module.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/releases/${releaseId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: module.id,
          scriptText: module.scriptText,
          reviewStatus: module.reviewStatus,
          reviewComment: module.reviewComment,
          questions: module.quizQuestions,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Sauvegarde impossible.");
      }

      setMessage(`Module ${module.contentKey} enregistre.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erreur sauvegarde.");
    } finally {
      setLoadingModuleId(null);
    }
  }

  return (
    <section className={styles.reviewPanel}>
      <div className={styles.summary}>
        <strong>
          Progression review: {stats.approved}/{stats.total} modules APPROVED
        </strong>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.success}>{message}</p> : null}

      <div className={styles.modulesList}>
        {modules.map((module) => (
          <article key={module.id} className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <div>
                <h3>
                  {String(module.orderIndex).padStart(2, "0")} - {module.title}
                </h3>
                <p>{module.contentKey}</p>
              </div>
              <label>
                Statut
                <select
                  value={module.reviewStatus}
                  onChange={(event) =>
                    setModule(module.id, (prev) => ({
                      ...prev,
                      reviewStatus: event.target.value as ReviewModule["reviewStatus"],
                    }))
                  }
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="NEEDS_CHANGES">NEEDS_CHANGES</option>
                </select>
              </label>
            </div>

            <label className={styles.field}>
              Script module
              <textarea
                value={module.scriptText}
                onChange={(event) =>
                  setModule(module.id, (prev) => ({
                    ...prev,
                    scriptText: event.target.value,
                  }))
                }
                rows={8}
              />
            </label>

            <label className={styles.field}>
              Commentaire review
              <input
                type="text"
                value={module.reviewComment ?? ""}
                onChange={(event) =>
                  setModule(module.id, (prev) => ({
                    ...prev,
                    reviewComment: event.target.value,
                  }))
                }
                placeholder="Optionnel"
              />
            </label>

            <div className={styles.quizBlock}>
              <h4>Quiz (5 questions)</h4>
              {module.quizQuestions.map((question, questionIndex) => (
                <div key={`${module.id}-q${questionIndex + 1}`} className={styles.quizQuestionCard}>
                  <label className={styles.field}>
                    Question {questionIndex + 1}
                    <input
                      type="text"
                      value={question.question}
                      onChange={(event) =>
                        setModule(module.id, (prev) => {
                          const nextQuestions = [...prev.quizQuestions];
                          nextQuestions[questionIndex] = {
                            ...nextQuestions[questionIndex],
                            question: event.target.value,
                          };
                          return { ...prev, quizQuestions: nextQuestions };
                        })
                      }
                    />
                  </label>

                  <div className={styles.optionsGrid}>
                    {question.options.map((option, optionIndex) => (
                      <label key={`${module.id}-${questionIndex}-${optionIndex}`} className={styles.field}>
                        Option {optionIndex + 1}
                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            setModule(module.id, (prev) => {
                              const nextQuestions = [...prev.quizQuestions];
                              const target = nextQuestions[questionIndex];
                              const nextOptions = [...target.options];
                              nextOptions[optionIndex] = event.target.value;
                              nextQuestions[questionIndex] = {
                                ...target,
                                options: nextOptions,
                              };
                              return { ...prev, quizQuestions: nextQuestions };
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <label className={styles.fieldInline}>
                    Reponse correcte
                    <select
                      value={question.answerIndex}
                      onChange={(event) =>
                        setModule(module.id, (prev) => {
                          const nextQuestions = [...prev.quizQuestions];
                          nextQuestions[questionIndex] = {
                            ...nextQuestions[questionIndex],
                            answerIndex: Number(event.target.value),
                          };
                          return { ...prev, quizQuestions: nextQuestions };
                        })
                      }
                    >
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.primary}
                type="button"
                onClick={() => saveModule(module)}
                disabled={loadingModuleId === module.id}
              >
                {loadingModuleId === module.id ? "Sauvegarde..." : "Sauvegarder module"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
