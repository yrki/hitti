import { useState } from 'react';
import { useAuth } from '../../shared/auth/AuthContext';
import { useTheme, type Theme } from '../../shared/theme/ThemeContext';
import { apiFetch } from '../../shared/api';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import styles from './SettingsPage.module.css';

interface UpdateOrganizationRequest {
  name: string;
  email: string;
  phone: string;
}

interface OrganizationResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export function SettingsPage() {
  usePageTitle('Innstillinger');
  const { user, updateOrganization } = useAuth();
  const { theme, setTheme } = useTheme();
  const organization = user?.organization;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [name, setName] = useState(organization?.name ?? '');
  const [email, setEmail] = useState(organization?.email ?? '');
  const [phone, setPhone] = useState(organization?.phone ?? '');

  if (!organization) {
    return <p>Ingen organisasjon valgt.</p>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const request: UpdateOrganizationRequest = { name, email, phone };

    try {
      const updated = await apiFetch<OrganizationResponse>('/organizations', {
        method: 'PUT',
        body: JSON.stringify(request),
      });
      updateOrganization(updated);
      setMessage('Innstillinger lagret');
    } catch {
      setMessage('Kunne ikke lagre innstillinger');
    } finally {
      setSaving(false);
    }
  }

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Lyst' },
    { value: 'dark', label: 'Mørkt' },
  ];

  return (
    <div>
      <h1 className={styles.title}>Innstillinger</h1>

      <section className={styles.section} aria-labelledby="theme-heading">
        <h2 id="theme-heading" className={styles.sectionTitle}>Utseende</h2>
        <p className={styles.sectionDescription}>Velg om grensesnittet skal være lyst eller mørkt.</p>
        <div className={styles.themeRow} role="radiogroup" aria-label="Tema">
          {themes.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={theme === option.value}
              className={`${styles.themeOption} ${theme === option.value ? styles.themeOptionActive : ''}`}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Navn på forening/organisasjon
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          E-postadresse
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          Telefonnummer
          <input
            className={styles.input}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton} disabled={saving}>
            {saving ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}
