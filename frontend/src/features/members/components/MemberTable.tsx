import { useState, useMemo } from 'react';
import { MemberStatus, MemberRole } from '../types';
import type { Member } from '../types';
import styles from './MemberTable.module.css';

type SortField = 'name' | 'email' | 'phone' | 'status' | 'role' | 'joinedAt';
type SortDirection = 'asc' | 'desc';

interface Props {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export function MemberTable({ members, onEdit, onDelete }: Props) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  }

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name, 'nb'); break;
        case 'email': cmp = a.email.localeCompare(b.email, 'nb'); break;
        case 'phone': cmp = a.phone.localeCompare(b.phone); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'role': cmp = a.role.localeCompare(b.role); break;
        case 'joinedAt': cmp = a.joinedAt.localeCompare(b.joinedAt); break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [members, sortField, sortDirection]);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.sortable} onClick={() => handleSort('name')}>Navn{sortIndicator('name')}</th>
            <th className={styles.sortable} onClick={() => handleSort('email')}>E-post{sortIndicator('email')}</th>
            <th className={styles.sortable} onClick={() => handleSort('phone')}>Telefon{sortIndicator('phone')}</th>
            <th className={styles.sortable} onClick={() => handleSort('status')}>Status{sortIndicator('status')}</th>
            <th className={styles.sortable} onClick={() => handleSort('role')}>Rolle{sortIndicator('role')}</th>
            <th className={styles.sortable} onClick={() => handleSort('joinedAt')}>Innmeldt{sortIndicator('joinedAt')}</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.phone}</td>
              <td>
                <span className={`${styles.badge} ${m.status === MemberStatus.Active ? styles.active : styles.inactive}`}>
                  {m.status === MemberStatus.Active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${m.role === MemberRole.Admin ? styles.admin : styles.member}`}>
                  {m.role === MemberRole.Admin ? 'Admin' : 'Medlem'}
                </span>
              </td>
              <td>{new Date(m.joinedAt).toLocaleDateString('nb-NO')}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.editButton} onClick={() => onEdit(m)}>
                    Rediger
                  </button>
                  <button className={styles.deleteButton} onClick={() => onDelete(m)}>
                    Slett
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
