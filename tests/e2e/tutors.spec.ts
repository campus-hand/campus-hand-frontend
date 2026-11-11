import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

async function expectNoSeriousAxeIssues(page: Page) {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.reload(); // the boot script reads the colour scheme on load
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      colorScheme === 'dark' ? 'night' : 'day',
    );
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  }
}

test('tutors are listed for a course unit and can be filtered', async ({ page }) => {
  await page.goto('/tutors?unit=csc-2100');
  await expect(page.getByRole('heading', { level: 1, name: 'Tutors' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('3 tutors for Data Structures and Algorithms');
  await expectNoSeriousAxeIssues(page);

  await page.getByRole('button', { name: 'Lecturers' }).click();
  await expect(page.getByRole('status')).toHaveText('1 tutor for Data Structures and Algorithms');
  await expect(page.getByRole('heading', { level: 2, name: 'Dr. Atim Grace' })).toBeVisible();
  const tabs = page.getByRole('navigation', { name: 'App' }).last();
  await expect(tabs.getByRole('link', { name: 'Tutors' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 412);
});

test('a session is requested from the tutor’s profile on a phone', async ({ page }) => {
  await page.goto('/tutors?unit=csc-2100');
  await page.getByRole('link', { name: 'Request a session with Brian Okello' }).click();
  await expect(page).toHaveURL(/\/tutors\/brian-okello$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Brian Okello' })).toBeVisible();
  const booking = page.getByRole('region', { name: 'Request a session with Brian Okello' });
  await expect(booking.getByText(/You pay Brian directly/)).toBeVisible();
  await expectNoSeriousAxeIssues(page);

  const send = page.getByRole('button', { name: 'Send request' });
  await expect(send).toBeDisabled();
  await page
    .locator('button[role="radio"]:not([disabled])')
    .filter({ hasText: /(am|pm)$/ })
    .first()
    .click();
  await send.click();
  await expect(page.getByRole('heading', { name: 'Request sent' })).toBeVisible();
});

test('desktop shows the request panel beside the list', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/tutors?unit=csc-2100');
  const panel = page.getByRole('complementary', { name: 'Request Brian' });
  await expect(panel).toBeVisible();
  await page.getByRole('button', { name: 'Request a session with Kato Joseph' }).click();
  await expect(page.getByRole('complementary', { name: 'Request Kato' })).toBeVisible();
  await expectNoSeriousAxeIssues(page);
});

test('an unknown tutor says so', async ({ page }) => {
  await page.goto('/tutors/nobody-here');
  await expect(page.getByRole('heading', { level: 1, name: "We can't find that" })).toBeVisible();
});
