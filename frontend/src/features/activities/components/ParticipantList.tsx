import { ParticipantStatus, InvitationChannel, NotificationStatus } from '../types';
import type { Participant } from '../types';
import styles from './ParticipantList.module.css';

interface Props {
  participants: Participant[];
}

const statusLabels: Record<Participant['status'], string> = {
  [ParticipantStatus.Accepted]: 'Deltar',
  [ParticipantStatus.Declined]: 'Kan ikke',
  [ParticipantStatus.Invited]: 'Ikke svart',
};

const notificationLabels: Record<Participant['notificationStatus'], string> = {
  [NotificationStatus.Pending]: 'Venter',
  [NotificationStatus.Sent]: 'Sendt',
  [NotificationStatus.Failed]: 'Feilet',
};

export function ParticipantList({ participants }: Props) {
  if (participants.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Ingen invitasjoner sendt ennå. Klikk «Send invitasjoner» for å invitere medlemmene.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Deltakere</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Navn</th>
            <th>E-post</th>
            <th>Telefon</th>
            <th>Kanal</th>
            <th>Varsel</th>
            <th>Status</th>
            <th>Svart</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id}>
              <td>{p.memberName}</td>
              <td>{p.memberEmail}</td>
              <td>{p.memberPhone}</td>
              <td>{p.invitationChannel === InvitationChannel.Sms ? 'SMS' : 'E-post'}</td>
              <td>
                <span className={`${styles.badge} ${styles[p.notificationStatus]}`}>
                  {notificationLabels[p.notificationStatus]}
                </span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles[p.status]}`}>
                  {statusLabels[p.status]}
                </span>
              </td>
              <td>
                {p.respondedAt
                  ? new Date(p.respondedAt).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
