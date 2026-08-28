import type { SightingDraft } from './types';
import { metadataSafeBlob } from './media';
import { localDateTime, precisionLabels, shareSafeText, sharedCoordinates } from './privacy';
import { attachmentBudgetIssue, MAX_IMPORT_BYTES } from './limits';

const blobToDataUrl = async (blob: Blob) => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
};

const dataUrlToBlob = (data: string) => {
  const match = /^data:([^;,]*)(;base64)?,([\s\S]*)$/.exec(data);
  if (!match) throw new Error('Imported evidence must be embedded in the JSON file.');
  const type = match[1] || 'application/octet-stream';
  try {
    if (match[2]) {
      const binary = atob(match[3]);
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      return new Blob([bytes], { type });
    }
    return new Blob([decodeURIComponent(match[3])], { type });
  } catch {
    throw new Error('An embedded evidence file is not valid base64 data.');
  }
};

export async function jsonBlob(draft: SightingDraft) {
  const budgetIssue = attachmentBudgetIssue(draft.attachments.map(file => file.size));
  if (budgetIssue) throw new Error(budgetIssue);
  const location = sharedCoordinates(draft);
  const attachments = await Promise.all(draft.attachments.map(async file => {
    const safeBlob = await metadataSafeBlob(file.blob);
    return {
      name: shareSafeText(draft, file.name), type: file.type, size: safeBlob.size, capturedAt: file.capturedAt,
      data: await blobToDataUrl(safeBlob)
    };
  }));
  return new Blob([JSON.stringify({
    format: 'bird-sighting-proof-card', version: 1, exportedAt: new Date().toISOString(),
    card: {
      title: shareSafeText(draft, draft.title || 'Uncertain bird sighting'), observedAt: draft.observedAt,
      timeSource: draft.timeSource, placeLabel: shareSafeText(draft, draft.placeLabel),
      location, locationPrecision: precisionLabels[draft.precision], sensitive: draft.sensitive,
      fieldMarks: draft.fieldMarks.map(mark => shareSafeText(draft, mark)), fieldNotes: shareSafeText(draft, draft.fieldNotes),
      candidates: draft.candidates.filter(c => c.name.trim()).map(({ name, confidence, notes }) => ({ name: shareSafeText(draft, name), confidence, notes: shareSafeText(draft, notes) })),
      notice: 'Bird-sighting record for review; not an authoritative identification.', attachments
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
    shareSafeText(draft, draft.title || 'Uncertain bird sighting'),
    `Observed: ${localDateTime(draft.observedAt)} (${draft.timeSource})`,
    `Place: ${shareSafeText(draft, draft.placeLabel)}`,
    `Shared location: ${shared ? `${shared.latitude}, ${shared.longitude}` : 'Coordinates withheld'} — ${precisionLabels[draft.precision]}`,
    `Sensitive location: ${draft.sensitive ? 'Yes — share with care' : 'Not marked sensitive'}`,
    '', 'FIELD MARKS', draft.fieldMarks.length ? draft.fieldMarks.map(mark => shareSafeText(draft, mark)).join(', ') : 'None recorded',
    shareSafeText(draft, draft.fieldNotes || 'No additional field notes.'), '', 'CANDIDATES',
    ...candidates.map(c => `${shareSafeText(draft, c.name)} — ${c.confidence} confidence${c.notes ? ` — ${shareSafeText(draft, c.notes)}` : ''}`),
    '', 'EVIDENCE FILES', ...draft.attachments.map(f => `${shareSafeText(draft, f.name)} (${f.type || 'file'}, ${Math.ceil(f.size / 1000)} KB)`),
    '', 'This bird-sighting record supports review. It is not an authoritative identification.'
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
  if (file.size > MAX_IMPORT_BYTES) throw new Error('That import is over the 20 MB safety limit.');
  const parsed = JSON.parse(await file.text());
  if (parsed?.format !== 'bird-sighting-proof-card' || parsed?.version !== 1 || !parsed.card) throw new Error('This is not a Proof Card v1 JSON export.');
  const card = parsed.card;
  const attachments = await Promise.all((card.attachments || []).map(async (item: {name:string;type:string;data:string;capturedAt?:string}) => {
    if (typeof item.data !== 'string' || !item.data.startsWith('data:')) throw new Error('Imported evidence must be embedded in the JSON file.');
    const blob = dataUrlToBlob(item.data);
    return { id: crypto.randomUUID(), name: item.name, type: item.type, size: blob.size, lastModified: Date.now(), capturedAt: item.capturedAt, blob };
  }));
  const budgetIssue = attachmentBudgetIssue(attachments.map(item => item.size));
  if (budgetIssue) throw new Error(budgetIssue);
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
