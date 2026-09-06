import { expect, test, type Download, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function openDemo(page: Page): Promise<void> {
  await page.goto('/demo/');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Autumn Leaves, bars 17–24' })).toBeVisible();
}

async function recordDemoTransfer(page: Page, note: string): Promise<void> {
  await page.getByRole('button', { name: /Start 7 min loop/ }).click();
  await page.getByRole('button', { name: 'Move to piece' }).click();
  await page.getByRole('button', { name: 'Finish and reflect' }).click();
  await page.getByLabel('Your observation').fill(note);
  await page.getByRole('dialog', { name: 'Practice loop' }).getByText('Almost', { exact: true }).click();
  await page.getByRole('button', { name: 'Record transfer note' }).click();
  await expect(page.getByText(note)).toBeVisible();
}

async function downloadedText(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('The browser did not save the export.');
  return readFile(path, 'utf8');
}

test('@claim:practice-loop maps an obstacle through a timed drill and records a transfer note', async ({ page }) => {
  await openDemo(page);
  await recordDemoTransfer(page, 'Claim check: the shift stayed loose through the pickup.');
  await expect(page.getByRole('heading', { name: 'What transferred' })).toBeVisible();
});

test('@claim:demo-isolation resets sample work and opens an empty real workbook', async ({ page }) => {
  await openDemo(page);
  const note = 'Claim check: reset removes this sample-only note.';
  await recordDemoTransfer(page, note);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText(note)).toHaveCount(0);
  await expect(page.getByText('The shift stayed smooth twice at 64 bpm. It tightened again when I rushed the pickup.')).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'No bridge on the bench yet.' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
});

test('@claim:spaced-revisits exports four spaced revisit dates', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const backup = JSON.parse(await downloadedText(await downloadPromise)) as { plans: Array<{ revisitDates: string[] }> };
  const plan = backup.plans.at(0);
  if (!plan) throw new Error('The sample backup did not include a practice plan.');
  const dates = plan.revisitDates.map((date) => new Date(`${date}T12:00:00Z`).getTime());
  expect(dates).toHaveLength(4);
  expect(dates.slice(1).map((date, index) => (date - (dates[index] ?? 0)) / 86_400_000)).toEqual([2, 4, 7]);
});

test('@claim:local-persistence keeps a demo transfer after reload', async ({ page }) => {
  await openDemo(page);
  const note = 'Claim check: this transfer remains after reload.';
  await recordDemoTransfer(page, note);
  await page.reload();
  await expect(page.getByText(note)).toBeVisible();
});

test('@claim:print-history keeps the practice plan and history in print media', async ({ page }) => {
  await openDemo(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByText('Autumn Leaves, bars 17–24').first()).toBeVisible();
  await expect(page.getByText('The shift stayed smooth twice at 64 bpm. It tightened again when I rushed the pickup.')).toBeVisible();
  await expect(page.locator('.site-header')).toHaveCSS('display', 'none');
});

test('@claim:json-backup restores a downloaded workbook snapshot', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const backupText = await downloadedText(await downloadPromise);
  const temporary = 'Claim check: this note should disappear after import.';
  await recordDemoTransfer(page, temporary);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Import backup').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(backupText) });
  await expect(page.getByText(temporary)).toHaveCount(0);
  await expect(page.getByText('The shift stayed smooth twice at 64 bpm. It tightened again when I rushed the pickup.')).toBeVisible();
});

test('@claim:csv-history exports a header and one row for a recorded transfer', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const rows = (await downloadedText(await downloadPromise)).trim().split('\n');
  expect(rows[0]).toBe('piece,goal,obstacle,drill,success cue,completed at,cue met,transfer note');
  expect(rows).toHaveLength(2);
  expect(rows[1]).toContain('Autumn Leaves');
});

test('@claim:pwa-install exposes an installable manifest and active service worker', async ({ page }) => {
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const manifest = await page.evaluate(async () => {
    const response = await fetch('/manifest.json');
    return response.json() as Promise<{ display: string; start_url: string; icons: Array<{ sizes: string }> }>;
  });
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/?v=1');
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
});

test('@claim:offline-reload reloads the populated demo after the first visit', async ({ page, context }) => {
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Autumn Leaves, bars 17–24' })).toBeVisible();
  await expect(page.getByText(/Offline · changes stay here/)).toBeVisible();
});

test('@claim:update-notice shows an update notice when a new worker is ready', async ({ page }) => {
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.goto('/demo/?test-update=1');
  await expect(page.getByText('An update is ready.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Update now' })).toBeVisible();
});

test('@claim:local-privacy keeps normal demo requests on the product origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await recordDemoTransfer(page, 'Claim check: normal demo traffic remains local.');
  const origin = new URL(page.url()).origin;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
});

test('@claim:free-core keeps one active bridge and leaves print and exports available', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Build another bridge' }).click();
  await expect(page.getByRole('dialog', { name: 'Studio unlock' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Print history' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export backup' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
});

test('@claim:studio-availability names the billing dependency and never sends visitors to a broken checkout', async ({ page }) => {
  await openDemo(page);
  await expect(page.getByText('Studio checkout is unavailable while billing registration is completed.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy Studio/i })).toHaveCount(0);
});

test('@claim:license-restore accepts a valid billing verification response on another device', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/solo-practice-bridge/verify?license=valid-demo-license', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await openDemo(page);
  await page.getByLabel('Have an eligible license?').fill('valid-demo-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Studio unlocked')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unlimited active bridges' })).toBeVisible();
});

test('@claim:scope-limits never asks for microphone input during a normal demo loop', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__microphoneRequests', { value: 0, writable: true });
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) return;
    const original = mediaDevices.getUserMedia.bind(mediaDevices);
    mediaDevices.getUserMedia = ((constraints: MediaStreamConstraints) => {
      (window as unknown as Window & { __microphoneRequests: number }).__microphoneRequests += 1;
      return original(constraints);
    }) as typeof mediaDevices.getUserMedia;
  });
  await openDemo(page);
  await recordDemoTransfer(page, 'Claim check: this workbook only records my written observation.');
  expect(await page.evaluate(() => (window as unknown as Window & { __microphoneRequests: number }).__microphoneRequests)).toBe(0);
});
