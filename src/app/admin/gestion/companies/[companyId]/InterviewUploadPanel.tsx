"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type InterviewItem = {
  id: string;
  filename: string;
  status: "UPLOADED" | "EXTRACTED" | "FAILED";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  extractedTextLength: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InterviewUploadPanel({
  companyId,
  initialInterviews,
}: {
  companyId: string;
  initialInterviews: InterviewItem[];
}) {
  const [interviews, setInterviews] = useState<InterviewItem[]>(initialInterviews);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const hasPendingExtraction = useMemo(
    () => interviews.some((item) => item.status === "UPLOADED"),
    [interviews]
  );

  const loadInterviews = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/interviews`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Impossible de charger les interviews.");
      }
      const payload = await response.json();
      setInterviews(payload.interviews ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erreur de chargement.");
    } finally {
      if (showRefreshState) setRefreshing(false);
    }
  }, [companyId]);

  async function extractDocument(documentId: string) {
    const response = await fetch(`/api/admin/companies/${companyId}/interviews/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? "Echec extraction PDF.");
    }
  }

  async function handleUpload() {
    if (files.length === 0) {
      setError("Selectionnez au moins un PDF.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch(`/api/admin/companies/${companyId}/interviews/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const payload = await uploadResponse.json().catch(() => ({}));
          throw new Error(payload.error ?? `Upload impossible pour ${file.name}.`);
        }

        const uploadPayload = await uploadResponse.json();
        const documentId = uploadPayload?.interviewDocument?.id as string | undefined;
        if (documentId) {
          await extractDocument(documentId);
        }

        await loadInterviews();
      }

      setFiles([]);
      setMessage("Upload + extraction termines.");
      await loadInterviews();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Erreur pendant l'upload.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(documentId: string) {
    setError("");
    setMessage("");
    try {
      await extractDocument(documentId);
      await loadInterviews();
      setMessage("Extraction relancee.");
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Relance impossible.");
    }
  }

  async function handleExtractAllPending() {
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/interviews/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Relance globale impossible.");
      }
      await loadInterviews();
      setMessage("Extraction globale lancee.");
    } catch (extractError) {
      setError(extractError instanceof Error ? extractError.message : "Relance globale impossible.");
    }
  }

  useEffect(() => {
    if (!hasPendingExtraction) return;

    const timer = setInterval(() => {
      loadInterviews();
    }, 3_000);

    return () => clearInterval(timer);
  }, [hasPendingExtraction, loadInterviews]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>1. Upload interviews PDF</h2>
        <button
          className={styles.ghostButton}
          type="button"
          onClick={() => loadInterviews(true)}
          disabled={refreshing || loading}
        >
          {refreshing ? "Rafraichissement..." : "Rafraichir"}
        </button>
      </div>

      <p className={styles.helpText}>
        Un PDF par collaborateur. L&apos;extraction texte se lance automatiquement apres chaque upload.
      </p>

      <div className={styles.uploadRow}>
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          disabled={loading}
        />
        <button className={styles.primaryButton} type="button" onClick={handleUpload} disabled={loading}>
          {loading ? "Traitement en cours..." : "Uploader et extraire"}
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={handleExtractAllPending}
          disabled={loading}
        >
          Relancer extraction
        </button>
      </div>

      {files.length > 0 ? (
        <p className={styles.helpText}>Fichiers selectionnes: {files.map((file) => file.name).join(", ")}</p>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.success}>{message}</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fichier</th>
              <th>Statut</th>
              <th>Texte extrait</th>
              <th>Mise a jour</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={5}>Aucun entretien charge.</td>
              </tr>
            ) : (
              interviews.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.filename}</strong>
                    {item.errorMessage ? <div className={styles.errorSmall}>{item.errorMessage}</div> : null}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        item.status === "EXTRACTED"
                          ? styles.statusOk
                          : item.status === "FAILED"
                            ? styles.statusError
                            : styles.statusPending
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.extractedTextLength > 0 ? `${item.extractedTextLength} caracteres` : "-"}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                  <td>
                    {(item.status === "FAILED" || item.status === "UPLOADED") && (
                      <button
                        className={styles.smallButton}
                        type="button"
                        onClick={() => handleRetry(item.id)}
                        disabled={loading}
                      >
                        Relancer
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
