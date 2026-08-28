import type { Precision, SightingDraft } from './types';

export const precisionLabels: Record<Precision, string> = {
  region: 'Region only — no coordinates',
  '10km': 'About 10 km — broad area',
  '1km': 'About 1 km — locality',
  '100m': 'About 100 m — use with care',
  exact: 'Exact coordinates — sensitive'
};

export function validCoordinates(latitude: number | null, longitude: number | null) {
  return latitude !== null && longitude !== null && Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function allowsExactLocation(draft: Pick<SightingDraft, 'precision' | 'exactAcknowledged'>) {
  return draft.precision === 'exact' && draft.exactAcknowledged;
}

// A latitude/longitude pair is sensitive even when it is hidden in a prose field.
// This intentionally covers decimal and degree-style pairs; individual ordinary numbers
// remain untouched so field notes can still contain counts and dates.
const latitude = '[+-]?(?:[0-8]?\\d(?:\\.\\d+)?|90(?:\\.0+)?)';
const longitude = '[+-]?(?:(?:1[0-7]\\d|[1-9]?\\d)(?:\\.\\d+)?|180(?:\\.0+)?)';
const coordinateSeparator = '(?:\\s*(?:,|;|/)\\s*|\\s+)';
const coordinatePair = new RegExp(`(^|[^\\w.])(?:(?:${latitude})\\s*(?:°\\s*)?(?:[NS]\\s*)?${coordinateSeparator}(?:${longitude})\\s*(?:°\\s*)?(?:[EW])?|(?:${longitude})\\s*(?:°\\s*)?(?:[EW]\\s*)?${coordinateSeparator}(?:${latitude})\\s*(?:°\\s*)?(?:[NS])?)(?!(?:[A-Za-z0-9_]|\\.\\d))`, 'gi');

export function shareSafeText(draft: Pick<SightingDraft, 'precision' | 'exactAcknowledged'>, value: string) {
  if (allowsExactLocation(draft)) return value;
  return value.replace(coordinatePair, (_match, prefix: string) => `${prefix}[coordinates withheld]`);
}

export function sharedCoordinates(draft: Pick<SightingDraft, 'latitude' | 'longitude' | 'precision' | 'exactAcknowledged'>) {
  const { latitude, longitude } = draft;
  if (draft.precision === 'region' || latitude === null || longitude === null || !validCoordinates(latitude, longitude)) return null;
  if (draft.precision === 'exact' && !allowsExactLocation(draft)) return null;
  if (draft.precision === 'exact') return { latitude, longitude, precision: precisionLabels.exact };
  const metres = { '10km': 10_000, '1km': 1_000, '100m': 100 }[draft.precision];
  const latitudeStep = metres / 111_320;
  const longitudeStep = metres / (111_320 * Math.max(0.1, Math.cos(latitude * Math.PI / 180)));
  const places = draft.precision === '10km' ? 3 : draft.precision === '1km' ? 4 : 5;
  return {
    latitude: Number((Math.round(latitude / latitudeStep) * latitudeStep).toFixed(places)),
    longitude: Number((Math.round(longitude / longitudeStep) * longitudeStep).toFixed(places)),
    precision: precisionLabels[draft.precision]
  };
}

export function exportIssues(draft: SightingDraft): string[] {
  const issues: string[] = [];
  if (!draft.observedAt) issues.push('Add the observation date and time.');
  if (!draft.placeLabel.trim()) issues.push('Add a share-safe place or region name.');
  if (!draft.attachments.length) issues.push('Attach at least one photo or audio recording.');
  if (!draft.candidates.some(candidate => candidate.name.trim())) issues.push('Add at least one candidate, even “Unknown bird”.');
  const hasLatitude = draft.latitude !== null;
  const hasLongitude = draft.longitude !== null;
  if (hasLatitude !== hasLongitude) issues.push('Enter both latitude and longitude, or leave both blank.');
  if (hasLatitude && (!Number.isFinite(draft.latitude!) || draft.latitude! < -90 || draft.latitude! > 90)) issues.push('Latitude must be a number from −90 to 90.');
  if (hasLongitude && (!Number.isFinite(draft.longitude!) || draft.longitude! < -180 || draft.longitude! > 180)) issues.push('Longitude must be a number from −180 to 180.');
  if (draft.precision === 'exact' && !draft.exactAcknowledged) issues.push('Acknowledge the exact-location warning or choose a safer precision.');
  if (draft.precision === 'exact' && !validCoordinates(draft.latitude, draft.longitude)) issues.push('Enter a valid latitude and longitude to export exact coordinates.');
  return issues;
}

export const bytesLabel = (bytes: number) => bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`;

export const localDateTime = (iso: string) => {
  if (!iso) return 'Not recorded';
  const date = new Date(iso);
  return Number.isNaN(date.valueOf()) ? iso : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};
