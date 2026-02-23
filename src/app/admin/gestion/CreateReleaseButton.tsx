"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function CreateReleaseButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/releases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startPipeline: false }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Creation impossible.");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur reseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.releaseActions}>
      <button className={styles.secondary} type="button" onClick={handleClick} disabled={loading}>
        {loading ? "Creation..." : "Creer release draft"}
      </button>
      {error ? <small className={styles.error}>{error}</small> : null}
    </div>
  );
}
