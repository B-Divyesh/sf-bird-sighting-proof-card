import { describe, expect, it } from 'vitest';
import { exportIssues, shareSafeText, sharedCoordinates } from '../src/privacy';
import { newDraft } from '../src/types';

describe('location privacy', () => {
  it('withholds coordinates by default', () => {
    expect(sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: 'region', exactAcknowledged: false })).toBeNull();
  });

  it('rounds before sharing', () => {
    const shared = sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: '1km', exactAcknowledged: false });
    expect(shared?.precision).toBe('About 1 km — locality');
    expect(shared?.latitude).not.toBe(58.951234);
    expect(shared?.longitude).not.toBe(-2.751234);
  });

  it('requires explicit consent for exact coordinates', () => {
    expect(sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: 'exact', exactAcknowledged: false })).toBeNull();
    expect(sharedCoordinates({ latitude: 58.951234, longitude: -2.751234, precision: 'exact', exactAcknowledged: true })?.latitude).toBe(58.951234);
  });

  it('never shares impossible coordinates', () => {
    expect(sharedCoordinates({ latitude: 91, longitude: 181, precision: 'exact', exactAcknowledged: true })).toBeNull();
  });

  it('redacts coordinate pairs in prose until exact location is acknowledged', () => {
    const draft = { precision: 'region' as const, exactAcknowledged: false };
    expect(shareSafeText(draft, 'Nest at 58.951234, -2.751234.')).toBe('Nest at [coordinates withheld].');
    expect(shareSafeText(draft, 'Coordinates -2.751234, 58.951234.')).toBe('Coordinates [coordinates withheld].');
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

  it('rejects incomplete and out-of-range coordinate input', () => {
    const draft = newDraft();
    draft.latitude = 91;
    draft.longitude = 181;
    draft.precision = 'exact';
    draft.exactAcknowledged = true;
    expect(exportIssues(draft)).toEqual(expect.arrayContaining([
      'Latitude must be a number from −90 to 90.',
      'Longitude must be a number from −180 to 180.',
      'Enter a valid latitude and longitude to export exact coordinates.'
    ]));
  });
});
