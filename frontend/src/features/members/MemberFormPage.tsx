import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MemberForm } from './components/MemberForm';
import { getMember, createMember, updateMember } from './services/membersApi';
import type { Member, CreateMemberRequest } from './types';
import { usePageTitle } from '../../shared/hooks/usePageTitle';

export function MemberFormPage() {
  const { id } = useParams<{ id: string }>();
  usePageTitle(id ? 'Rediger medlem' : 'Nytt medlem');
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | undefined>();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getMember(id)
      .then(setMember)
      .catch(() => setError('Kunne ikke hente medlem'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: CreateMemberRequest) {
    if (id) {
      await updateMember(id, data);
    } else {
      await createMember(data);
    }
    navigate('/medlemmer');
  }

  function handleCancel() {
    navigate('/medlemmer');
  }

  if (loading) {
    return <p>Laster medlem...</p>;
  }

  if (error) {
    return <p style={{ color: '#dc2626', fontWeight: 500 }}>{error}</p>;
  }

  return (
    <MemberForm member={member} onSubmit={handleSubmit} onCancel={handleCancel} />
  );
}
