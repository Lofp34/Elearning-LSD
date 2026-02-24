"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function NewCompanyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Le nom doit contenir au moins 2 caracteres.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Creation impossible pour le moment.");
        return;
      }
      const payload = await response.json().catch(() => ({}));
      const companyId = payload?.company?.id as string | undefined;
      router.push(companyId ? `/admin/gestion/companies/${companyId}` : "/admin/gestion");
      router.refresh();
    } catch {
      setError("Erreur reseau. Merci de reessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Nom de la societe</span>
        <input
          type="text"
          placeholder="Ex: Audition Conseil 66"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          disabled={submitting}
          required
        />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button className={styles.primary} type="submit" disabled={submitting}>
        {submitting ? "Creation en cours..." : "Creer la societe"}
      </button>
    </form>
  );
}
