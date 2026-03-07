import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { RsvpResult } from './types';
import styles from './RsvpPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

export function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const response = searchParams.get('svar');
  const [result, setResult] = useState<RsvpResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualChoice, setManualChoice] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !response || (response !== 'ja' && response !== 'nei')) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/rsvp/${encodeURIComponent(token)}?svar=${encodeURIComponent(response)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? 'Noe gikk galt');
        }
        return res.json() as Promise<RsvpResult>;
      })
      .then(setResult)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, response]);

  async function handleManualResponse(choice: string) {
    if (!token) return;
    setManualChoice(choice);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/rsvp/${encodeURIComponent(token)}?svar=${encodeURIComponent(choice)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? 'Noe gikk galt');
      }
      const data = await res.json() as RsvpResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Registrerer svar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Oops!</h1>
          <p className={styles.message}>{error}</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>{result.accepted ? '✅' : '❌'}</div>
          <h1 className={styles.title}>
            {result.accepted ? 'Du er påmeldt!' : 'Svar registrert'}
          </h1>
          <p className={styles.message}>
            {result.accepted
              ? `Du har meldt deg på "${result.activityTitle}".`
              : `Du har meldt avbud til "${result.activityTitle}".`}
          </p>
          <div className={styles.details}>
            <p><strong>Dato:</strong> {new Date(result.activityDate).toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Sted:</strong> {result.activityLocation}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Vil du delta?</h1>
        <p className={styles.message}>Velg om du vil bli med på aktiviteten.</p>
        <div className={styles.buttons}>
          <button
            className={styles.acceptButton}
            onClick={() => handleManualResponse('ja')}
            disabled={manualChoice !== null}
          >
            Ja, jeg blir med
          </button>
          <button
            className={styles.declineButton}
            onClick={() => handleManualResponse('nei')}
            disabled={manualChoice !== null}
          >
            Nei, jeg kan ikke
          </button>
        </div>
      </div>
    </div>
  );
}
