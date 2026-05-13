import { randomUUID } from 'node:crypto';

/**
 * Genererer unike test-data per kjøring slik at testene ikke kolliderer
 * med seed.sql eller hverandre.
 */
export interface TestOrgRegistration {
  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
}

export function uniqueOrgRegistration(): TestOrgRegistration {
  const id = randomUUID().slice(0, 8);
  const phoneSuffix = Math.floor(10_000_000 + Math.random() * 89_999_999).toString();
  const adminPhoneSuffix = Math.floor(10_000_000 + Math.random() * 89_999_999).toString();

  return {
    organizationName: `Test-orgen ${id}`,
    organizationEmail: `org-${id}@e2e.example.com`,
    organizationPhone: phoneSuffix,
    adminName: `Admin ${id}`,
    adminEmail: `admin-${id}@e2e.example.com`,
    adminPhone: adminPhoneSuffix,
    password: 'SuperSafe123!',
  };
}

export interface TestActivity {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export function uniqueActivity(overrides: Partial<TestActivity> = {}): TestActivity {
  const id = randomUUID().slice(0, 8);
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isoDate = futureDate.toISOString().slice(0, 10);

  return {
    title: `E2E aktivitet ${id}`,
    description: `Beskrivelse for testaktivitet ${id}`,
    date: isoDate,
    startTime: '18:00',
    endTime: '20:00',
    location: `Testlokale ${id}`,
    contactName: `Kontakt ${id}`,
    contactEmail: `kontakt-${id}@e2e.example.com`,
    contactPhone: '99887766',
    ...overrides,
  };
}
