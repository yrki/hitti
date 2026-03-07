import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../../shared/api';
import { useAuth } from '../../shared/auth/AuthContext';
import styles from './RegisterPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

export function RegisterPage() {
  const { isAuthenticated, isLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const [organizationName, setOrganizationName] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [organizationPhone, setOrganizationPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return <p>Laster...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passordene stemmer ikke overens');
      return;
    }

    if (password.length < 8) {
      setError('Passordet må være minst 8 tegn');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName,
          organizationEmail,
          organizationPhone,
          adminName,
          adminEmail,
          adminPhone,
          password,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setError(body?.message ?? 'Registrering feilet');
        return;
      }

      const data = await response.json() as { token: string; user: { id: string; name: string; email: string; phone: string; role: string; organization: { id: string; name: string; email: string; phone: string } } };
      setAuthToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch {
      setError('Kunne ikke koble til serveren');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Registrer organisasjon</h1>
        <p className={styles.subtitle}>Opprett en konto for din forening</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Organisasjon</legend>

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
              E-postadresse (organisasjon)
              <input
                className={styles.input}
                type="email"
                value={organizationEmail}
                onChange={(e) => setOrganizationEmail(e.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              Telefonnummer (organisasjon)
              <input
                className={styles.input}
                type="tel"
                value={organizationPhone}
                onChange={(e) => setOrganizationPhone(e.target.value)}
                required
              />
            </label>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Administrator</legend>

            <label className={styles.label}>
              Navn
              <input
                className={styles.input}
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              E-postadresse
              <input
                className={styles.input}
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className={styles.label}>
              Telefonnummer
              <input
                className={styles.input}
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              Passord
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
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
                autoComplete="new-password"
                minLength={8}
              />
            </label>
          </fieldset>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Registrerer...' : 'Registrer'}
          </button>
        </form>

        <p className={styles.loginLink}>
          Har du allerede en konto? <Link to="/login">Logg inn</Link>
        </p>
      </div>
    </div>
  );
}
