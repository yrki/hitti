import { NotificationCard } from './components/NotificationCard';
import type { Notification } from './types';
import styles from './NotificationsPage.module.css';

const sampleNotifications: Notification[] = [
  { id: '1', title: 'Velkommen til nye medlemmer', message: 'Automatisk velkomstmelding sendt til 12 nye medlemmer denne måneden.', type: 'success', sentAt: '2026-03-06', recipients: 12 },
  { id: '2', title: 'Kontingent forfaller snart', message: 'Påminnelse sendt om at kontingenten forfaller innen 14 dager.', type: 'warning', sentAt: '2026-03-05', recipients: 87 },
  { id: '3', title: 'Systemoppdatering', message: 'Planlagt vedlikehold lørdag 8. mars kl. 02:00–04:00.', type: 'info', sentAt: '2026-03-04', recipients: 1243 },
  { id: '4', title: 'Feil ved utsending', message: 'Kunne ikke levere e-post til 3 medlemmer. Sjekk e-postadressene.', type: 'error', sentAt: '2026-03-03', recipients: 3 },
];

export function NotificationsPage() {
  return (
    <div className={styles.list}>
      {sampleNotifications.map((n) => (
        <NotificationCard key={n.id} notification={n} />
      ))}
    </div>
  );
}
