import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('builds, saves and exports a useful proof card', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bring the evidence/);
  await page.locator('#evidence-files').setInputFiles({ name: 'distant-bird.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) });
  await page.locator('#observed-at').fill('2026-08-28T06:30');
  await page.locator('#place-label').fill('Deerness coast, Orkney');
  await page.getByLabel('Size & shape').check();
  await page.locator('[data-candidate] input[data-key="name"]').fill('Northern fulmar');
  await page.locator('[data-candidate] select[data-key="confidence"]').selectOption('medium');
  await page.locator('#card-title').fill('Distant seabird at Deerness');
  await page.getByRole('button', { name: 'Save on this device' }).click();
  await expect(page.locator('#save-status')).toContainText('Saved locally');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  expect((await download).suggestedFilename()).toBe('distant-seabird-at-deerness.pdf');
  await expect(page.locator('#preview-content')).toContainText('Northern fulmar');
  await page.reload();
  await expect(page.locator('#card-title')).toHaveValue('Distant seabird at Deerness');
});

test('blocks exact coordinates without a second consent', async ({ page }) => {
  await page.goto('/');
  await page.locator('#observed-at').fill('2026-08-28T06:30');
  await page.locator('#place-label').fill('Private marsh');
  await page.locator('#latitude').fill('58.951234');
  await page.locator('#longitude').fill('-2.751234');
  await page.locator('#evidence-files').setInputFiles({ name: 'call.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('audio') });
  await page.locator('[data-candidate] input[data-key="name"]').fill('Unknown bird');
  await page.getByLabel(/Exact coordinates/).check();
  await page.getByRole('button', { name: 'Download PDF' }).click();
  await expect(page.locator('#error-summary')).toContainText('Acknowledge the exact-location warning');
  await page.getByLabel('I understand and choose to include exact coordinates.').check();
  await expect(page.locator('#preview-content')).toContainText('58.951234, -2.751234');
});

test('has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).analyze();
  const serious = results.violations.filter(item => item.impact === 'serious' || item.impact === 'critical');
  expect(serious).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark' });
  const darkResults = await new AxeBuilder({ page: page as never }).analyze();
  expect(darkResults.violations.filter(item => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
});

test('reloads offline after the first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bring the evidence/);
  await expect(page.locator('#connection-label')).toHaveText('Offline now');
});
