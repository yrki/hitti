import { useState } from 'react';
import type { Member, CreateMemberRequest } from '../types';
import styles from './MemberForm.module.css';

interface Props {
  member?: Member;
  onSubmit: (data: CreateMemberRequest) => void;
  onCancel: () => void;
}

export function MemberForm({ member, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [status, setStatus] = useState(member?.status ?? 'active');
  const [joinedAt, setJoinedAt] = useState(
    member?.joinedAt ? member.joinedAt.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      name,
      email,
      phone,
      status,
      joinedAt: new Date(joinedAt).toISOString(),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{member ? 'Rediger medlem' : 'Nytt medlem'}</h2>

        <label className={styles.label}>
          Navn
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          E-post
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          Telefon
          <input
            className={styles.input}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          Status
          <select
            className={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>
        </label>

        <label className={styles.label}>
          Innmeldt
          <input
            className={styles.input}
            type="date"
            value={joinedAt}
            onChange={(e) => setJoinedAt(e.target.value)}
            required
          />
        </label>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Avbryt
          </button>
          <button type="submit" className={styles.submitButton}>
            {member ? 'Oppdater' : 'Opprett'}
          </button>
        </div>
      </form>
  );
}
