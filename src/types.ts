export type Precision = 'region' | '10km' | '1km' | '100m' | 'exact';
export type Confidence = 'low' | 'medium' | 'high';

export interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  capturedAt?: string;
  blob: Blob;
}

export interface Candidate {
  id: string;
  name: string;
  confidence: Confidence;
  notes: string;
}

export interface SightingDraft {
  id: string;
  title: string;
  observedAt: string;
  timeSource: 'entered' | 'photo metadata' | 'file date';
  placeLabel: string;
  latitude: number | null;
  longitude: number | null;
  precision: Precision;
  exactAcknowledged: boolean;
  sensitive: boolean;
  fieldMarks: string[];
  fieldNotes: string;
  candidates: Candidate[];
  attachments: EvidenceFile[];
  createdAt: string;
  updatedAt: string;
}

export const newDraft = (): SightingDraft => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(), title: '', observedAt: '', timeSource: 'entered',
    placeLabel: '', latitude: null, longitude: null, precision: 'region',
    exactAcknowledged: false, sensitive: false, fieldMarks: [], fieldNotes: '',
    candidates: [{ id: crypto.randomUUID(), name: '', confidence: 'low', notes: '' }],
    attachments: [], createdAt: now, updatedAt: now
  };
};
