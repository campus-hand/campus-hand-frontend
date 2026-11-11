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
  // Switching back to match the (day) device setting follows the system again.
  await expect(page.getByRole('button', { name: 'Auto' })).toHaveCount(0);
  const nightSwitch = page.getByRole('switch', { name: 'Night mode' });
  await expect(nightSwitch).toBeChecked(); // wait until the saved choice is shown after hydration
  await nightSwitch.uncheck();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  await expect(page.locator('html')).toHaveAttribute('data-theme-pref', 'auto');
});

test('phone header keeps the logo and menu button on one row', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header').first();
  const logo = header.getByRole('link', { name: 'Campus Hand home' });
  const menuButton = header.getByRole('button', { name: 'Open menu' });
  await expect(menuButton).toBeVisible();
  await expect(header.getByRole('link', { name: 'Log in' })).toBeHidden();

  const logoBox = await logo.boundingBox();
  const menuBox = await menuButton.boundingBox();
  const middle = (box: { y: number; height: number } | null) => (box ? box.y + box.height / 2 : 0);
  expect(Math.abs(middle(logoBox) - middle(menuBox))).toBeLessThanOrEqual(6);

  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await menuButton.click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer.getByRole('link', { name: 'Sign up free' })).toBeVisible();
    // Let the slide-in and link fade finish, so axe sees the final colours.
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const { violations } = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  }
});

test('desktop header keeps Log in and Sign up free beside the logo', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const header = page.locator('header').first();
  await expect(header.getByRole('button', { name: 'Open menu' })).toBeHidden();
  const logoBox = await header.getByRole('link', { name: 'Campus Hand home' }).boundingBox();
  for (const name of ['Log in', 'Sign up free']) {
    const box = await header.getByRole('link', { name }).boundingBox();
    expect(
      Math.abs(logoBox!.y + logoBox!.height / 2 - (box!.y + box!.height / 2)),
    ).toBeLessThanOrEqual(6);
  }
});

test('header stays on screen while scrolling and section links land below it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const header = page.locator('header').first();
  await header.getByRole('link', { name: 'Magezi' }).click();
  await expect(page).toHaveURL(/#magezi$/);
  await expect(header).toHaveAttribute('data-scrolled', '');
  await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
  const headerBottom = await header.evaluate((el) => el.getBoundingClientRect().bottom);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('magezi')!.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(headerBottom);

  // Let the smooth scroll to #magezi settle, then the logo takes you back to the top.
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const start = window.scrollY;
        setTimeout(() => resolve(window.scrollY === start), 250);
      }),
  );
  await header.getByRole('link', { name: 'Campus Hand home' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page).toHaveURL(/\/$/);
});

test('logo returns to the landing page from other pages', async ({ page }) => {
  // An unbuilt page: the "Coming soon" screen carries the logo.
  await page.goto('/help');
  await page.getByRole('link', { name: 'Campus Hand home' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Find the past paper. Understand the answer.' }),
  ).toBeVisible();
});
