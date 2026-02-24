"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function JobRetryButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRetry() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/retry`, {
        method: "POST",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Relance impossible.");
      }
      router.refresh();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Relance impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className={styles.smallButton} type="button" disabled={loading} onClick={handleRetry}>
        {loading ? "Relance..." : "Retry"}
      </button>
      {error ? <small className={styles.error}>{error}</small> : null}
    </div>
  );
}
