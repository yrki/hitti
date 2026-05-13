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
