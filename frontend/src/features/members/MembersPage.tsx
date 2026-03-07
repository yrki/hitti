import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberTable } from './components/MemberTable';
import { getMembers, deleteMember } from './services/membersApi';
import type { Member } from './types';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import styles from './MembersPage.module.css';

export function MembersPage() {
  usePageTitle('Medlemmer');
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadMembers = useCallback(async () => {
    try {
      setError(null);
      const data = await getMembers();
      setMembers(data);
    } catch {
      setError('Kunne ikke hente medlemmer');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function handleDelete(member: Member) {
    if (!confirm(`Er du sikker på at du vil slette ${member.name}?`)) return;
    await deleteMember(member.id);
    await loadMembers();
  }

  function handleEdit(member: Member) {
    navigate(`/medlemmer/${member.id}/rediger`);
  }

  if (loading) {
    return <p>Laster medlemmer...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q);
  });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Medlemmer</h1>
        <button className={styles.addButton} onClick={() => navigate('/medlemmer/ny')}>
          + Nytt medlem
        </button>
      </div>

      <input
        className={styles.searchInput}
        type="text"
        placeholder="Søk på navn, e-post eller telefon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <MemberTable members={filteredMembers} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
