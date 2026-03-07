import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../../shared/api';
import { useAuth } from '../../shared/auth/AuthContext';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import hittiLogo from '../../assets/hitti-logo.svg';
import styles from './LoginPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

export function LoginPage() {
  usePageTitle('Logg inn');
  const { isAuthenticated, isLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
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

    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'E-postadresse er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Ugyldig e-postadresse';
    }
    if (!password) {
      errors.password = 'Passord er påkrevd';
    } else if (password.length < 6) {
      errors.password = 'Passord må være minst 6 tegn';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setError(body?.message ?? 'Innlogging feilet');
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
        <img src={hittiLogo} alt="hitti" className={styles.logo} />
        <p className={styles.subtitle}>Logg inn for å administrere din forening</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            <span>E-postadresse <span className={styles.required}>*</span></span>
            <input
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
              required
              autoComplete="email"
              placeholder="din@epost.no"
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </label>

          <label className={styles.label}>
            <span>Passord <span className={styles.required}>*</span></span>
            <input
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
              required
              autoComplete="current-password"
              placeholder="Skriv inn passord"
            />
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>

        <p className={styles.registerLink}>
          <Link to="/glemt-passord">Glemt passord?</Link>
        </p>

        <p className={styles.registerLink}>
          Ingen konto? <Link to="/registrer">Registrer organisasjon</Link>
        </p>
      </div>
    </div>
  );
}
