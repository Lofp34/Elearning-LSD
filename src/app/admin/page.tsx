import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { getAuthUserScope, isAdminRole } from "@/lib/authz";
import { isNewContentEngineEnabled } from "@/lib/feature-flags";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
};

export default async function AdminHomePage() {
  const user = await getAuthUserScope();
  if (!user) {
    redirect("/connexion");
  }
  if (!isAdminRole(user.role)) {
    redirect("/parcours");
  }

  const scopeLabel =
    user.role === "SUPER_ADMIN"
      ? "Toutes entreprises"
      : user.company ?? "Entreprise non renseignee";
  const newContentEngineEnabled = isNewContentEngineEnabled();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Administration" />
        <Link className={styles.back} href="/parcours">
          Retour parcours
        </Link>
      </header>

      <section className={styles.intro}>
        <span className={styles.pill}>{ROLE_LABELS[user.role] ?? "Admin"}</span>
        <h1>Console admin</h1>
        <p>
          Scope: <strong>{scopeLabel}</strong>
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Suivi apprenants</h2>
            <span className={styles.tag}>Disponible</span>
          </div>
          <p>Tableaux d&apos;activite, progression, ecoutes et quiz sur les 7 derniers jours.</p>
          <Link className={styles.primary} href="/admin/suivi">
            Ouvrir le suivi
          </Link>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Gestion</h2>
            <span className={styles.tag}>{newContentEngineEnabled ? "V2 active" : "V2 prete"}</span>
          </div>
          <p>
            Gerer les societes, les versions de parcours et lancer la generation IA
            (interviews PDF, scripts, quiz, audio).
          </p>
          <Link className={styles.primary} href="/admin/gestion">
            Ouvrir la gestion
          </Link>
        </article>
      </section>

      {!newContentEngineEnabled ? (
        <section className={styles.notice}>
          <p>
            Le moteur V2 est desactive. Active `NEW_CONTENT_ENGINE=true` pour le cutover.
          </p>
        </section>
      ) : null}
    </main>
  );
}
