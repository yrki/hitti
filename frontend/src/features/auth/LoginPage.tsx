import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../../shared/api';
import { useAuth } from '../../shared/auth/AuthContext';
import styles from './LoginPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

export function LoginPage() {
  const { isAuthenticated, isLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <h1 className={styles.title}>Medlemsvarsling</h1>
        <p className={styles.subtitle}>Logg inn for å administrere din forening</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            E-postadresse
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitButton} type="submit" disabled={submitting}>
            {submitting ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>

        <p className={styles.registerLink}>
          Ingen konto? <Link to="/registrer">Registrer organisasjon</Link>
        </p>
      </div>
    </div>
  );
}
