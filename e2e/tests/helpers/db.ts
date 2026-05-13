import pg from 'pg';

const { Client } = pg;

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function getConfig(): DbConfig {
  return {
    host: process.env.E2E_DB_HOST ?? 'localhost',
    port: Number(process.env.E2E_DB_PORT ?? 5433),
    user: process.env.E2E_DB_USER ?? 'admin',
    password: process.env.E2E_DB_PASSWORD ?? 'superhemmeligpassord!',
    database: process.env.E2E_DB_NAME ?? 'hitti',
  };
}

/**
 * Henter et invitasjons-token for en gitt aktivitet rett fra databasen.
 * Brukt av RSVP-testene for å unngå avhengighet til ekte e-postlevering.
 */
export async function fetchInvitationToken(activityId: string): Promise<string> {
  const client = new Client(getConfig());
  await client.connect();
  try {
    const result = await client.query<{ InvitationToken: string }>(
      `SELECT "InvitationToken"
         FROM activity_participants
        WHERE "ActivityId" = $1
        ORDER BY "InvitedAt" DESC
        LIMIT 1`,
      [activityId],
    );

    if (result.rows.length === 0) {
      throw new Error(`Ingen invitasjons-token funnet for aktivitet ${activityId}`);
    }

    return result.rows[0].InvitationToken;
  } finally {
    await client.end();
  }
}

/**
 * Sletter aktivitets-deltakere for en gitt aktivitet, brukt til opprydning
 * mellom testkjøringer ved behov.
 */
export async function deleteParticipantsForActivity(activityId: string): Promise<void> {
  const client = new Client(getConfig());
  await client.connect();
  try {
    await client.query(
      `DELETE FROM activity_participants WHERE "ActivityId" = $1`,
      [activityId],
    );
  } finally {
    await client.end();
  }
}
