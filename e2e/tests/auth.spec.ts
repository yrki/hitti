import { test, expect } from '@playwright/test';
import { loginAs, registerNewOrganization } from './helpers/auth';
import { uniqueOrgRegistration } from './helpers/data';

test.describe('Autentisering', () => {
  test('ny bruker kan registrere organisasjon og blir innlogget', async ({ page }) => {
    // Arrange
    const registration = uniqueOrgRegistration();

    // Act
    await registerNewOrganization(page, registration);

    // Assert
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(registration.organizationName)).toBeVisible();
  });

  test('innlogget bruker kan logge ut og blir sendt til /login', async ({ page }) => {
    // Arrange
    await registerNewOrganization(page);

    // Act
    await page.getByRole('button', { name: /Logg ut/i }).click();

    // Assert
    await expect(page).toHaveURL(/\/login$/);
  });

  test('eksisterende admin kan logge inn med riktige credentials', async ({ page }) => {
    // Arrange
    const registration = await registerNewOrganization(page);
    await page.getByRole('button', { name: /Logg ut/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Act
    await loginAs(page, registration.adminEmail, registration.password);

    // Assert
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(registration.organizationName)).toBeVisible();
  });

  test('registrering aksepterer telefonnummer med +47-prefix', async ({ page }) => {
    // Arrange
    const registration = uniqueOrgRegistration();
    registration.organizationPhone = `+47 ${registration.organizationPhone}`;
    registration.adminPhone = `+47${registration.adminPhone}`;

    // Act
    await registerNewOrganization(page, registration);

    // Assert
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(registration.organizationName)).toBeVisible();
  });

  test('registrering blokkeres med ugyldig telefonnummer og viser feilmelding', async ({ page }) => {
    // Arrange
    const registration = uniqueOrgRegistration();
    registration.adminPhone = 'tull-nummer';

    // Act
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

    // Assert
    await expect(page.getByText(/Ugyldig telefonnummer/i)).toBeVisible();
    await expect(page).toHaveURL(/\/registrer$/);
  });

  test('innlogging med feil passord viser feilmelding', async ({ page }) => {
    // Arrange
    const registration = await registerNewOrganization(page);
    await page.getByRole('button', { name: /Logg ut/i }).click();

    // Act
    await loginAs(page, registration.adminEmail, 'helt-feil-passord');

    // Assert
    await expect(page.getByText(/Feil e-postadresse eller passord/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
