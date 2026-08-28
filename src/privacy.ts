import type { Precision, SightingDraft } from './types';

export const precisionLabels: Record<Precision, string> = {
  region: 'Region only — no coordinates',
  '10km': 'About 10 km — broad area',
  '1km': 'About 1 km — locality',
  '100m': 'About 100 m — use with care',
  exact: 'Exact coordinates — sensitive'
};

export function sharedCoordinates(draft: Pick<SightingDraft, 'latitude' | 'longitude' | 'precision' | 'exactAcknowledged'>) {
  if (draft.precision === 'region' || draft.latitude === null || draft.longitude === null) return null;
  if (draft.precision === 'exact' && !draft.exactAcknowledged) return null;
  if (draft.precision === 'exact') return { latitude: draft.latitude, longitude: draft.longitude, precision: precisionLabels.exact };
  const metres = { '10km': 10_000, '1km': 1_000, '100m': 100 }[draft.precision];
  const latitudeStep = metres / 111_320;
  const longitudeStep = metres / (111_320 * Math.max(0.1, Math.cos(draft.latitude * Math.PI / 180)));
  const places = draft.precision === '10km' ? 3 : draft.precision === '1km' ? 4 : 5;
  return {
    latitude: Number((Math.round(draft.latitude / latitudeStep) * latitudeStep).toFixed(places)),
    longitude: Number((Math.round(draft.longitude / longitudeStep) * longitudeStep).toFixed(places)),
    precision: precisionLabels[draft.precision]
  };
}

export function exportIssues(draft: SightingDraft): string[] {
  const issues: string[] = [];
  if (!draft.observedAt) issues.push('Add the observation date and time.');
  if (!draft.placeLabel.trim()) issues.push('Add a share-safe place or region name.');
  if (!draft.attachments.length) issues.push('Attach at least one photo or audio recording.');
  if (!draft.candidates.some(candidate => candidate.name.trim())) issues.push('Add at least one candidate, even “Unknown bird”.');
  if (draft.precision === 'exact' && !draft.exactAcknowledged) issues.push('Acknowledge the exact-location warning or choose a safer precision.');
  return issues;
}

export const bytesLabel = (bytes: number) => bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`;

export const localDateTime = (iso: string) => {
  if (!iso) return 'Not recorded';
  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? iso : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};
