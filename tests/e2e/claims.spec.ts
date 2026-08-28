import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const secret = 'GPSLatitude=58.951234;GPSLongitude=-2.751234';

const downloadText = async (page: import('@playwright/test').Page, button: string) => {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: button }).click();
  const path = await (await pending).path();
  return readFile(path!, 'utf8');
};

const removeAllEvidence = async (page: import('@playwright/test').Page) => {
  const buttons = page.getByRole('button', { name: /^Remove / });
  while (await buttons.count()) await buttons.first().click();
};

const jpegWithComment = () => {
  const text = Buffer.from(secret);
  const length = text.length + 2;
  return Buffer.from([0xff, 0xd8, 0xff, 0xfe, length >> 8, length & 0xff, ...text, 0xff, 0xd9]);
};

const wavWithInfo = () => {
  const header = Buffer.from('524946460000000057415645666d74201000000001000100401f0000803e000002001000', 'hex');
  const payload = Buffer.from(`INFOICMT${String.fromCharCode(secret.length, 0, 0, 0)}${secret}`);
  const list = Buffer.concat([Buffer.from('LIST'), Buffer.alloc(4), payload, payload.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);
  list.writeUInt32LE(list.length - 8, 4);
  const wav = Buffer.concat([header, list]);
  wav.writeUInt32LE(wav.length - 8, 4);
  return wav;
};

const pngWithText = () => {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const payload = Buffer.from(secret);
  const text = Buffer.alloc(12 + payload.length);
  text.writeUInt32BE(payload.length, 0); text.write('tEXt', 4); payload.copy(text, 8);
  const end = Buffer.from([0,0,0,0, 0x49,0x45,0x4e,0x44, 0,0,0,0]);
  return Buffer.concat([signature, text, end]);
};

const webpWithXmp = () => {
  const payload = Buffer.from(secret);
  const padding = payload.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0);
  const chunk = Buffer.concat([Buffer.from('XMP '), Buffer.alloc(4), payload, padding]);
  chunk.writeUInt32LE(payload.length, 4);
  const file = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), chunk]);
  file.writeUInt32LE(file.length - 8, 4);
  return file;
};

const exifJpeg = () => {
  const date = Buffer.from('2026:08:24 06:42:00\0');
  const tiff = Buffer.alloc(44 + date.length);
  tiff.write('II', 0); tiff.writeUInt16LE(42, 2); tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(1, 8); tiff.writeUInt16LE(0x8769, 10); tiff.writeUInt16LE(4, 12); tiff.writeUInt32LE(1, 14); tiff.writeUInt32LE(26, 18); tiff.writeUInt32LE(0, 22);
  tiff.writeUInt16LE(1, 26); tiff.writeUInt16LE(0x9003, 28); tiff.writeUInt16LE(2, 30); tiff.writeUInt32LE(date.length, 32); tiff.writeUInt32LE(44, 36); tiff.writeUInt32LE(0, 40); date.copy(tiff, 44);
  const data = Buffer.concat([Buffer.from('Exif\0\0'), tiff]);
  return Buffer.from([0xff, 0xd8, 0xff, 0xe1, (data.length + 2) >> 8, (data.length + 2) & 0xff, ...data, 0xff, 0xd9]);
};

test('@claim:demo-isolation keeps sample work outside real records and resets it', async ({ page }) => {
  await page.goto('/');
  await page.locator('#card-title').fill('My private real record');
  await page.getByRole('button', { name: 'Save on this device' }).click();
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Demo mode')).toContainText('nothing is saved to your records');
  await expect(page.locator('#card-title')).toHaveValue('Distant wader at Deerness');
  await expect(page.locator('body')).not.toContainText('My private real record');
  await page.locator('#card-title').fill('Changed sample');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#card-title')).toHaveValue('Distant wader at Deerness');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/#builder$/);
  await expect(page.locator('#card-title')).toHaveValue('My private real record');
});

test('@claim:offline-reload reloads the filled demo without a network', async ({ page, context }) => {
  await page.goto('/demo/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#card-title')).toHaveValue('Distant wader at Deerness');
  await expect(page.locator('#connection-label')).toHaveText('Offline now');
});

test('@claim:local-only-network sends no evidence or third-party request', async ({ page }) => {
  const requests: { url: string; method: string }[] = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Save on this device' }).click();
  await downloadText(page, 'Export JSON + media');
  expect(requests.every(request => new URL(request.url).origin === new URL(page.url()).origin)).toBe(true);
  expect(requests.every(request => request.method === 'GET')).toBe(true);
});

