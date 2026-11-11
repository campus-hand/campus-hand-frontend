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

test('the reader opens a past paper and Magezi explains a question', async ({ page }) => {
  await page.goto('/read/pp1');
  await expect(page.getByRole('heading', { level: 1, name: 'Past paper, Paper 1' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Page 2 of 6' })).toContainText(
    'binary search tree',
  );
  await expectNoSeriousAxeIssues(page);

  await page.getByRole('button', { name: 'Ask Magezi about this page' }).click();
  await page.getByRole('button', { name: 'Explain 2(a)' }).click();
  await expect(page.getByText('From Lecture 5, page 7')).toBeVisible();
  await expect(page.getByText('1 of 3 free questions left today')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Your question for Magezi' })).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 412);
});

test('a file can be added to the shelf', async ({ page }) => {
  await page.goto('/read/pp1');
  await page.getByRole('button', { name: 'Add to shelf' }).click();
  const sheet = page.getByRole('dialog', { name: 'Add to my shelf' });
  await expect(sheet.getByRole('radio', { name: /CSC 2100/ })).toBeChecked();
  await sheet.getByRole('button', { name: 'Add to shelf' }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole('button', { name: 'On your shelf' })).toBeVisible();
});

test('Quiz me runs through a question with feedback', async ({ page }) => {
  await page.goto('/quiz/csc-2100-t4');
  await expect(page.getByText('1 of 5')).toBeVisible();
  await page.getByRole('button', { name: /^B: To the left/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Right, to the left' })).toBeFocused();
  await expectNoSeriousAxeIssues(page);
  await page.getByRole('button', { name: /^A: To the right/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: /Not quite/ })).toBeVisible();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('2 of 5')).toBeVisible();
});

test('Ask answers a campus question from the Home box, inside the app', async ({ page }) => {
  await page.goto('/ask?q=Where%20do%20I%20pay%20for%20a%20retake%3F');
  await expect(page.getByRole('heading', { level: 1, name: 'Ask Magezi' })).toBeVisible();
  await expect(page.getByText(/can’t look up campus offices/)).toBeVisible();
  const tabs = page.getByRole('navigation', { name: 'App' }).last();
  await expect(tabs.getByRole('link', { name: 'Ask' })).toHaveAttribute('aria-current', 'page');
  await expectNoSeriousAxeIssues(page);
});

test('a file or quiz that does not exist says so', async ({ page }) => {
  await page.goto('/read/not-a-file');
  await expect(page.getByRole('heading', { level: 1, name: "We can't find that" })).toBeVisible();
  await page.goto('/quiz/not-a-topic');
  await expect(page.getByRole('heading', { level: 1, name: "We can't find that" })).toBeVisible();
});

test('desktop reader shows page thumbnails and Magezi side by side', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/read/pp1');
  const pages = page.getByRole('navigation', { name: 'Pages' });
  await expect(pages.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await pages.getByRole('button', { name: 'Page 3' }).click();
  await expect(page.getByRole('article', { name: 'Page 3 of 6' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Magezi' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ask Magezi about this page' })).toBeHidden();
  await expectNoSeriousAxeIssues(page);
});
