import { useState } from 'react';
import type { Activity, CreateActivityRequest } from '../types';
import styles from './ActivityForm.module.css';

interface Props {
  activity?: Activity;
  onSubmit: (data: CreateActivityRequest) => void;
  onCancel: () => void;
}

export function ActivityForm({ activity, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [activityDate, setActivityDate] = useState(
    activity?.activityDate ? activity.activityDate.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );
  const [location, setLocation] = useState(activity?.location ?? '');
  const [contactName, setContactName] = useState(activity?.contactName ?? '');
  const [contactEmail, setContactEmail] = useState(activity?.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(activity?.contactPhone ?? '');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      title,
      description,
      activityDate: new Date(activityDate).toISOString(),
      location,
      contactName,
      contactEmail,
      contactPhone,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{activity ? 'Rediger aktivitet' : 'Ny aktivitet'}</h2>

        <label className={styles.label}>
          Tittel
          <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label className={styles.label}>
          Beskrivelse
          <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
        </label>

        <label className={styles.label}>
          Dato
          <input className={styles.input} type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required />
        </label>

        <label className={styles.label}>
          Sted
          <input className={styles.input} type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </label>

        <fieldset className={styles.fieldset}>
          <legend>Kontaktperson</legend>

          <label className={styles.label}>
            Navn
            <input className={styles.input} type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
          </label>

          <label className={styles.label}>
            E-post
            <input className={styles.input} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
          </label>

          <label className={styles.label}>
            Telefon
            <input className={styles.input} type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
          </label>
        </fieldset>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Avbryt
          </button>
          <button type="submit" className={styles.submitButton}>
            {activity ? 'Oppdater' : 'Opprett'}
          </button>
        </div>
      </form>
  );
}
