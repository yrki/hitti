import { test, expect, type Page } from '@playwright/test';
import { registerNewOrganization } from './helpers/auth';
import { uniqueActivity } from './helpers/data';
import { fetchInvitationToken } from './helpers/db';
import { randomUUID } from 'node:crypto';

/**
 * For å få et gyldig invitasjons-token uten å gå via ekte e-post, går vi rett
 * mot Postgres (port 5433) etter at admin har sendt invitasjonen via UI. Det
 * er enklere enn å legge på en egen test-endpoint i backend.
 */

async function createMemberInUi(page: Page): Promise<void> {
  const id = randomUUID().slice(0, 8);
  await page.goto('/medlemmer/ny');
  await page.getByLabel(/^Navn/).fill(`Medlem ${id}`);
  await page.getByLabel(/^E-post/).fill(`medlem-${id}@e2e.example.com`);
  await page.getByLabel(/^Telefon/).fill('98765432');
  await page.getByRole('button', { name: /^Opprett$/ }).click();
  await expect(page).toHaveURL(/\/medlemmer$/);
}

async function createActivityInUiAndReturnId(page: Page): Promise<string> {
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
  await expect(page).toHaveURL(/\/aktiviteter\/[0-9a-f-]+$/);
  const url = page.url();
  const match = url.match(/\/aktiviteter\/([0-9a-f-]+)/);
  if (!match) throw new Error('Klarte ikke å hente aktivitets-id fra URL');
  return match[1];
}

async function sendInvitationsViaUi(page: Page, activityId: string): Promise<void> {
  await page.goto(`/aktiviteter/${activityId}`);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /^Send invitasjoner$/ }).click();

  const dialogHeading = page.getByRole('heading', { name: /^Send invitasjoner$/ });
  await expect(dialogHeading).toBeVisible();

  // Scope direkte til dialogens body (heading-ens umiddelbare forelder) for å
  // unngå å treffe trigger-knappen på siden, som har samme navn.
  const dialogBody = dialogHeading.locator('..');
  await dialogBody.getByRole('button', { name: /^Send invitasjoner$/ }).click();
  await expect(dialogHeading).toBeHidden({ timeout: 15_000 });
}

test.describe('Invitasjoner og RSVP', () => {
  test('admin kan sende invitasjon for en aktivitet', async ({ page }) => {
    // Arrange
    await registerNewOrganization(page);
    await createMemberInUi(page);
    const activityId = await createActivityInUiAndReturnId(page);

    // Act
    await sendInvitationsViaUi(page, activityId);

    // Assert
    await page.goto(`/aktiviteter/${activityId}`);
    await expect(page.getByRole('heading', { name: /Deltakere/i })).toBeVisible();
  });

  test('medlem kan svare ja via /svar/<token>?svar=ja', async ({ page }) => {
    // Arrange
    await registerNewOrganization(page);
    await createMemberInUi(page);
    const activityId = await createActivityInUiAndReturnId(page);
    await sendInvitationsViaUi(page, activityId);
    const token = await fetchInvitationToken(activityId);

    // Act
    await page.goto(`/svar/${token}?svar=ja`);

    // Assert
    await expect(page.getByRole('heading', { name: /Du er påmeldt!/i })).toBeVisible();
  });

  test('medlem kan svare nei via /svar/<token>?svar=nei', async ({ page }) => {
    // Arrange
    await registerNewOrganization(page);
    await createMemberInUi(page);
    const activityId = await createActivityInUiAndReturnId(page);
    await sendInvitationsViaUi(page, activityId);
    const token = await fetchInvitationToken(activityId);

    // Act
    await page.goto(`/svar/${token}?svar=nei`);

    // Assert
    await expect(page.getByRole('heading', { name: /Svar registrert/i })).toBeVisible();
  });

  test('ugyldig token viser feilmelding', async ({ page }) => {
    // Arrange
    const bogusToken = 'helt-ugyldig-token-uten-treff';

    // Act
    await page.goto(`/svar/${bogusToken}?svar=ja`);

    // Assert
    await expect(page.getByRole('heading', { name: /Oops!/i })).toBeVisible();
    await expect(page.getByText(/Ugyldig eller utløpt invitasjonslenke/i)).toBeVisible();
  });
});
