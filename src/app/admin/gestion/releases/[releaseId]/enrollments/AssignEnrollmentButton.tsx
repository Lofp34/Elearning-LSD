"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function AssignEnrollmentButton({
  userId,
  releaseId,
  isActive,
}: {
  userId: string;
  releaseId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function assign() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          releaseId,
          replaceActive: true,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Assignation impossible.");
      }

      router.refresh();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Assignation impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.assignWrap}>
      <button className={styles.smallButton} type="button" onClick={assign} disabled={loading || isActive}>
        {isActive ? "Actif" : loading ? "Assignation..." : "Assigner"}
      </button>
      {error ? <small className={styles.error}>{error}</small> : null}
    </div>
  );
}
