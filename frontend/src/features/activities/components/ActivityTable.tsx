import type { Activity } from '../types';
import styles from './ActivityTable.module.css';

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export function ActivityTable({ activities, onEdit, onDelete }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tittel</th>
            <th>Dato</th>
            <th>Sted</th>
            <th>Kontaktperson</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{new Date(a.activityDate).toLocaleDateString('nb-NO')}</td>
              <td>{a.location}</td>
              <td>{a.contactName}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.editButton} onClick={() => onEdit(a)}>
                    Rediger
                  </button>
                  <button className={styles.deleteButton} onClick={() => onDelete(a)}>
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
