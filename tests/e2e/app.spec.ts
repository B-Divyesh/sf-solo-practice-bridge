import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function createBridge(page: import('@playwright/test').Page, piece = 'Blue Bossa, bars 9–12'): Promise<void> {
  await page.getByRole('button', { name: 'Build your own plan' }).click();
  await page.getByLabel('Piece or passage').fill(piece);
  await page.getByLabel('What do you want to become easier?').fill('Keep the phrase moving');
  await page.getByLabel('What do you observe getting in the way?').fill('The position shift interrupts the line');
  await page.getByLabel('Your small drill').fill('Loop the shift at 64 bpm with a quiet thumb');
  await page.getByLabel('Success cue').fill('Three connected repeats');
  await page.getByRole('button', { name: 'Save this bridge' }).click();
}

test('builds a bridge, records transfer, and survives an offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Connect a drill to your piece');
  await createBridge(page);
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

test('has no serious or critical accessibility violations on a populated bridge', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/');
  const createButton = page.getByRole('button', { name: 'Build your own plan' });
  await createButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Build one bridge' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Build one bridge' })).toBeHidden();

  await createBridge(page, 'Autumn Leaves, bars 17–24');
  await expect(page.getByRole('heading', { name: 'Autumn Leaves, bars 17–24' })).toBeVisible();
  const connector = page.locator('.bridge-joint');
  await expect(connector).toContainText('Then return to the piece');
  await expect(connector).not.toHaveAttribute('aria-label');

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(browserErrors).toEqual([]);
});

test('serves direct legal, demo, and not-found pages with their own titles', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page).toHaveTitle('Privacy — Solo Practice Bridge');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy, in plain terms');
  await page.goto('/terms/');
  await expect(page).toHaveTitle('Terms — Solo Practice Bridge');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use');
  await page.goto('/demo/');
  await expect(page).toHaveTitle('Demo — Solo Practice Bridge');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sample practice plan');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  const response = await page.goto('/not-a-real-solo-practice-bridge-page');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Solo Practice Bridge');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page was not found');
});

test('moves skip focus to main and gives mobile targets enough space', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to practice workspace' });
  await skip.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const targetSizes = await page.locator('.brand, .footer-links a').evaluateAll((targets) => targets.map((target) => {
    const rect = target.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(targetSizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
  await page.goto('/privacy/');
  const emailSize = await page.getByRole('link', { name: 'privacy@sociobot.in' }).evaluate((target) => {
    const rect = target.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(emailSize.width).toBeGreaterThanOrEqual(44);
  expect(emailSize.height).toBeGreaterThanOrEqual(44);
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
  await createBridge(page, 'Existing bridge');

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
