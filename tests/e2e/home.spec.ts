import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home page loads with no critical accessibility issues', async ({ page }) => {
  // Throttle like a 3G connection in Kampala.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 300,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === 'critical')).toEqual([]);
});

test('landing page has no serious accessibility issues by day or at night', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      colorScheme === 'dark' ? 'night' : 'day',
    );
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  }
});

test('night mode switch is remembered across visits', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Night mode' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.getByRole('button', { name: 'Auto' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-pref', 'auto');
});
