const NORWEGIAN_PHONE_PATTERN = /^(?:\+?47)?\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Aksepterer et norsk telefonnummer som 8 siffer, eventuelt med +47 eller 47
 * prefiks. Mellomrom blir ignorert. Returnerer normalisert form (kun siffer
 * og evt. ledende +).
 */
export function normalizeNorwegianPhone(value: string): string {
  return value.replace(/\s+/g, '');
}

export function isValidNorwegianPhone(value: string): boolean {
  const normalized = normalizeNorwegianPhone(value);
  return NORWEGIAN_PHONE_PATTERN.test(normalized);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
