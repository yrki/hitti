import { useState } from 'react';
import { InvitationChannel } from '../types';
import styles from './SendInvitationDialog.module.css';

interface Props {
  onSend: (channel: InvitationChannel) => void;
  onClose: () => void;
  sending: boolean;
}

export function SendInvitationDialog({ onSend, onClose, sending }: Props) {
  const [channel, setChannel] = useState<InvitationChannel>(InvitationChannel.Email);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Send invitasjoner</h2>
        <p className={styles.description}>
          Velg hvordan du vil sende invitasjoner til alle registrerte medlemmer.
          Medlemmer som allerede er invitert vil ikke motta ny invitasjon.
        </p>

        <div className={styles.options}>
          <label className={`${styles.option} ${channel === InvitationChannel.Email ? styles.selected : ''}`}>
            <input
              type="radio"
              name="channel"
              value={InvitationChannel.Email}
              checked={channel === InvitationChannel.Email}
              onChange={() => setChannel(InvitationChannel.Email)}
            />
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>E-post</span>
              <span className={styles.optionDescription}>Send invitasjon via e-post med svarknappar</span>
            </div>
          </label>

          <label className={`${styles.option} ${channel === InvitationChannel.Sms ? styles.selected : ''}`}>
            <input
              type="radio"
              name="channel"
              value={InvitationChannel.Sms}
              checked={channel === InvitationChannel.Sms}
              onChange={() => setChannel(InvitationChannel.Sms)}
            />
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>SMS</span>
              <span className={styles.optionDescription}>Send invitasjon via SMS med svarlenke</span>
            </div>
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose} disabled={sending}>
            Avbryt
          </button>
          <button className={styles.sendButton} onClick={() => onSend(channel)} disabled={sending}>
            {sending ? 'Sender...' : 'Send invitasjoner'}
          </button>
        </div>
      </div>
    </div>
  );
}
