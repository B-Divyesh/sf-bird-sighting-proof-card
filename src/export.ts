import type { SightingDraft } from './types';
import { localDateTime, precisionLabels, sharedCoordinates } from './privacy';

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

export async function jsonBlob(draft: SightingDraft) {
  const location = sharedCoordinates(draft);
  const attachments = await Promise.all(draft.attachments.map(async file => ({
    name: file.name, type: file.type, size: file.size, capturedAt: file.capturedAt,
    data: await blobToDataUrl(file.blob)
  })));
  return new Blob([JSON.stringify({
    format: 'bird-sighting-proof-card', version: 1, exportedAt: new Date().toISOString(),
    card: {
      title: draft.title || 'Uncertain bird sighting', observedAt: draft.observedAt,
      timeSource: draft.timeSource, placeLabel: draft.placeLabel,
      location, locationPrecision: precisionLabels[draft.precision], sensitive: draft.sensitive,
      fieldMarks: draft.fieldMarks, fieldNotes: draft.fieldNotes,
      candidates: draft.candidates.filter(c => c.name.trim()).map(({ name, confidence, notes }) => ({ name, confidence, notes })),
      notice: 'Evidence packet for review; not an authoritative identification.', attachments
    }
  }, null, 2)], { type: 'application/json' });
}

const pdfEscape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '?');
const wrap = (text: string, width = 78) => {
  const words = text.replace(/\s+/g, ' ').trim().split(' '); const lines: string[] = []; let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > width) { if (line) lines.push(line); line = word; } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line); return lines;
};

export function pdfBlob(draft: SightingDraft) {
  const shared = sharedCoordinates(draft);
  const candidates = draft.candidates.filter(c => c.name.trim());
  const rows = [
    draft.title || 'Uncertain bird sighting',
    `Observed: ${localDateTime(draft.observedAt)} (${draft.timeSource})`,
    `Place: ${draft.placeLabel}`,
    `Shared location: ${shared ? `${shared.latitude}, ${shared.longitude}` : 'Coordinates withheld'} — ${precisionLabels[draft.precision]}`,
    `Sensitive location: ${draft.sensitive ? 'Yes — share with care' : 'Not marked sensitive'}`,
    '', 'FIELD MARKS', draft.fieldMarks.length ? draft.fieldMarks.join(', ') : 'None recorded',
    draft.fieldNotes || 'No additional field notes.', '', 'CANDIDATES',
    ...candidates.map(c => `${c.name} — ${c.confidence} confidence${c.notes ? ` — ${c.notes}` : ''}`),
    '', 'EVIDENCE FILES', ...draft.attachments.map(f => `${f.name} (${f.type || 'file'}, ${Math.ceil(f.size / 1000)} KB)`),
    '', 'This proof card packages observation evidence for review. It is not an authoritative identification.'
  ].flatMap(row => row ? wrap(row) : ['']);
  const pages: string[][] = [];
  for (let i = 0; i < rows.length; i += 42) pages.push(rows.slice(i, i + 42));
  const objects: string[] = [];
  const add = (body: string) => { objects.push(body); return objects.length; };
  const fontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds: number[] = []; const contentIds: number[] = [];
  pages.forEach(lines => {
    const content = ['BT', '/F1 11 Tf', '50 790 Td', '15 TL', ...lines.map((line, index) => `${index ? 'T* ' : ''}(${pdfEscape(line)}) Tj`), 'ET'].join('\n');
    contentIds.push(add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    pageIds.push(add('PAGE_PLACEHOLDER'));
  });
  const pagesId = objects.length + 1;
  pageIds.forEach((id, i) => { objects[id - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`; });
  add(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n ').join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export async function importedDraft(file: File): Promise<SightingDraft> {
  const parsed = JSON.parse(await file.text());
  if (parsed?.format !== 'bird-sighting-proof-card' || parsed?.version !== 1 || !parsed.card) throw new Error('This is not a Proof Card v1 JSON export.');
  const card = parsed.card;
  const attachments = await Promise.all((card.attachments || []).map(async (item: {name:string;type:string;data:string;capturedAt?:string}) => {
    const response = await fetch(item.data); const blob = await response.blob();
    return { id: crypto.randomUUID(), name: item.name, type: item.type, size: blob.size, lastModified: Date.now(), capturedAt: item.capturedAt, blob };
  }));
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(), title: card.title || '', observedAt: card.observedAt || '', timeSource: card.timeSource || 'entered',
    placeLabel: card.placeLabel || '', latitude: card.location?.latitude ?? null, longitude: card.location?.longitude ?? null,
    precision: card.location ? precisionFromLabel(card.locationPrecision) : 'region', exactAcknowledged: false,
    sensitive: Boolean(card.sensitive), fieldMarks: Array.isArray(card.fieldMarks) ? card.fieldMarks : [], fieldNotes: card.fieldNotes || '',
    candidates: (card.candidates || []).map((candidate: {name:string;confidence:string;notes:string}) => ({ id: crypto.randomUUID(), name: candidate.name, confidence: ['low','medium','high'].includes(candidate.confidence) ? candidate.confidence : 'low', notes: candidate.notes || '' })),
    attachments, createdAt: now, updatedAt: now
  } as SightingDraft;
}

const precisionFromLabel = (label: string) => (Object.entries(precisionLabels).find(([, value]) => value === label)?.[0] || 'region') as SightingDraft['precision'];
