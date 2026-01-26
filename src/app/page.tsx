"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandMark from "@/components/BrandMark";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error ?? "Impossible de creer le compte.");
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
        <BrandMark subtitle="E-learning mobile" />
        <div className={styles.badge}>Beta privee</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Bienvenue</p>
          <h1>
            Un parcours clair, etape par etape, pour ancrer les reflexes
            commerciaux.
          </h1>
          <p className={styles.lead}>
            Ici, tu avances en trois gestes simples : ecouter un audio court,
            repondre a un quiz rapide, puis voir ta progression. Tout est pense
            pour tenir en 10 minutes par jour, a ton rythme.
          </p>

          <p className={styles.stepsTitle}>Comment ca se passe</p>
          <div className={styles.highlights}>
            <div>
              <span>1. Ecouter l'audio</span>
              <p>Un format court (7-10 min) pour rester concentre.</p>
            </div>
            <div>
              <span>2. Repondre au quiz</span>
              <p>5 questions pour fixer l'essentiel, note immediate.</p>
            </div>
            <div>
              <span>3. Suivre ta progression</span>
              <p>Prochaine etape suggeree, avancee visible.</p>
            </div>
          </div>
          <p className={styles.pillars}>
            3 piliers : Mental, Pyramide de la vente, Techniques. Tu avances
            dans l'ordre, sans pression.
          </p>

          <div className={styles.actions}>
            <a className={styles.primary} href="#inscription">
              Commencer maintenant
            </a>
          </div>
        </div>

        <div className={styles.formCard} id="inscription">
          <p className={styles.formTag}>Demarrage rapide</p>
          <h2>Creer un compte</h2>
          <p className={styles.formIntro}>
            Quelques informations pour sauvegarder ta progression. Pas de carte
            bancaire.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <label className={styles.field} htmlFor="firstName">
                Prenom
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Laurent"
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className={styles.field} htmlFor="lastName">
                Nom
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Serre"
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>
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
                placeholder="8 caracteres minimum"
                autoComplete="new-password"
                required
              />
            </label>
            <button className={styles.submit} type="submit">
              {pending ? "Creation en cours..." : "Commencer mon parcours"}
            </button>
            {error ? <p className={styles.error}>{error}</p> : null}
          </form>
          <p className={styles.formNote}>
            Deja un compte ? <Link href="/connexion">Se connecter</Link>
          </p>
        </div>
      </section>

      <section className={styles.stats}>
        <div>
          <p className={styles.statValue}>70%</p>
          <p className={styles.statLabel}>seuil de validation</p>
        </div>
        <div>
          <p className={styles.statValue}>90%</p>
          <p className={styles.statLabel}>ecoute minimale</p>
        </div>
        <div>
          <p className={styles.statValue}>3</p>
          <p className={styles.statLabel}>piliers de maitrise</p>
        </div>
      </section>
    </main>
  );
}
