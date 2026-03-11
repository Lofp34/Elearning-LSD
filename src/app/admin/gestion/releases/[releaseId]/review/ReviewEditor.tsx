"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type QuizQuestion = {
  id?: string;
  question: string;
  options: string[];
  answerIndex: number;
};

type ModuleType = "CORE" | "BONUS";

type ReleaseModule = {
  id: string;
  contentKey: string;
  title: string;
  partKey: string;
  chapterKey: string;
  orderIndex: number;
  moduleType: ModuleType;
  scriptText: string;
  audioAsset: {
    id: string;
    blobPath: string;
  } | null;
  quizQuestions: QuizQuestion[];
};

function normalizeQuestions(questions: QuizQuestion[]) {
  if (questions.length === 5 && questions.every((question) => question.options.length === 4)) {
    return questions;
  }

  return Array.from({ length: 5 }).map((_, index) => {
    const existing = questions[index];
    return {
      question: existing?.question ?? "",
      options:
        existing?.options?.length === 4
          ? existing.options
          : Array.from({ length: 4 }).map((__, optionIndex) => existing?.options?.[optionIndex] ?? ""),
      answerIndex:
        typeof existing?.answerIndex === "number" && existing.answerIndex >= 0 && existing.answerIndex <= 3
          ? existing.answerIndex
          : 0,
    };
  });
}

export default function ReviewEditor({
  releaseId,
  companyId,
  initialStatus,
  initialModules,
}: {
  releaseId: string;
  companyId: string;
  initialStatus: string;
  initialModules: ReleaseModule[];
}) {
  const router = useRouter();
  const [releaseStatus, setReleaseStatus] = useState(initialStatus);
  const [modules, setModules] = useState(
    initialModules.map((module) => ({
      ...module,
      quizQuestions: normalizeQuestions(module.quizQuestions),
    }))
  );
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
  const [uploadingModuleId, setUploadingModuleId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    const coreModules = modules.filter((module) => module.moduleType === "CORE");
    return {
      total: coreModules.length,
      scriptsReady: coreModules.filter((module) => module.scriptText.trim().length >= 120).length,
      quizReady: coreModules.filter((module) => module.quizQuestions.length === 5).length,
      audioReady: coreModules.filter((module) => Boolean(module.audioAsset)).length,
    };
  }, [modules]);

  function setModule(moduleId: string, updater: (module: ReleaseModule) => ReleaseModule) {
    setModules((current) => current.map((module) => (module.id === moduleId ? updater(module) : module)));
  }

  async function saveModule(module: ReleaseModule) {
    setLoadingModuleId(module.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/releases/${releaseId}/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleType: module.moduleType,
          scriptText: module.scriptText,
          questions: module.quizQuestions,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Sauvegarde impossible.");
      }

      setMessage(`Module ${module.contentKey} enregistre.`);
      if (payload.module) {
        setModule(module.id, () => ({
          ...module,
          moduleType: payload.module.moduleType,
          audioAsset: payload.module.audioAsset
            ? {
                id: payload.module.audioAsset.id,
                blobPath: payload.module.audioAsset.blobPath,
              }
            : null,
          quizQuestions: normalizeQuestions(
            (payload.module.quizQuestions ?? []).map((question: QuizQuestion) => ({
              question: question.question,
              options: question.options,
              answerIndex: question.answerIndex,
            }))
          ),
        }));
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erreur sauvegarde.");
    } finally {
      setLoadingModuleId(null);
    }
  }

  async function uploadAudio(module: ReleaseModule, file: File) {
    setUploadingModuleId(module.id);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch(`/api/admin/releases/${releaseId}/modules/${module.id}/audio`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Upload audio impossible.");
      }

      setModule(module.id, (prev) => ({
        ...prev,
        audioAsset: payload.audioAsset
          ? {
              id: payload.audioAsset.id,
              blobPath: payload.audioAsset.blobPath,
            }
          : prev.audioAsset,
      }));
      setMessage(`Audio importe pour ${module.contentKey}.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Erreur upload audio.");
    } finally {
      setUploadingModuleId(null);
    }
  }

  async function publishRelease() {
    setPublishing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/releases/${releaseId}/publish`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = payload.details ? ` ${JSON.stringify(payload.details)}` : "";
        throw new Error((payload.error ?? "Publication impossible.") + details);
      }

      setReleaseStatus(payload.release?.status ?? "PUBLISHED");
      setMessage("Release publiee.");
      router.refresh();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Erreur publication.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section className={styles.reviewPanel}>
      <div className={styles.summary}>
        <strong>
          Socle CORE: {stats.scriptsReady}/{stats.total} scripts, {stats.quizReady}/{stats.total} quiz,
          {` `}{stats.audioReady}/{stats.total} audios
        </strong>
        <p>Statut release: {releaseStatus}</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} type="button" onClick={publishRelease} disabled={publishing}>
          {publishing ? "Publication..." : "Publier la release"}
        </button>
        <button className={styles.primary} type="button" onClick={() => router.push(`/admin/gestion/releases/${releaseId}/enrollments`)}>
          Gérer les assignations
        </button>
        <button className={styles.primary} type="button" onClick={() => router.push(`/admin/gestion/companies/${companyId}`)}>
          Retour société
        </button>
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
              <label className={styles.fieldInline}>
                Type
                <select
                  value={module.moduleType}
                  onChange={(event) =>
                    setModule(module.id, (prev) => ({
                      ...prev,
                      moduleType: event.target.value as ModuleType,
                    }))
                  }
                >
                  <option value="CORE">CORE</option>
                  <option value="BONUS">BONUS</option>
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

            <div className={styles.field}>
              <span>Audio MP3</span>
              <div className={styles.actions}>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadAudio(module, file);
                      event.target.value = "";
                    }
                  }}
                  disabled={uploadingModuleId === module.id}
                />
                {module.audioAsset ? (
                  <a className={styles.primary} href={module.audioAsset.blobPath} target="_blank" rel="noreferrer">
                    Ecouter
                  </a>
                ) : (
                  <span>Aucun audio importe</span>
                )}
              </div>
            </div>

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
