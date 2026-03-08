import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityTable } from './components/ActivityTable';
import { getActivities, deleteActivity } from './services/activitiesApi';
import type { Activity } from './types';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import styles from './ActivitiesPage.module.css';

export function ActivitiesPage() {
  usePageTitle('Aktiviteter');
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadActivities = useCallback(async () => {
    try {
      setError(null);
      const data = await getActivities();
      setActivities(data);
    } catch {
      setError('Kunne ikke hente aktiviteter');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  async function handleDelete(activity: Activity) {
    if (!confirm(`Er du sikker på at du vil slette "${activity.title}"?`)) return;
    await deleteActivity(activity.id);
    await loadActivities();
  }

  function handleEdit(activity: Activity) {
    navigate(`/aktiviteter/${activity.id}/rediger`);
  }

  if (loading) {
    return <p>Laster aktiviteter...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  const filteredActivities = activities.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.contactName.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Aktiviteter</h1>
        <button className={styles.addButton} onClick={() => navigate('/aktiviteter/ny')}>
          + Ny aktivitet
        </button>
      </div>

      <input
        className={styles.searchInput}
        type="text"
        placeholder="Søk på tittel, sted eller kontaktperson..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ActivityTable activities={filteredActivities} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
