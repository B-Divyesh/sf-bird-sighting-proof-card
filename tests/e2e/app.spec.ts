import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('builds, saves and exports a useful bird record', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Make a private bird-sighting record/);
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

test('redacts coordinate text from default browser exports and the share-safe preview', async ({ page }) => {
  await page.goto('/');
  await page.locator('#evidence-files').setInputFiles({ name: 'nest-58.951234,-2.751234.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) });
  await page.locator('#observed-at').fill('2026-08-28T06:30');
  await page.locator('#place-label').fill('Nest location 58.951234, -2.751234');
  await page.locator('[data-candidate] input[data-key="name"]').fill('Unknown bird');
  await expect(page.locator('#preview-content')).toContainText('[coordinates withheld]');
  await expect(page.locator('#preview-content')).not.toContainText('58.951234');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON + media' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const json = await readFile(downloadPath!, 'utf8');
  expect(json).toContain('[coordinates withheld]');
  expect(json).not.toContain('58.951234');
});

test('rejects impossible exact coordinates before export', async ({ page }) => {
  await page.goto('/');
  await page.locator('#evidence-files').setInputFiles({ name: 'call.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('audio') });
  await page.locator('#observed-at').fill('2026-08-28T06:30');
  await page.locator('#place-label').fill('Private marsh');
  await page.locator('#latitude').fill('91');
  await page.locator('#longitude').fill('181');
  await page.locator('[data-candidate] input[data-key="name"]').fill('Unknown bird');
  await page.getByLabel(/Exact coordinates/).check();
  await page.getByLabel('I understand and choose to include exact coordinates.').check();
  await page.getByRole('button', { name: 'Download PDF' }).click();
  await expect(page.locator('#error-summary')).toContainText('Latitude must be a number from −90 to 90.');
  await expect(page.locator('#error-summary')).toContainText('Longitude must be a number from −180 to 180.');
  await expect(page.locator('#error-summary')).toContainText('Enter a valid latitude and longitude to export exact coordinates.');
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

test('keeps keyboard focus visible and the phone layout within its viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.locator('.skip-link').focus();
  await expect(page.locator('.skip-link')).toBeFocused();
  const primary = page.getByRole('link', { name: /Try it with sample data/ });
  await primary.focus();
  await expect(primary).toHaveCSS('outline-width', '3px');
  await page.locator('#evidence-files').focus();
  await expect(page.locator('label[for="evidence-files"]')).toHaveCSS('outline-width', '3px');
  await page.locator('#import-file').focus();
  await expect(page.locator('label[for="import-file"]')).toHaveCSS('outline-width', '3px');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(primary).toHaveCSS('transition-duration', '0s');
  if (testInfo.project.name === 'chromium-mobile') {
    const viewport = await page.evaluate(() => window.innerWidth);
    expect(viewport).toBe(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport);
    await expect(primary).toHaveCSS('min-height', '46px');
    for (const link of await page.locator('.brand, footer nav a').all()) {
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('reloads offline after the first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Make a private bird-sighting record/);
  await expect(page.locator('#connection-label')).toHaveText('Offline now');
});

test('serves distinct routes with complete metadata and working history', async ({ page }) => {
  const routes = [
    ['/', 'Bird Sighting Proof Card — make a private bird record', '/'],
    ['/demo/', 'Demo — Bird Sighting Proof Card', '/demo/'],
    ['/privacy/', 'Privacy — Bird Sighting Proof Card', '/privacy/'],
    ['/terms/', 'Terms — Bird Sighting Proof Card', '/terms/']
  ];
  for (const [route, title, canonical] of routes) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://bird-sighting-proof-card.sociobot.in${canonical}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.jpg$/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('h1')).toHaveCount(1);
  }
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Bird Sighting Proof Card');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This trail ends off the map');
  await expect(page.getByRole('link', { name: 'Return to the builder' })).toHaveAttribute('href', '/#builder');
});

test('moves focus and announces every document route', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('[data-route-status]')).toContainText('Privacy — Bird Sighting Proof Card');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('#live-status')).toContainText('Bird Sighting Proof Card');
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('[data-route-status]')).toContainText('Page not found — Bird Sighting Proof Card');
});

test('gives 404 and offline their complete route metadata and shared shell', async ({ page }) => {
  for (const [route, title, canonical] of [
    ['/404.html', 'Page not found — Bird Sighting Proof Card', '/404.html'],
    ['/offline.html', 'Offline — Bird Sighting Proof Card', '/offline.html']
  ]) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://bird-sighting-proof-card.sociobot.in${canonical}`);
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.jpg$/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /social-card\.jpg$/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('header .brand, header.site-head .brand')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Footer' })).toHaveCount(1);
  }
});

test('has no serious accessibility violations on every route', async ({ page }) => {
  for (const route of ['/', '/demo/', '/privacy/', '/terms/', '/404.html', '/offline.html']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter(item => item.impact === 'serious' || item.impact === 'critical'), route).toEqual([]);
  }
});
