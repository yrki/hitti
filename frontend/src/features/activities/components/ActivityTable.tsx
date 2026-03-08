import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../types';
import styles from './ActivityTable.module.css';

type SortField = 'title' | 'startTime' | 'location' | 'contactName';
type SortDirection = 'asc' | 'desc';

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export function ActivityTable({ activities, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('startTime');
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

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title': cmp = a.title.localeCompare(b.title, 'nb'); break;
        case 'startTime': cmp = a.startTime.localeCompare(b.startTime); break;
        case 'location': cmp = a.location.localeCompare(b.location, 'nb'); break;
        case 'contactName': cmp = a.contactName.localeCompare(b.contactName, 'nb'); break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [activities, sortField, sortDirection]);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.sortable} onClick={() => handleSort('title')}>Tittel{sortIndicator('title')}</th>
            <th className={styles.sortable} onClick={() => handleSort('startTime')}>Dato{sortIndicator('startTime')}</th>
            <th>Tid</th>
            <th className={styles.sortable} onClick={() => handleSort('location')}>Sted{sortIndicator('location')}</th>
            <th className={styles.sortable} onClick={() => handleSort('contactName')}>Kontaktperson{sortIndicator('contactName')}</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {sortedActivities.map((a) => (
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
