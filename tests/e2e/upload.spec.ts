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

const notes = {
  name: 'avl-rotations.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4 sample'),
};

test('a signed-in student uploads notes, starting from their profile', async ({ page }) => {
  await page.goto('/upload');
  await expect(page.getByRole('heading', { level: 1, name: 'Upload' })).toBeVisible();
  await expect(page.getByLabel('Course (programme)')).toHaveValue(/.+/);
  await expectNoSeriousAxeIssues(page);

  await page.getByLabel(/Choose a file/).setInputFiles(notes);
  await expect(page.getByText(/Uploaded$/)).toBeVisible();
  const unit = page.getByLabel('Course unit');
  await expect(unit.locator('option')).not.toHaveCount(1);
  await unit.selectOption({ index: 1 });
  await page.getByText('Lecture notes', { exact: true }).click();
  await page.getByLabel('Title').fill('AVL rotations, worked examples');
  await page.getByRole('checkbox', { name: /my own notes/ }).check();
  await page.getByRole('button', { name: 'Send for review' }).click();
  await expect(page.getByRole('heading', { name: 'Sent for review' })).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 412);
});

test('an empty form says what needs fixing', async ({ page }) => {
  await page.goto('/upload');
  await expect(page.getByLabel('Course (programme)')).toHaveValue(/.+/);
  await page.getByRole('button', { name: 'Send for review' }).click();
  // (Next's route announcer is also an alert, so match the message itself.)
  await expect(page.getByText(/things need fixing before this can be sent/)).toBeVisible();
  await expect(page.getByText('Choose what it is.')).toBeVisible();
});

test('anyone can add a book to the reading list without an account', async ({ page }) => {
  await page.goto('/upload/guest');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Share notes or past papers' }),
  ).toBeVisible();
  await expect(page.getByText('No account needed.')).toBeVisible();
  await expect(page.getByLabel('Course (programme)')).toBeDisabled();
  await expectNoSeriousAxeIssues(page);

  await page.getByText('Book', { exact: true }).click();
  const details = page.getByRole('region', { name: 'Book details' });
  await details.getByLabel('Title').fill('Data Structures and Algorithms in Java');
  await details.getByLabel('Author(s)').fill('Goodrich and Tamassia');
  await details.getByLabel('Edition and year').fill('6th, 2014');
  await details.getByRole('button', { name: 'University library' }).click();
  await expect(page.getByRole('article', { name: 'Reading list entry' })).toContainText(
    'Goodrich and Tamassia',
  );

  const university = page.getByLabel('University');
  await expect(university.locator('option')).not.toHaveCount(1);
  await university.selectOption({ index: 1 });
  const programme = page.getByLabel('Course (programme)');
  await expect(programme.locator('option')).not.toHaveCount(1);
  await programme.selectOption({ index: 1 });
  await page.getByRole('radio', { name: 'Year 2' }).click();
  await page.getByRole('radio', { name: 'Semester 1' }).click();
  const unit = page.getByLabel('Course unit');
  await expect(unit.locator('option')).not.toHaveCount(1);
  await unit.selectOption({ index: 1 });
  await expectNoSeriousAxeIssuesOnce(page);

  await page.getByRole('button', { name: 'Add to the reading list' }).click();
  await expect(page.getByRole('heading', { name: 'Added to the reading list' })).toBeVisible();
});

test('desktop shows your uploads beside the form', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/upload');
  const mine = page.getByRole('region', { name: 'Your uploads' });
  await expect(mine.getByText('Changes asked')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Sharing a book?' })).toBeVisible();
  await expectNoSeriousAxeIssues(page);
});

/** Checks the page as it is now (no reload), in the current theme. */
async function expectNoSeriousAxeIssuesOnce(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
}
