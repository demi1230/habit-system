import { ContextSnapshotRules } from './context-snapshot.rules';

const HOME = { lat: 47.9184, lng: 106.9177 };
const homeCue = {
  isActive: true,
  coarseLocation: 'Гэр',
  locationLat: HOME.lat,
  locationLng: HOME.lng,
};
// 07:30 Ulaanbaatar.
const COMPLETED_AT = new Date('2026-03-23T23:30:00.000Z');

describe('ContextSnapshotRules.capture', () => {
  it('records the Ulaanbaatar hour of the completion', () => {
    expect(
      ContextSnapshotRules.capture({
        completedAt: COMPLETED_AT,
        now: COMPLETED_AT,
        cues: [],
        userLocation: null,
      }),
    ).toEqual({ completionHour: 7, coarseLocation: null });
  });

  it('records the saved place when the user was there at the time', () => {
    expect(
      ContextSnapshotRules.capture({
        completedAt: COMPLETED_AT,
        now: COMPLETED_AT,
        cues: [homeCue],
        userLocation: { ...HOME, updatedAt: COMPLETED_AT },
      }).coarseLocation,
    ).toBe('Гэр');
  });

  it('does not guess a place from an old or distant location', () => {
    expect(
      ContextSnapshotRules.capture({
        completedAt: COMPLETED_AT,
        now: COMPLETED_AT,
        cues: [homeCue],
        userLocation: {
          ...HOME,
          updatedAt: new Date(COMPLETED_AT.getTime() - 2 * 60 * 60_000),
        },
      }).coarseLocation,
    ).toBeNull();

    expect(
      ContextSnapshotRules.capture({
        completedAt: COMPLETED_AT,
        now: COMPLETED_AT,
        cues: [homeCue],
        userLocation: {
          lat: HOME.lat + 0.02,
          lng: HOME.lng,
          updatedAt: COMPLETED_AT,
        },
      }).coarseLocation,
    ).toBeNull();
  });

  it('records nothing for a catch-up entry on an earlier day', () => {
    expect(
      ContextSnapshotRules.capture({
        completedAt: COMPLETED_AT,
        now: new Date(COMPLETED_AT.getTime() + 24 * 60 * 60_000),
        cues: [homeCue],
        userLocation: { ...HOME, updatedAt: COMPLETED_AT },
      }),
    ).toEqual({ completionHour: null, coarseLocation: null });
  });
});
