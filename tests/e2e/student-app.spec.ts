import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// The student app runs on preview data here (no NEXT_PUBLIC_CATALOGUE_MODE),
// so these tests never depend on the staging API.

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

test('home shows the dashboard, with the tab bar marking Home', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Good (morning|afternoon|evening), Sarah/,
  );
  await expect(page.getByText('CSC 2100 exam')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your course units' })).toBeVisible();
  const tabs = page.getByRole('navigation', { name: 'App' }).last();
  await expect(tabs.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 412);
  await expectNoSeriousAxeIssues(page);
});

test('a course unit tile opens the course unit with its topics and tabs', async ({ page }) => {
  await page.goto('/home');
  await page
    .getByRole('link', { name: /CSC 2100\s*Data Structures and Algorithms/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/course-units\/csc-2100$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Data Structures and Algorithms' }),
  ).toBeVisible();
  await expect(page.getByText('CSC 2100, 4 credit units')).toBeVisible();

  // The topic being revised is open, with its files.
  await expect(page.getByRole('link', { name: /Lecture 5: Binary search trees/ })).toBeVisible();

  // Tabs switch to past papers.
  await page.getByRole('tab', { name: 'Past papers 6' }).click();
  await expect(page.getByRole('tabpanel').getByText('Supplementary')).toBeVisible();

  const tabs = page.getByRole('navigation', { name: 'App' }).last();
  await expect(tabs.getByRole('link', { name: 'Courses' })).toHaveAttribute('aria-current', 'page');
  await expectNoSeriousAxeIssues(page);
});

test('an unknown course unit says so, inside the app', async ({ page }) => {
  await page.goto('/course-units/not-a-real-unit');
  await expect(
    page.getByRole('heading', { level: 1, name: "We can't find that course unit" }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'See your course units' })).toBeVisible();
});

test('courses can be searched by code without spaces', async ({ page }) => {
  await page.goto('/course-units');
  await page.getByRole('searchbox', { name: 'Search your course units' }).fill('csc2104');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/q=csc2104/);
  await expect(page.getByRole('status')).toHaveText(/1 course unit match/);
  await expect(page.getByRole('link', { name: /Operating Systems/ }).last()).toBeVisible();
  await expectNoSeriousAxeIssues(page);
});

test('desktop shows the sidebar with this semester’s course units', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/home');
  const sidebar = page.getByRole('complementary').first();
  await expect(sidebar.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(sidebar.getByRole('heading', { name: 'This semester' })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: /MTH 2105/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: "This week's plan" })).toBeVisible();

  // Ticking a plan task works with the keyboard.
  const task = page.getByRole('checkbox', { name: /Trees and BSTs/ });
  await task.focus();
  await page.keyboard.press('Space');
  await expect(task).toBeChecked();
  await expectNoSeriousAxeIssues(page);
});
