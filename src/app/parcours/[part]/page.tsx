import { list } from "@vercel/blob";
import Link from "next/link";
import { notFound } from "next/navigation";
import AudioCard from "./AudioCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const PARTS: Record<
  string,
  { title: string; subtitle: string; prefix: string; accent: string }
> = {
  mental: {
    title: "Mental",
    subtitle: "Posture, confiance, resilience",
    prefix: "audio/elearning1-",
    accent: "#ff6b4a",
  },
  pyramide: {
    title: "Pyramide de la vente",
    subtitle: "De la prise de contact au closing",
    prefix: "audio/elearning2-",
    accent: "#2f5f59",
  },
  techniques: {
    title: "Techniques",
    subtitle: "Ecoute, questionnement, rythme",
    prefix: "audio/elearning3-",
    accent: "#f1a95f",
  },
};

function formatTitle(filename: string) {
  const base = filename.replace(/\.mp3$/i, "").replace(/^elearning\d+-\d+-/, "");
  return base
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIndex(filename: string) {
  const match = filename.match(/elearning\d+-(\d+)-/i);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export default async function PartPage({ params }: { params: { part: string } }) {
  const config = PARTS[params.part];
  if (!config) {
    notFound();
  }

  const { blobs } = await list({ prefix: config.prefix, limit: 200 });
  const items = blobs
    .map((blob) => {
    const filename = blob.pathname.split("/").pop() ?? "";
    return {
      url: blob.url,
      title: formatTitle(filename),
      index: getIndex(filename),
      slug: filename.replace(/\.mp3$/i, ""),
    };
  })
    .sort((a, b) => a.index - b.index);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Parcours</p>
          <h1>{config.title}</h1>
          <p className={styles.subtitle}>{config.subtitle}</p>
        </div>
        <Link className={styles.back} href="/parcours">
          Retour
        </Link>
      </header>

      <section className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Aucun audio dans cette partie.</p>
            <Link href="/audio">Voir les fichiers Blob</Link>
          </div>
        ) : (
          items.map((item) => (
            <AudioCard key={item.url} item={item} accent={config.accent} />
          ))
        )}
      </section>
    </main>
  );
}
