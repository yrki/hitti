import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './ResetPasswordPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Ugyldig lenke</h1>
          <p className={styles.description}>
            Denne lenken er ugyldig. Be om en ny tilbakestilling fra innloggingssiden.
          </p>
          <Link to="/glemt-passord" className={styles.link}>Be om ny lenke</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Passordet må være minst 8 tegn.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passordene stemmer ikke overens.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const body = await response.json().catch(() => null) as { message?: string } | null;

      if (!response.ok) {
        setError(body?.message ?? 'Noe gikk galt. Prøv igjen senere.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Kunne ikke koble til serveren');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Passord tilbakestilt</h1>
          <p className={styles.description}>
            Passordet ditt er endret. Du kan nå logge inn med det nye passordet.
          </p>
          <Link to="/login" className={styles.link}>Gå til innlogging</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nytt passord</h1>
        <p className={styles.description}>Skriv inn ditt nye passord.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Nytt passord
            <input
              className={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              autoFocus
            />
          </label>

          <label className={styles.label}>
            Bekreft passord
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Tilbakestiller...' : 'Tilbakestill passord'}
          </button>
        </form>

        <p className={styles.backLinkWrapper}>
          <Link to="/login" className={styles.link}>Tilbake til innlogging</Link>
        </p>
      </div>
    </div>
  );
}
