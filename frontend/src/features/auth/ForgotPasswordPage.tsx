import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HittiLogo } from '../../shared/components/HittiLogo';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import styles from './ForgotPasswordPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

export function ForgotPasswordPage() {
  usePageTitle('Glemt passord');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const errors: { email?: string } = {};
    if (!email.trim()) {
      errors.email = 'E-postadresse er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Ugyldig e-postadresse';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setError(body?.message ?? 'Noe gikk galt. Prøv igjen senere.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Kunne ikke koble til serveren');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <HittiLogo />
          <h1 className={styles.title}>Sjekk e-posten din</h1>
          <p className={styles.description}>
            Hvis e-postadressen finnes i systemet, har vi sendt en lenke du kan bruke for å tilbakestille passordet ditt.
          </p>
          <p className={styles.description}>Lenken er gyldig i 1 time.</p>
          <Link to="/login" className={styles.backLink}>Tilbake til innlogging</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <HittiLogo />
        <h1 className={styles.title}>Glemt passord</h1>
        <p className={styles.description}>
          Skriv inn e-postadressen din, så sender vi en lenke for å tilbakestille passordet.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            <span>E-postadresse <span className={styles.required}>*</span></span>
            <input
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); }}
              required
              autoComplete="email"
              autoFocus
              placeholder="din@epost.no"
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Sender...' : 'Send tilbakestillingslenke'}
          </button>
        </form>

        <p className={styles.backLinkWrapper}>
          <Link to="/login" className={styles.backLink}>Tilbake til innlogging</Link>
        </p>
      </div>
    </div>
  );
}
