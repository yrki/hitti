import type { Member } from '../types';
import styles from './MemberTable.module.css';

interface Props {
  members: Member[];
}

export function MemberTable({ members }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Navn</th>
            <th>E-post</th>
            <th>Telefon</th>
            <th>Status</th>
            <th>Innmeldt</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.phone}</td>
              <td>
                <span className={`${styles.badge} ${styles[m.status]}`}>
                  {m.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </span>
              </td>
              <td>{new Date(m.joinedAt).toLocaleDateString('nb-NO')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
