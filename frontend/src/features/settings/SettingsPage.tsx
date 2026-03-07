import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from './services/settingsApi';
import type { OrganizationSettings, UpdateSettingsRequest } from './types';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        setOrganizationName(data.organizationName);
        setEmail(data.email);
        setPhone(data.phone);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const request: UpdateSettingsRequest = { organizationName, email, phone };

    try {
      const updated = await updateSettings(request);
      setSettings(updated);
      setNotFound(false);
      setMessage('Innstillinger lagret');
    } catch {
      setMessage('Kunne ikke lagre innstillinger');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Laster innstillinger...</p>;
  }

  return (
    <div>
      <h1 className={styles.title}>Innstillinger</h1>

      {notFound && !settings && (
        <p className={styles.info}>Ingen innstillinger funnet. Fyll inn og lagre for å opprette.</p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Navn på forening/organisasjon
          <input
            className={styles.input}
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
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
