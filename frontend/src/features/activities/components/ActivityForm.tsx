import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
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
  const [date, setDate] = useState(
    activity?.startTime ? activity.startTime.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );
  const [startTime, setStartTime] = useState(
    activity?.startTime ? activity.startTime.substring(11, 16) : '18:00'
  );
  const [endTime, setEndTime] = useState(
    activity?.endTime ? activity.endTime.substring(11, 16) : '20:00'
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
      startTime: new Date(`${date}T${startTime}`).toISOString(),
      endTime: new Date(`${date}T${endTime}`).toISOString(),
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

        <div className={styles.label}>
          Beskrivelse
          <div className={styles.editor}>
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              modules={{
                toolbar: [
                  [{ header: [2, 3, false] }],
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link'],
                  ['clean'],
                ],
              }}
            />
          </div>
        </div>

        <label className={styles.label}>
          Dato
          <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <div className={styles.timeRow}>
          <label className={styles.label}>
            Fra
            <input className={styles.input} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </label>
          <label className={styles.label}>
            Til
            <input className={styles.input} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </label>
        </div>

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
