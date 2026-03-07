import type { Notification } from '../types';
import styles from './NotificationCard.module.css';

interface Props {
  notification: Notification;
}

const typeLabels = {
  info: 'Info',
  warning: 'Advarsel',
  success: 'Suksess',
  error: 'Feil',
} as const;

export function NotificationCard({ notification }: Props) {
  return (
    <div className={`${styles.card} ${styles[notification.type]}`}>
      <div className={styles.header}>
        <span className={styles.badge}>{typeLabels[notification.type]}</span>
        <span className={styles.date}>
          {new Date(notification.sentAt).toLocaleDateString('nb-NO')}
        </span>
      </div>
      <h3 className={styles.title}>{notification.title}</h3>
      <p className={styles.message}>{notification.message}</p>
      <span className={styles.recipients}>
        {notification.recipients} mottakere
      </span>
    </div>
  );
}
