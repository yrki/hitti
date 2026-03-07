import { MemberStatus, MemberRole } from '../types';
import type { Member } from '../types';
import styles from './MemberTable.module.css';

interface Props {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export function MemberTable({ members, onEdit, onDelete }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Navn</th>
            <th>E-post</th>
            <th>Telefon</th>
            <th>Status</th>
            <th>Rolle</th>
            <th>Innmeldt</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
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
