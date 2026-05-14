import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../shared/api';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import styles from './DashboardPage.module.css';

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

interface UpcomingActivity {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  acceptedCount: number;
  declinedCount: number;
  invitedCount: number;
}

export function DashboardPage() {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const [activities, setActivities] = useState<UpcomingActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UpcomingActivity[]>('/activities/upcoming?count=20')
      .then(setActivities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {!loading && activities.length > 0 && (
        <div className={styles.header}>
          <h2 className={styles.heading}>Kommende aktiviteter</h2>
          <button className={styles.addButton} onClick={() => navigate('/aktiviteter/ny')}>
            + Ny aktivitet
          </button>
        </div>
      )}
      {loading && <p>Laster...</p>}
      {!loading && activities.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyHeadline}>Her var det tomt!</p>
          <button className={styles.emptyButton} onClick={() => navigate('/aktiviteter/ny')}>
            Opprett aktivitet
          </button>
        </div>
      )}
      {!loading && activities.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Tid</th>
              <th>Aktivitet</th>
              <th>Sted</th>
              <th className={styles.countHeader}>Påmeldt</th>
              <th className={styles.countHeader}>Avslått</th>
              <th className={styles.countHeader}>Invitert</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className={styles.clickableRow}
                onClick={() => navigate(`/aktiviteter/${activity.id}`)}
              >
                <td className={styles.dateCell}>
                  {formatDate(activity.startTime)}
                </td>
                <td className={styles.timeCell}>
                  {new Date(activity.startTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {new Date(activity.endTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className={styles.activityCell}>{activity.title}</td>
                <td className={styles.locationCell}>{activity.location}</td>
                <td className={`${styles.countCell} ${styles.accepted}`}>{activity.acceptedCount}</td>
                <td className={`${styles.countCell} ${styles.declined}`}>{activity.declinedCount}</td>
                <td className={`${styles.countCell} ${styles.invited}`}>{activity.invitedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
