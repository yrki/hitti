import { useEffect, useState, useCallback } from 'react';
import { MemberTable } from './components/MemberTable';
import { MemberForm } from './components/MemberForm';
import { getMembers, createMember, updateMember, deleteMember } from './services/membersApi';
import type { Member, CreateMemberRequest } from './types';
import styles from './MembersPage.module.css';

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();

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

  async function handleCreate(data: CreateMemberRequest) {
    await createMember(data);
    setShowForm(false);
    await loadMembers();
  }

  async function handleUpdate(data: CreateMemberRequest) {
    if (!editingMember) return;
    await updateMember(editingMember.id, data);
    setEditingMember(undefined);
    setShowForm(false);
    await loadMembers();
  }

  async function handleDelete(member: Member) {
    if (!confirm(`Er du sikker på at du vil slette ${member.name}?`)) return;
    await deleteMember(member.id);
    await loadMembers();
  }

  function handleEdit(member: Member) {
    setEditingMember(member);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingMember(undefined);
    setShowForm(false);
  }

  if (loading) {
    return <p>Laster medlemmer...</p>;
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Medlemmer</h1>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Nytt medlem
        </button>
      </div>

      <MemberTable members={members} onEdit={handleEdit} onDelete={handleDelete} />

      {showForm && (
        <MemberForm
          member={editingMember}
          onSubmit={editingMember ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
