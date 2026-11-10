import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// These run against the preview sign-in (no API yet): code 123456 works, see PreviewAuthClient.

/**
 * A labelled input on the current screen. With Cache Components, Next keeps the
 * previous route mounted but hidden (React <Activity>), so the same label can
 * exist twice in the DOM after moving between auth screens.
 */
function visible(page: Page, label: string, options?: { exact?: boolean }) {
  return page.getByLabel(label, options).filter({ visible: true });
}

const seeded = {
  verify: {
    name: 'Nakato Sarah',
    email: 'nakato.sarah@gmail.com',
    phone: '+256772123456',
    channel: 'email',
  },
  device: {
    identifier: { kind: 'email', value: 'nakato.sarah@gmail.com' },
    maskedEmail: 'n•••••@gmail.com',
    device: {
      name: 'Tecno Spark 20, Chrome',
      lastActiveAt: '2026-11-10T08:00:00Z',
      place: 'Kampala',
    },
  },
  reset: { identifier: { kind: 'email', value: 'nakato.sarah@gmail.com' } },
};

const pages: Array<[string, string, object?]> = [
  ['Create your account', '/signup'],
  ['Check your email', '/signup/verify', seeded.verify],
  ['Welcome back', '/login'],
  ["You're signed in", '/login/other-device', seeded.device],
  ['Forgot your password?', '/forgot-password'],
  ['Set a new password', '/forgot-password/reset', seeded.reset],
];

async function seed(page: Page, flow?: object) {
  if (!flow) return;
  await page.addInitScript(
    (state) =>
      sessionStorage.setItem('ch-auth-flow', JSON.stringify({ ...state, codeSentAt: Date.now() })),
    flow,
  );
}

for (const [heading, path, flow] of pages) {
  test(`${path} has no serious accessibility issues by day or at night, and no sideways scroll`, async ({
    page,
  }) => {
    await seed(page, flow);
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        colorScheme === 'dark' ? 'night' : 'day',
      );
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual(
        [],
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    }
  });
}

test('sign up, confirm the code and land back on the page that asked', async ({ page }) => {
  await page.goto('/signup?returnTo=%2Fpast-papers');
  await visible(page, 'Full name').fill('Nakato Sarah');
  await visible(page, 'Email').fill('nakato.sarah@gmail.com');
  await visible(page, 'Password', { exact: true }).fill('mango tea at 4pm');
  await expect(page.getByText('Strong. Nice one.')).toBeVisible();
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/signup\/verify\?returnTo=%2Fpast-papers$/);
  await expect(page.getByText('nakato.sarah@gmail.com')).toBeVisible();
  // A refresh keeps the step working (state is in sessionStorage, not the URL).
  await page.reload();
  await expect(page.getByText('nakato.sarah@gmail.com')).toBeVisible();

  await visible(page, 'Code').fill('111111');
  await page.getByRole('button', { name: 'Confirm and continue' }).click();
  await expect(page.getByText(/That code isn't right/)).toBeVisible();
  await visible(page, 'Code').fill('123456');
  await page.getByRole('button', { name: 'Confirm and continue' }).click();
  await expect(page).toHaveURL(/\/past-papers$/);
});

test('log in while another device is signed in, then cancel back to log in', async ({ page }) => {
  await page.goto('/login');
  await visible(page, 'Email or phone').fill('busy@gmail.com');
  await visible(page, 'Password', { exact: true }).fill('mango tea at 4pm');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/login\/other-device$/);
  await expect(page.getByText('Tecno Spark 20, Chrome')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel, stay signed out here' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('forgot password: send a code, set a new password', async ({ page }) => {
  await page.goto('/login');
  await visible(page, 'Email or phone').fill('0772 123 456');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(visible(page, 'Email or phone')).toHaveValue('+256 772 123 456');
  await page.getByRole('button', { name: 'Send reset code' }).click();
  await expect(page).toHaveURL(/\/forgot-password\/reset$/);
  await expect(page.getByText('+256 7•• ••• 456')).toBeVisible();
  await visible(page, 'Code').fill('123456');
  await visible(page, 'New password').fill('mango tea at 4pm');
  await page.getByRole('button', { name: 'Save and log in' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('the Day/Night button switches the theme and is remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Switch to Night mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Switch to Day mode' })).toBeVisible();
});

test('desktop shows the brand panel beside the form', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');
  await expect(page.getByRole('complementary', { name: 'About Campus Hand' })).toBeVisible();
  await expect(page.getByText('Pass every')).toBeVisible();
});