test('@claim:safe-default-export redacts location text and attachment metadata', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('#place-label').fill(`Nest at 58°57'04.4"N 2°45'04.4"W`);
  await page.locator('#field-notes').fill('lat=58.951234; lon=-2.751234');
  await removeAllEvidence(page);
  const id3Payload = Buffer.from(secret);
  await page.locator('#evidence-files').setInputFiles([
    { name: `photo-${secret}.jpg`, mimeType: 'image/jpeg', buffer: jpegWithComment() },
    { name: 'notes.png', mimeType: 'image/png', buffer: pngWithText() },
    { name: 'map.webp', mimeType: 'image/webp', buffer: webpWithXmp() },
    { name: 'call.wav', mimeType: 'audio/wav', buffer: wavWithInfo() },
    { name: 'tags.mp3', mimeType: 'audio/mpeg', buffer: Buffer.concat([Buffer.from([0x49,0x44,0x33,3,0,0,0,0,0,id3Payload.length]), id3Payload, Buffer.from([0xff,0xfb,0x90,0x64])]) }
  ]);
  await expect(page.locator('#preview-content')).toContainText('[coordinates withheld]');
  const packet = JSON.parse(await downloadText(page, 'Export JSON + media'));
  expect(JSON.stringify(packet)).not.toContain('58.951234');
  for (const attachment of packet.card.attachments) {
    const decoded = Buffer.from(attachment.data.split(',')[1], 'base64');
    expect(decoded.includes(Buffer.from(secret))).toBe(false);
  }
  await page.locator('#latitude').fill('58.951234');
  await page.locator('#longitude').fill('-2.751234');
  await page.getByLabel(/About 1 km/).check();
  await expect(page.locator('#preview-content')).not.toContainText('58.951234');
  await page.getByLabel(/Exact coordinates/).check();
  await page.getByRole('button', { name: 'Download PDF' }).click();
  await expect(page.locator('#error-summary')).toContainText('Acknowledge the exact-location warning');
});

test('@claim:photo-time-prefill reads EXIF time and allows correction', async ({ page }) => {
  await page.goto('/demo/');
  await removeAllEvidence(page);
  await page.locator('#observed-at').fill('');
  await page.locator('#evidence-files').setInputFiles({ name: 'timed.jpg', mimeType: 'image/jpeg', buffer: exifJpeg() });
  await expect(page.locator('#observed-at')).toHaveValue('2026-08-24T06:42');
  await expect(page.locator('#time-hint')).toContainText('photo metadata');
  await page.locator('#observed-at').fill('2026-08-24T07:15');
  await expect(page.locator('#observed-at')).toHaveValue('2026-08-24T07:15');
});

test('@claim:geolocation-on-click requests location only from its named action', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { geoCalls: number }).geoCalls = 0;
    Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: (_ok: unknown, fail: (error: { code: number; PERMISSION_DENIED: number }) => void) => { (window as unknown as { geoCalls: number }).geoCalls++; fail({ code: 1, PERMISSION_DENIED: 1 }); } } });
  });
  await page.goto('/demo/');
  expect(await page.evaluate(() => (window as unknown as { geoCalls: number }).geoCalls)).toBe(0);
  await page.getByRole('button', { name: /Use my current location/ }).click();
  expect(await page.evaluate(() => (window as unknown as { geoCalls: number }).geoCalls)).toBe(1);
  await expect(page.locator('#geo-status')).toContainText('denied');
});

test('@claim:portable-exports downloads PDF and round-trips the 12 MB JSON boundary', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/demo/');
  const pdf = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const pdfPath = await (await pdf).path();
  expect((await readFile(pdfPath!)).subarray(0, 8).toString()).toBe('%PDF-1.4');
  await removeAllEvidence(page);
  await page.locator('#evidence-files').setInputFiles({ name: 'boundary.mp3', mimeType: 'audio/mpeg', buffer: Buffer.alloc(12_000_000, 7) });
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON + media' }).click();
  const exportedPath = await (await pending).path();
  expect(exportedPath).not.toBeNull();
  expect((await readFile(exportedPath!)).length).toBeLessThan(20_000_000);
  await page.locator('#import-file').setInputFiles(exportedPath!);
  await expect(page.locator('#live-status')).toContainText('imported as a new saved record');
  await expect(page.locator('#evidence-list')).toContainText('boundary.mp3');
  await removeAllEvidence(page);
  await page.locator('#evidence-files').setInputFiles(Array.from({ length: 10 }, (_, index) => ({ name: `evidence-${index}.mp3`, mimeType: 'audio/mpeg', buffer: Buffer.from([index]) })));
  await expect(page.locator('.evidence-item')).toHaveCount(10);
  await page.locator('#evidence-files').setInputFiles({ name: 'eleventh.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from([11]) });
  await expect(page.locator('#file-error')).toContainText('up to 10');
});

test('@claim:no-identification-or-publishing labels the record as unverified and offers no publishing action', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.locator('.sheet-stamp')).toHaveText('UNVERIFIED');
  await expect(page.locator('#preview-content')).toContainText('not an authoritative identification');
  await expect(page.getByRole('button', { name: /identify|publish|eBird/i })).toHaveCount(0);
});

test('@claim:free-no-account requires neither payment nor sign-in in the demo flow', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('Free to use.')).toBeVisible();
  await expect(page.getByRole('link', { name: /sign in|subscribe|buy|pay/i })).toHaveCount(0);
  await expect(page.locator('input[type="password"], [data-payment]')).toHaveCount(0);
});

test('@claim:original-art-provenance matches the shipped illustration to its provenance record', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('Original field illustration created with AI assistance.')).toBeVisible();
  const design = await readFile('.factory/design.md', 'utf8');
  const sidecar = JSON.parse(await readFile('assets/src/hero-field-map.json', 'utf8'));
  expect(design).toContain('Generated with the factory Azure image deployment');
  expect(JSON.stringify(sidecar)).toMatch(/prompt|request/i);
  await expect(page.locator('.hero-plate img')).toHaveAttribute('src', /hero-field-map/);
});
