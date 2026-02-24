"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

type Props = {
  companyId: string;
  releaseId?: string;
};

export default function ReleaseActionButtons({ companyId, releaseId }: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function callAction(action: "create" | "pipeline" | "audio" | "publish") {
    setLoadingAction(action);
    setError("");
    setMessage("");

    try {
      let response: Response;
      switch (action) {
        case "create":
          response = await fetch(`/api/admin/companies/${companyId}/releases`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startPipeline: false }),
          });
          break;
        case "pipeline":
          response = await fetch(`/api/admin/releases/${releaseId}/pipeline/start`, {
            method: "POST",
          });
          break;
        case "audio":
          response = await fetch(`/api/admin/releases/${releaseId}/audio/generate`, {
            method: "POST",
          });
          break;
        case "publish":
          response = await fetch(`/api/admin/releases/${releaseId}/publish`, {
            method: "POST",
          });
          break;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? `Action ${action} impossible.`);
      }

      if (action === "pipeline") {
        setMessage("Job pipeline cree. Lance ensuite 'Executer prochain job'.");
      } else if (action === "audio") {
        setMessage("Job audio cree. Lance ensuite 'Executer prochain job'.");
      } else if (action === "create") {
        setMessage("Release draft creee.");
      } else if (action === "publish") {
        setMessage("Release publiee.");
      }

      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Erreur action.");
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <div className={styles.actionsWrap}>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={loadingAction.length > 0}
        onClick={() => callAction("create")}
      >
        {loadingAction === "create" ? "Creation..." : "Creer release draft"}
      </button>

      {releaseId ? (
        <>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={loadingAction.length > 0}
            onClick={() => callAction("pipeline")}
          >
            {loadingAction === "pipeline" ? "Lancement..." : "Lancer pipeline IA"}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled={loadingAction.length > 0}
            onClick={() => callAction("audio")}
          >
            {loadingAction === "audio" ? "Generation..." : "Generer audio"}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled={loadingAction.length > 0}
            onClick={() => callAction("publish")}
          >
            {loadingAction === "publish" ? "Publication..." : "Publier"}
          </button>

          <Link className={styles.inlineLinkButton} href={`/admin/gestion/releases/${releaseId}/review`}>
            Revue modules
          </Link>
          <Link
            className={styles.inlineLinkButton}
            href={`/admin/gestion/releases/${releaseId}/enrollments`}
          >
            Assignations
          </Link>
        </>
      ) : null}

      {error ? <small className={styles.error}>{error}</small> : null}
      {message ? <small className={styles.success}>{message}</small> : null}
    </div>
  );
}
