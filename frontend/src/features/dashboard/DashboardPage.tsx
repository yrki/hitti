import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../shared/api';
import styles from './DashboardPage.module.css';

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
      <h2 className={styles.heading}>Kommende aktiviteter</h2>
      {loading && <p>Laster...</p>}
      {!loading && activities.length === 0 && (
        <p className={styles.empty}>Ingen kommende aktiviteter.</p>
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
              <tr key={activity.id}>
                <td className={styles.dateCell}>
                  {new Date(activity.startTime).toLocaleDateString('nb-NO', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className={styles.timeCell}>
                  {new Date(activity.startTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {new Date(activity.endTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <Link to={`/aktiviteter/${activity.id}`} className={styles.activityLink}>
                    {activity.title}
                  </Link>
                </td>
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
