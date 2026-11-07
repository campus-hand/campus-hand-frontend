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
