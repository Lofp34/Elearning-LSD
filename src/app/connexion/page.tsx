"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandMark from "@/components/BrandMark";
import styles from "./page.module.css";

export default function ConnexionPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error ?? "Impossible de se connecter.");
        return;
      }

      router.push("/parcours");
    } catch (err) {
      setError("Probleme reseau. Reessaie dans quelques instants.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Connexion" />
        <Link className={styles.back} href="/">
          Retour
        </Link>
      </header>

      <section className={styles.card}>
        <p className={styles.tag}>Acces securise</p>
        <h1>Se connecter</h1>
        <p className={styles.subtitle}>Entre ton email et ton mot de passe.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field} htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              placeholder="laurent@email.com"
              autoComplete="email"
              required
            />
          </label>
          <label className={styles.field} htmlFor="password">
            Mot de passe
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ton mot de passe"
              autoComplete="current-password"
              required
            />
          </label>
          <button className={styles.submit} type="submit">
            {pending ? "Connexion..." : "Continuer"}
          </button>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>

        <p className={styles.note}>
          Pas encore de compte ? <Link href="/">Creer un compte</Link>
        </p>
      </section>
    </main>
  );
}
