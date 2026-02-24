"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function RunJobsPanel({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function runNextJob() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/jobs/run-next`, {
        method: "POST",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Execution manuelle impossible.");
      }

      if (payload.processed === 0) {
        setMessage("Aucun job en attente pour cette societe.");
      } else {
        const duration = typeof payload.durationMs === "number" ? ` (${payload.durationMs} ms)` : "";
        setMessage(`Job ${payload.jobType ?? ""} termine${duration}.`);
      }

      router.refresh();
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Execution impossible.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.actionsWrap}>
      <button
        type="button"
        className={styles.primaryButton}
        onClick={runNextJob}
        disabled={loading}
      >
        {loading ? "Execution..." : "Executer prochain job"}
      </button>
      {error ? <small className={styles.error}>{error}</small> : null}
      {message ? <small className={styles.success}>{message}</small> : null}
    </div>
  );
}
