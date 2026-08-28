import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { jsonBlob, pdfBlob } from '../src/export';
import { newDraft } from '../src/types';

const proofDraft = () => {
  const draft = newDraft();
  draft.observedAt = '2026-08-28T06:30';
  draft.placeLabel = 'Nest location 58.951234, -2.751234';
  draft.candidates[0].name = 'Unknown bird';
  draft.fieldNotes = 'Seen near 58.951234, -2.751234 after dawn.';
  draft.attachments = [{
    id: 'evidence', name: 'nest-58.951234,-2.751234.jpg', type: 'image/jpeg', size: 16,
    lastModified: 0, blob: new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' })
  }];
  return draft;
};

describe('share-safe exports', () => {
  it('redacts coordinate-looking text in default JSON and PDF exports', async () => {
    const draft = proofDraft();
    const json = await (await jsonBlob(draft)).text();
    const pdf = await (await pdfBlob(draft)).text();

    expect(json).not.toContain('58.951234');
    expect(pdf).not.toContain('58.951234');
    expect(json).toContain('[coordinates withheld]');
    expect(pdf).toContain('[coordinates withheld]');
  });

  it('removes JPEG EXIF bytes before encoding image evidence', async () => {
    const draft = proofDraft();
    // APP1 carries the marker that would normally contain EXIF GPS tags.
    const jpegWithExif = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x0b, ...Buffer.from('Exif\0\0GPS'), 0xff, 0xd9]);
    draft.attachments[0].blob = new Blob([jpegWithExif], { type: 'image/jpeg' });
    draft.attachments[0].size = jpegWithExif.length;

    const packet = JSON.parse(await (await jsonBlob(draft)).text());
    const data = Buffer.from(packet.card.attachments[0].data.split(',')[1], 'base64');
    expect(data.includes(Buffer.from('Exif'))).toBe(false);
    expect(data.includes(Buffer.from('GPS'))).toBe(false);
    expect(packet.card.attachments[0].size).toBe(4);
  });

  it('keeps coordinate prose only after the exact-location acknowledgement', async () => {
    const draft = proofDraft();
    draft.precision = 'exact';
    draft.exactAcknowledged = true;
    draft.latitude = 58.951234;
    draft.longitude = -2.751234;

    expect(await (await jsonBlob(draft)).text()).toContain('58.951234');
  });
});

describe('static response policy', () => {
  it('ships immutable hashed assets and a revalidating service worker policy', async () => {
    const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8'));
    const assetRoute = config.routes.find((route: { route: string }) => route.route === '/assets/*');
    const serviceWorkerRoute = config.routes.find((route: { route: string }) => route.route === '/sw.js');
    expect(assetRoute.headers['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(serviceWorkerRoute.headers['Cache-Control']).toBe('no-cache, must-revalidate');
  });
});
