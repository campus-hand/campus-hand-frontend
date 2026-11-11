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

test('campus lists posts, filters by topic and opens a post', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { level: 1, name: 'Campus' })).toBeVisible();
  const tabs = page.getByRole('navigation', { name: 'App' }).last();
  await expect(tabs.getByRole('link', { name: 'Campus' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 412);
  await expectNoSeriousAxeIssues(page);

  const topics = page.getByRole('navigation', { name: 'Topics' });
  await topics.getByRole('link', { name: 'Hostels' }).click();
  await expect(page).toHaveURL(/\/blog\?topic=hostels$/);
  await expect(topics.getByRole('link', { name: 'Hostels' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.getByRole('link', { name: /Hostels near campus under UGX 400,000/ }).click();
  await expect(page).toHaveURL(/\/blog\/hostels-under-400k$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Hostels near campus under UGX 400,000 a semester',
    }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Read next' })).toBeVisible();
  await expectNoSeriousAxeIssues(page);
});

test('the landing page teasers open the posts', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Lunch under UGX 5,000 near Wandegeya/ }).click();
  await expect(page).toHaveURL(/\/blog\/lunch-under-5000$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /Lunch under UGX 5,000/ }),
  ).toBeVisible();
});

test('desktop shows the featured post and a grid of cards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/blog');
  await expect(page.getByText('Checked against the official fees guide')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Write a post' })).toBeVisible();
  await expectNoSeriousAxeIssues(page);
});

test('an unknown post says so, and Write a post is coming soon', async ({ page }) => {
  await page.goto('/blog/no-such-post');
  await expect(
    page.getByRole('heading', { level: 1, name: "We can't find that post" }),
  ).toBeVisible();
  await page.goto('/blog/write');
  await expect(page.getByRole('heading', { level: 1, name: 'Write a post' })).toBeVisible();
});
