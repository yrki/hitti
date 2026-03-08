import { ParticipantStatus, InvitationChannel, NotificationStatus } from '../types';
import type { Participant } from '../types';
import styles from './ParticipantList.module.css';

interface Props {
  participants: Participant[];
  onInvite?: () => void;
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

import { resendInvitation } from '../services/activitiesApi';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

export function ParticipantList({ participants, onInvite }: Props) {
  const { id: activityId } = useParams<{ id: string }>();
  const [sendingId, setSendingId] = useState<string | null>(null);

  async function handleResend(participantId: string) {
    if (!activityId) return;
    setSendingId(participantId);
    try {
      await resendInvitation(activityId, participantId);
      alert('Invitasjon sendt på nytt!');
    } catch {
      alert('Kunne ikke sende invitasjon på nytt.');
    } finally {
      setSendingId(null);
    }
  }
  if (participants.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Ingen invitasjoner sendt ennå.</p>
        {onInvite && (
          <button className={styles.inviteButton} onClick={onInvite}>
            Send invitasjoner
          </button>
        )}
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
            <th></th>
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
              <td>
                {(p.status !== ParticipantStatus.Accepted && p.status !== ParticipantStatus.Declined) && (
                  <button
                    className={styles.resendButton}
                    onClick={() => handleResend(p.id)}
                    disabled={sendingId === p.id}
                  >
                    {sendingId === p.id ? 'Sender...' : 'Send på nytt'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
