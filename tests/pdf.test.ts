import { describe, expect, it } from 'vitest';
import { pdfBlob } from '../src/export';
import { newDraft } from '../src/types';

describe('PDF export', () => {
  it('creates a valid PDF document with a withheld default location', async () => {
    const draft = newDraft();
    draft.title = 'Marsh bird'; draft.observedAt = '2026-08-28T06:30'; draft.placeLabel = 'North coast';
    draft.latitude = 58.95123; draft.longitude = -2.75123;
    const blob = pdfBlob(draft);
    expect(blob.type).toBe('application/pdf');
    const content = await blob.text();
    expect(content.startsWith('%PDF-1.4')).toBe(true);
    expect(content).toContain('Coordinates withheld');
    expect(content).not.toContain('58.95123');
  });
});
