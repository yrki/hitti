import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { uniqueOrgRegistration, type TestOrgRegistration } from './data';

/**
 * Registrerer en ny organisasjon via UI og verifiserer at man blir
 * sendt til dashbordet (`/`) etterpå. Returnerer credentials slik at
 * påfølgende test kan logge inn igjen.
 */
export async function registerNewOrganization(
  page: Page,
  registration: TestOrgRegistration = uniqueOrgRegistration(),
): Promise<TestOrgRegistration> {
  await page.goto('/registrer');

  await page.getByLabel(/Navn på forening\/organisasjon/i).fill(registration.organizationName);
  await page.getByLabel(/E-postadresse \(organisasjon\)/i).fill(registration.organizationEmail);
  await page.getByLabel(/Telefonnummer \(organisasjon\)/i).fill(registration.organizationPhone);

  const adminFieldset = page.locator('fieldset', { hasText: 'Administrator' });
  await adminFieldset.getByLabel(/^Navn/).fill(registration.adminName);
  await adminFieldset.getByLabel(/E-postadresse/i).fill(registration.adminEmail);
  await adminFieldset.getByLabel(/^Telefonnummer/i).fill(registration.adminPhone);
  await adminFieldset.getByLabel(/^Passord/).fill(registration.password);
  await adminFieldset.getByLabel(/Bekreft passord/i).fill(registration.password);

  await page.getByRole('button', { name: /^Registrer$/ }).click();
  await expect(page).toHaveURL(/\/$/);

  return registration;
}

/**
 * Logger inn en eksisterende admin via UI.
 */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/E-postadresse/i).fill(email);
  await page.getByLabel(/Passord/i).fill(password);
  await page.getByRole('button', { name: /^Logg inn$/ }).click();
}
