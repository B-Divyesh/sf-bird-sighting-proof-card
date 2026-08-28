import { describe, expect, it } from 'vitest';
import { exportIssues, sharedCoordinates } from '../src/privacy';
import { newDraft } from '../src/types';

describe('location privacy', () => {
  it('withholds coordinates by default', () => {
    expect(sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: 'region', exactAcknowledged: false })).toBeNull();
  });

  it('rounds before sharing', () => {
    expect(sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: '1km', exactAcknowledged: false }))
      .toEqual({ latitude: 58.95, longitude: -2.75, precision: 'About 1 km — locality' });
  });

  it('requires explicit consent for exact coordinates', () => {
    expect(sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: 'exact', exactAcknowledged: false })).toBeNull();
    expect(sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: 'exact', exactAcknowledged: true })?.latitude).toBe(58.95123);
  });
});

describe('export readiness', () => {
  it('names every missing proof element', () => {
    expect(exportIssues(newDraft())).toEqual([
      'Add the observation date and time.',
      'Add a share-safe place or region name.',
      'Attach at least one photo or audio recording.',
      'Add at least one candidate, even “Unknown bird”.'
    ]);
  });
});
