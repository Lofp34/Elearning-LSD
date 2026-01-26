import styles from "./BrandMark.module.css";

type BrandMarkProps = {
  subtitle?: string;
  className?: string;
};

export default function BrandMark({ subtitle, className }: BrandMarkProps) {
  return (
    <div className={className ? `${styles.brand} ${className}` : styles.brand}>
      <div className={styles.logo}>LS</div>
      <div>
        <p className={styles.wordmark}>Laurent SERRE, developpement</p>
        {subtitle ? <p className={styles.wordsub}>{subtitle}</p> : null}
      </div>
    </div>
  );
}
