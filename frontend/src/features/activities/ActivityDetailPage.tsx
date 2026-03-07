import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getActivity, getParticipants, sendInvitations } from './services/activitiesApi';
import { ParticipantList } from './components/ParticipantList';
import { SendInvitationDialog } from './components/SendInvitationDialog';
import { ParticipantStatus, InvitationChannel } from './types';
import type { Activity, Participant } from './types';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import styles from './ActivityDetailPage.module.css';

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  usePageTitle(activity?.title ?? 'Aktivitet');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const [activityData, participantsData] = await Promise.all([
        getActivity(id),
        getParticipants(id),
      ]);
      setActivity(activityData);
      setParticipants(participantsData);
    } catch {
      setError('Kunne ikke hente aktivitetsdetaljer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSendInvitations(channel: InvitationChannel) {
    if (!id) return;
    setSending(true);
    try {
      const result = await sendInvitations(id, { channel });
      setShowInviteDialog(false);
      alert(`${result.invitedCount} invitasjon(er) sendt${result.alreadyInvitedCount > 0 ? `. ${result.alreadyInvitedCount} var allerede invitert.` : '.'}`);
      await loadData();
    } catch {
      alert('Kunne ikke sende invitasjoner. Sjekk at Azure Communication Services er konfigurert.');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p>Laster aktivitet...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!activity) return <p>Aktiviteten ble ikke funnet.</p>;

  const accepted = participants.filter(p => p.status === ParticipantStatus.Accepted);
  const declined = participants.filter(p => p.status === ParticipantStatus.Declined);
  const invited = participants.filter(p => p.status === ParticipantStatus.Invited);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button className={styles.backButton} onClick={() => navigate('/aktiviteter')}>
            ← Tilbake
          </button>
          <h1 className={styles.title}>{activity.title}</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.editButton} onClick={() => navigate(`/aktiviteter/${id}/rediger`)}>
            Rediger
          </button>
          <button className={styles.inviteButton} onClick={() => setShowInviteDialog(true)}>
            Send invitasjoner
          </button>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Dato</span>
          <span>
            {new Date(activity.startTime).toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' kl. '}
            {new Date(activity.startTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            {' – '}
            {new Date(activity.endTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Sted</span>
          <span>{activity.location}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Beskrivelse</span>
          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.description) }} />
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Kontakt</span>
          <span>{activity.contactName} — {activity.contactEmail} / {activity.contactPhone}</span>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{accepted.length}</span>
          <span className={styles.statLabel}>Deltar</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{declined.length}</span>
          <span className={styles.statLabel}>Kan ikke</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{invited.length}</span>
          <span className={styles.statLabel}>Ikke svart</span>
        </div>
      </div>

      <ParticipantList participants={participants} />

      {showInviteDialog && (
        <SendInvitationDialog
          onSend={handleSendInvitations}
          onClose={() => setShowInviteDialog(false)}
          sending={sending}
        />
      )}
    </div>
  );
}
