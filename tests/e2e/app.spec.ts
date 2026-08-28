import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('builds a bridge, records transfer, and survives an offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Make the drill meet the music.');
  await page.getByRole('button', { name: 'Build a practice bridge' }).first().click();
  await page.getByLabel('Piece or passage').fill('Blue Bossa, bars 9–12');
  await page.getByLabel('What do you want to become easier?').fill('Keep the phrase moving');
  await page.getByLabel('What do you observe getting in the way?').fill('The position shift interrupts the line');
  await page.getByLabel('Your small drill').fill('Loop the shift at 64 bpm with a quiet thumb');
  await page.getByLabel('Success cue').fill('Three connected repeats');
  await page.getByRole('button', { name: 'Save this bridge' }).click();

  await expect(page.getByRole('heading', { name: 'Blue Bossa, bars 9–12' })).toBeVisible();
  await page.getByRole('button', { name: /Start 7 min loop/ }).click();
  await page.getByRole('button', { name: 'Move to piece' }).click();
  await page.getByRole('button', { name: 'Finish and reflect' }).click();
  await page.getByLabel('Your observation').fill('The shift stayed connected twice at the original tempo.');
  await page.getByText('Almost', { exact: true }).click();
  await page.getByRole('button', { name: 'Record transfer note' }).click();
  await expect(page.getByText('The shift stayed connected twice at the original tempo.')).toBeVisible();

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Blue Bossa, bars 9–12').first()).toBeVisible();
  await expect(page.getByText(/Offline · changes stay here/)).toBeVisible();
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  const createButton = page.getByRole('button', { name: 'Build a practice bridge' }).first();
  await createButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Build one bridge' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Build one bridge' })).toBeHidden();

  await createButton.click();
  await page.getByLabel('Piece or passage').fill('Autumn Leaves, bars 17–24');
  await page.getByLabel('What do you want to become easier?').fill('Keep the phrase connected');
  await page.getByLabel('What do you observe getting in the way?').fill('The position shift interrupts the line');
  await page.getByLabel('Your small drill').fill('Loop the shift at 64 bpm with a quiet thumb');
  await page.getByLabel('Success cue').fill('Three relaxed repeats');
  await page.getByRole('button', { name: 'Save this bridge' }).click();
  await expect(page.getByRole('heading', { name: 'Autumn Leaves, bars 17–24' })).toBeVisible();
  const connector = page.locator('.bridge-joint');
  await expect(connector).toContainText('Then return to the piece');
  await expect(connector).not.toHaveAttribute('aria-label');

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(browserErrors).toEqual([]);
});

test('legal pages are directly addressable', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page).toHaveTitle(/Privacy/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy, in plain terms.');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use.');
});

test('rejects a malformed backup before replacement and keeps the workbook usable after reload', async ({ page }) => {
  const pageErrors: string[] = [];
  let replacementConfirmationShown = false;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('dialog', async (dialog) => {
    replacementConfirmationShown = true;
    await dialog.accept();
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Build a practice bridge' }).first().click();
  await page.getByLabel('Piece or passage').fill('Existing bridge');
  await page.getByLabel('What do you want to become easier?').fill('Keep the line even');
  await page.getByLabel('What do you observe getting in the way?').fill('The shift catches');
  await page.getByLabel('Your small drill').fill('Loop two notes slowly');
  await page.getByLabel('Success cue').fill('Three loose repeats');
  await page.getByRole('button', { name: 'Save this bridge' }).click();

  await page.getByLabel('Import backup').setInputFiles({
    name: 'malformed-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      version: 1,
      exportedAt: '2026-08-28T00:00:00.000Z',
      plans: [{ id: 'malformed-plan', piece: 'Broken Import', drill: 'one note' }],
      sessions: []
    }))
  });

  await expect(page.getByText('Import did not work.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Existing bridge' })).toBeVisible();
  expect(replacementConfirmationShown).toBe(false);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Existing bridge' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
