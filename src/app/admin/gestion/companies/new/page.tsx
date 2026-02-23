import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { getAuthUserScope, isAdminRole, isSuperAdmin } from "@/lib/authz";
import NewCompanyForm from "./NewCompanyForm";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  const authUser = await getAuthUserScope();
  if (!authUser) redirect("/connexion");
  if (!isAdminRole(authUser.role)) redirect("/parcours");
  if (!isSuperAdmin(authUser.role)) redirect("/admin/gestion");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandMark subtitle="Admin - Gestion" />
        <Link className={styles.back} href="/admin/gestion">
          Retour
        </Link>
      </header>

      <section className={styles.card}>
        <h1>Nouvelle societe</h1>
        <p>
          Creez l&apos;entreprise avant l&apos;upload des interviews PDF et la generation des modules.
        </p>
        <NewCompanyForm />
      </section>
    </main>
  );
}
