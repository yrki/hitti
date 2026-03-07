import styles from './SettingsPage.module.css';

export function SettingsPage() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Generelt</h2>
        <div className={styles.field}>
          <label className={styles.label}>Organisasjonsnavn</label>
          <input className={styles.input} type="text" defaultValue="Min Forening" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Kontakt e-post</label>
          <input className={styles.input} type="email" defaultValue="post@minforening.no" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Varsler</h2>
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" defaultChecked />
            Send velkomstmelding til nye medlemmer
          </label>
        </div>
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" defaultChecked />
            Påminnelse ved kontingentforfall
          </label>
        </div>
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" />
            Ukentlig oppsummering til styret
          </label>
        </div>
      </section>
    </div>
  );
}
