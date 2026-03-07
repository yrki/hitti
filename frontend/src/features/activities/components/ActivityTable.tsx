import { useNavigate } from 'react-router-dom';
import type { Activity } from '../types';
import styles from './ActivityTable.module.css';

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export function ActivityTable({ activities, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tittel</th>
            <th>Dato</th>
            <th>Tid</th>
            <th>Sted</th>
            <th>Kontaktperson</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={a.id}>
              <td>
                <button className={styles.titleLink} onClick={() => navigate(`/aktiviteter/${a.id}`)}>
                  {a.title}
                </button>
              </td>
              <td>{new Date(a.startTime).toLocaleDateString('nb-NO')}</td>
              <td>
                {new Date(a.startTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                {' – '}
                {new Date(a.endTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
              </td>
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
