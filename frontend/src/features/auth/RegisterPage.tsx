import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../../shared/api';
import { useAuth } from '../../shared/auth/AuthContext';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { isValidEmail, isValidNorwegianPhone } from '../../shared/validation';
import hittiLogo from '../../assets/hitti-logo.svg';
import styles from './RegisterPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

interface FieldErrors {
  organizationName?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  usePageTitle('Registrer');
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return <p>Laster...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const errors: FieldErrors = {};

    if (!organizationName.trim()) errors.organizationName = 'Navn er påkrevd';
    if (!organizationEmail.trim()) {
      errors.organizationEmail = 'E-postadresse er påkrevd';
    } else if (!isValidEmail(organizationEmail)) {
      errors.organizationEmail = 'Ugyldig e-postadresse';
    }
    if (!organizationPhone.trim()) {
      errors.organizationPhone = 'Telefonnummer er påkrevd';
    } else if (!isValidNorwegianPhone(organizationPhone)) {
      errors.organizationPhone = 'Ugyldig telefonnummer (8 siffer, evt. med +47)';
    }

    if (!adminName.trim()) errors.adminName = 'Navn er påkrevd';
    if (!adminEmail.trim()) {
      errors.adminEmail = 'E-postadresse er påkrevd';
    } else if (!isValidEmail(adminEmail)) {
      errors.adminEmail = 'Ugyldig e-postadresse';
    }
    if (!adminPhone.trim()) {
      errors.adminPhone = 'Telefonnummer er påkrevd';
    } else if (!isValidNorwegianPhone(adminPhone)) {
      errors.adminPhone = 'Ugyldig telefonnummer (8 siffer, evt. med +47)';
    }

    if (!password) {
      errors.password = 'Passord er påkrevd';
    } else if (password.length < 8) {
      errors.password = 'Passordet må være minst 8 tegn';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Bekreft passord er påkrevd';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passordene stemmer ikke overens';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
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
        <img src={hittiLogo} alt="hitti" className={styles.logo} />
        <p className={styles.subtitle}>Opprett en konto for din forening</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Organisasjon</legend>

            <label className={styles.label}>
              <span>Navn på forening/organisasjon <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.organizationName ? styles.inputError : ''}`}
                type="text"
                value={organizationName}
                onChange={(e) => { setOrganizationName(e.target.value); clearFieldError('organizationName'); }}
                required
                placeholder="F.eks. Fotballklubben"
              />
              {fieldErrors.organizationName && <span className={styles.fieldError}>{fieldErrors.organizationName}</span>}
            </label>

            <label className={styles.label}>
              <span>E-postadresse (organisasjon) <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.organizationEmail ? styles.inputError : ''}`}
                type="email"
                value={organizationEmail}
                onChange={(e) => { setOrganizationEmail(e.target.value); clearFieldError('organizationEmail'); }}
                required
                placeholder="org@epost.no"
              />
              {fieldErrors.organizationEmail && <span className={styles.fieldError}>{fieldErrors.organizationEmail}</span>}
            </label>

            <label className={styles.label}>
              <span>Telefonnummer (organisasjon) <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.organizationPhone ? styles.inputError : ''}`}
                type="tel"
                value={organizationPhone}
                onChange={(e) => { setOrganizationPhone(e.target.value); clearFieldError('organizationPhone'); }}
                required
                placeholder="12345678"
              />
              {fieldErrors.organizationPhone && <span className={styles.fieldError}>{fieldErrors.organizationPhone}</span>}
            </label>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Administrator</legend>

            <label className={styles.label}>
              <span>Navn <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.adminName ? styles.inputError : ''}`}
                type="text"
                value={adminName}
                onChange={(e) => { setAdminName(e.target.value); clearFieldError('adminName'); }}
                required
                placeholder="Ola Nordmann"
              />
              {fieldErrors.adminName && <span className={styles.fieldError}>{fieldErrors.adminName}</span>}
            </label>

            <label className={styles.label}>
              <span>E-postadresse <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.adminEmail ? styles.inputError : ''}`}
                type="email"
                value={adminEmail}
                onChange={(e) => { setAdminEmail(e.target.value); clearFieldError('adminEmail'); }}
                required
                autoComplete="email"
                placeholder="din@epost.no"
              />
              {fieldErrors.adminEmail && <span className={styles.fieldError}>{fieldErrors.adminEmail}</span>}
            </label>

            <label className={styles.label}>
              <span>Telefonnummer <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.adminPhone ? styles.inputError : ''}`}
                type="tel"
                value={adminPhone}
                onChange={(e) => { setAdminPhone(e.target.value); clearFieldError('adminPhone'); }}
                required
                placeholder="12345678"
              />
              {fieldErrors.adminPhone && <span className={styles.fieldError}>{fieldErrors.adminPhone}</span>}
            </label>

            <label className={styles.label}>
              <span>Passord <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                required
                autoComplete="new-password"
                placeholder="Minst 8 tegn"
              />
              {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
            </label>

            <label className={styles.label}>
              <span>Bekreft passord <span className={styles.required}>*</span></span>
              <input
                className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                required
                autoComplete="new-password"
                placeholder="Gjenta passord"
              />
              {fieldErrors.confirmPassword && <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
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
