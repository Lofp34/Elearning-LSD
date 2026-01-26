import Link from "next/link";
import styles from "./page.module.css";

export default function ProgressionPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Progression</h1>
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>
      <section className={styles.card}>
        <p className={styles.label}>Suivi en cours</p>
        <h2>Ta progression arrive bientot</h2>
        <p>
          Les stats seront calculees a partir des ecoutes et des quiz.
          Nous finalisons le suivi automatique.
        </p>
        <Link className={styles.cta} href="/parcours">
          Revenir au parcours
        </Link>
      </section>
    </main>
  );
}
