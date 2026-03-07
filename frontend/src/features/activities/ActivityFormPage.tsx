import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActivityForm } from './components/ActivityForm';
import { getActivity, createActivity, updateActivity } from './services/activitiesApi';
import type { Activity, CreateActivityRequest } from './types';
import { usePageTitle } from '../../shared/hooks/usePageTitle';

export function ActivityFormPage() {
  const { id } = useParams<{ id: string }>();
  usePageTitle(id ? 'Rediger aktivitet' : 'Ny aktivitet');
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | undefined>();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getActivity(id)
      .then(setActivity)
      .catch(() => setError('Kunne ikke hente aktivitet'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: CreateActivityRequest) {
    if (id) {
      await updateActivity(id, data);
      navigate(`/aktiviteter/${id}`);
    } else {
      const created = await createActivity(data);
      navigate(`/aktiviteter/${created.id}`);
    }
  }

  function handleCancel() {
    navigate('/aktiviteter');
  }

  if (loading) {
    return <p>Laster aktivitet...</p>;
  }

  if (error) {
    return <p style={{ color: '#dc2626', fontWeight: 500 }}>{error}</p>;
  }

  return (
    <ActivityForm activity={activity} onSubmit={handleSubmit} onCancel={handleCancel} />
  );
}
