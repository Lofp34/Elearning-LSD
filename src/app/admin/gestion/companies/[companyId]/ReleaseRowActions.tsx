"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

type Props = {
  releaseId: string;
};

export default function ReleaseRowActions({ releaseId }: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");

  async function callAction(action: "pipeline" | "audio" | "publish") {
    setLoadingAction(action);
    setError("");

    try {
      let response: Response;
      if (action === "pipeline") {
        response = await fetch(`/api/admin/releases/${releaseId}/pipeline/start`, {
          method: "POST",
        });
      } else if (action === "audio") {
        response = await fetch(`/api/admin/releases/${releaseId}/audio/generate`, {
          method: "POST",
        });
      } else {
        response = await fetch(`/api/admin/releases/${releaseId}/publish`, {
          method: "POST",
        });
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? `Action ${action} impossible.`);
      }

      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Erreur action.");
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <div className={styles.rowActionsWrap}>
      <div className={styles.rowActionsButtons}>
        <button
          type="button"
          className={styles.smallButton}
          disabled={loadingAction.length > 0}
          onClick={() => callAction("pipeline")}
        >
          {loadingAction === "pipeline" ? "..." : "Pipeline"}
        </button>
        <button
          type="button"
          className={styles.smallButton}
          disabled={loadingAction.length > 0}
          onClick={() => callAction("audio")}
        >
          {loadingAction === "audio" ? "..." : "Audio"}
        </button>
        <button
          type="button"
          className={styles.smallButton}
          disabled={loadingAction.length > 0}
          onClick={() => callAction("publish")}
        >
          {loadingAction === "publish" ? "..." : "Publier"}
        </button>
      </div>
      <div className={styles.rowActionsLinks}>
        <Link className={styles.inlineTextLink} href={`/admin/gestion/releases/${releaseId}/review`}>
          Review
        </Link>
        <Link className={styles.inlineTextLink} href={`/admin/gestion/releases/${releaseId}/enrollments`}>
          Assignations
        </Link>
      </div>
      {error ? <small className={styles.errorSmall}>{error}</small> : null}
    </div>
  );
}
