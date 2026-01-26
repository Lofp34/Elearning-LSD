import Link from "next/link";
import styles from "./page.module.css";

const tracks = [
  {
    title: "Mental",
    count: "5 audios",
    next: "Posture & service",
    progress: 20,
    tone: "#ff6b4a",
  },
  {
    title: "Pyramide de la vente",
    count: "6 audios",
    next: "Prise de contact",
    progress: 0,
    tone: "#2f5f59",
  },
  {
    title: "Techniques",
    count: "5 audios",
    next: "Ecoute active",
    progress: 0,
    tone: "#f1a95f",
  },
];

export default function ParcoursPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>AG</div>
          <div>
            <p className={styles.wordmark}>Parcours</p>
            <p className={styles.wordsub}>Ton entrainement du jour</p>
          </div>
        </div>
        <div className={styles.avatar}>LS</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.progressCard}>
          <p className={styles.cardLabel}>Progression globale</p>
          <div className={styles.progressRow}>
            <div className={styles.progressRing}>
              <span>12%</span>
            </div>
            <div>
              <h2>Continue ton rythme</h2>
              <p>
                2 audios termines cette semaine. Un pas par jour pour fixer les
                reflexes.
              </p>
            </div>
          </div>
          <div className={styles.milestones}>
            <div>
              <strong>7</strong>
              <span>ecoutes</span>
            </div>
            <div>
              <strong>3</strong>
              <span>quiz valides</span>
            </div>
            <div>
              <strong>1</strong>
              <span>partie debloquee</span>
            </div>
          </div>
        </div>

        <div className={styles.nextCard}>
          <p className={styles.cardLabel}>A faire maintenant</p>
          <h3>Mental - Posture & service</h3>
          <p>7 min | Quiz 5 questions</p>
          <div className={styles.nextActions}>
            <button className={styles.primary}>Ecouter l'audio</button>
            <Link className={styles.ghost} href="/audio">
              Voir les fichiers
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.tracks}>
        <h2>Mes parties</h2>
        <div className={styles.trackGrid}>
          {tracks.map((track) => (
            <article key={track.title} className={styles.trackCard}>
              <div className={styles.trackHeader}>
                <div className={styles.trackTitle}>
                  <h3>{track.title}</h3>
                  <p>{track.count}</p>
                </div>
                <span className={styles.trackDot} style={{ background: track.tone }} />
              </div>
              <p className={styles.trackNext}>Prochain audio : {track.next}</p>
              <div className={styles.progressBar}>
                <span style={{ width: `${track.progress}%` }} />
              </div>
              <p className={styles.trackProgress}>{track.progress}% termine</p>
              <button className={styles.secondary}>Ouvrir la partie</button>
            </article>
          ))}
        </div>
      </section>

      <nav className={styles.nav}>
        <Link className={`${styles.navItem} ${styles.active}`} href="/parcours">
          Parcours
        </Link>
        <Link className={styles.navItem} href="/progression">
          Progression
        </Link>
        <Link className={styles.navItem} href="/profil">
          Profil
        </Link>
      </nav>
    </main>
  );
}
