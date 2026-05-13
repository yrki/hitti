import { test, expect } from '@playwright/test';
import { registerNewOrganization } from './helpers/auth';
import { uniqueActivity } from './helpers/data';

test.describe('Aktiviteter', () => {
  test.beforeEach(async ({ page }) => {
    await registerNewOrganization(page);
  });

  test('admin kan opprette en ny aktivitet og se den i listen', async ({ page }) => {
    // Arrange
    const activity = uniqueActivity();
    await page.goto('/aktiviteter');
    await page.getByRole('button', { name: /\+ Ny aktivitet/i }).click();
    await expect(page).toHaveURL(/\/aktiviteter\/ny$/);

    // Act
    await page.getByLabel(/^Tittel/).fill(activity.title);
    await page.getByLabel(/^Dato/).fill(activity.date);
    await page.getByLabel(/^Fra/).fill(activity.startTime);
    await page.getByLabel(/^Til/).fill(activity.endTime);
    await page.getByLabel(/^Sted/).fill(activity.location);
    const contactFieldset = page.locator('fieldset', { hasText: 'Kontaktperson' });
    await contactFieldset.getByLabel(/^Navn/).fill(activity.contactName);
    await contactFieldset.getByLabel(/^E-post/).fill(activity.contactEmail);
    await contactFieldset.getByLabel(/^Telefon/).fill(activity.contactPhone);
    await page.getByRole('button', { name: /^Opprett$/ }).click();

    // Assert
    await expect(page).toHaveURL(/\/aktiviteter\/[0-9a-f-]+$/);
    await page.goto('/aktiviteter');
    await expect(page.getByRole('button', { name: activity.title })).toBeVisible();
  });

  test('admin kan åpne aktivitetsdetaljer fra listen', async ({ page }) => {
    // Arrange
    const activity = uniqueActivity();
    await page.goto('/aktiviteter/ny');
    await page.getByLabel(/^Tittel/).fill(activity.title);
    await page.getByLabel(/^Dato/).fill(activity.date);
    await page.getByLabel(/^Fra/).fill(activity.startTime);
    await page.getByLabel(/^Til/).fill(activity.endTime);
    await page.getByLabel(/^Sted/).fill(activity.location);
    const contactFieldset = page.locator('fieldset', { hasText: 'Kontaktperson' });
    await contactFieldset.getByLabel(/^Navn/).fill(activity.contactName);
    await contactFieldset.getByLabel(/^E-post/).fill(activity.contactEmail);
    await contactFieldset.getByLabel(/^Telefon/).fill(activity.contactPhone);
    await page.getByRole('button', { name: /^Opprett$/ }).click();
    await page.goto('/aktiviteter');

    // Act
    await page.getByRole('button', { name: activity.title }).click();

    // Assert
    await expect(page).toHaveURL(/\/aktiviteter\/[0-9a-f-]+$/);
    await expect(page.getByRole('heading', { name: activity.title })).toBeVisible();
    await expect(page.getByText(activity.location)).toBeVisible();
  });

  test('admin kan slette en aktivitet', async ({ page }) => {
    // Arrange
    const activity = uniqueActivity();
    await page.goto('/aktiviteter/ny');
    await page.getByLabel(/^Tittel/).fill(activity.title);
    await page.getByLabel(/^Dato/).fill(activity.date);
    await page.getByLabel(/^Fra/).fill(activity.startTime);
    await page.getByLabel(/^Til/).fill(activity.endTime);
    await page.getByLabel(/^Sted/).fill(activity.location);
    const contactFieldset = page.locator('fieldset', { hasText: 'Kontaktperson' });
    await contactFieldset.getByLabel(/^Navn/).fill(activity.contactName);
    await contactFieldset.getByLabel(/^E-post/).fill(activity.contactEmail);
    await contactFieldset.getByLabel(/^Telefon/).fill(activity.contactPhone);
    await page.getByRole('button', { name: /^Opprett$/ }).click();
    await page.goto('/aktiviteter');
    const row = page.getByRole('row', { name: new RegExp(activity.title) });
    page.once('dialog', (dialog) => dialog.accept());

    // Act
    await row.getByRole('button', { name: /Slett/i }).click();

    // Assert
    await expect(page.getByRole('button', { name: activity.title })).toHaveCount(0);
  });
});
