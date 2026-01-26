"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import styles from "./page.module.css";

export default function ProfilPage() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Profil" />
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>
      <section className={styles.card}>
        <p className={styles.label}>Compte</p>
        <h2>Informations personnelles</h2>
        <p>
          La gestion du profil sera connectee a ta base de donnees.
          Pour l'instant, tu peux continuer le parcours.
        </p>
        <div className={styles.actions}>
          <Link className={styles.cta} href="/parcours">
            Revenir au parcours
          </Link>
          <button className={styles.ghost} type="button" onClick={handleLogout}>
            Se deconnecter
          </button>
        </div>
      </section>
    </main>
  );
}
