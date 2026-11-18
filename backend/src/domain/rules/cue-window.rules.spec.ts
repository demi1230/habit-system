import { CueWindowRules, type CueWindowCue } from './cue-window.rules';

const NOW = new Date('2026-03-24T00:00:00.000Z'); // 08:00 Ulaanbaatar
const HOME = { lat: 47.9184, lng: 106.9177 };

const timeCue = (startTime: string, endTime: string): CueWindowCue => ({
  isActive: true,
  startTime,
  endTime,
  locationLat: null,
  locationLng: null,
});

const placeCue = (lat: number, lng: number): CueWindowCue => ({
  isActive: true,
  startTime: null,
  endTime: null,
  locationLat: lat,
  locationLng: lng,
});

const at = (hh: number, mm = 0) => hh * 60 + mm;

describe('CueWindowRules.evaluate', () => {
  it('opens inside an active time window', () => {
    expect(
      CueWindowRules.evaluate({
        cues: [timeCue('07:00', '08:30')],
        minuteOfDay: at(8),
        userLocation: null,
        now: NOW,
      }),
    ).toEqual({ open: true });
  });

  it('stays closed outside every time window', () => {
    expect(
      CueWindowRules.evaluate({
        cues: [timeCue('07:00', '07:30')],
        minuteOfDay: at(8),
        userLocation: null,
        now: NOW,
      }),
    ).toEqual({ open: false, reason: 'OUTSIDE_TIME_WINDOW' });
  });

  it('never opens for a location cue without a time window (no round-the-clock reminders)', () => {
    expect(
      CueWindowRules.evaluate({
        cues: [placeCue(HOME.lat, HOME.lng)],
        minuteOfDay: at(3),
        userLocation: { ...HOME, updatedAt: NOW },
        now: NOW,
      }),
    ).toEqual({ open: false, reason: 'NO_TIME_WINDOW' });
  });

  it('requires both the time window and the place', () => {
    const cues = [timeCue('07:00', '09:00'), placeCue(HOME.lat, HOME.lng)];

    expect(
      CueWindowRules.evaluate({
        cues,
        minuteOfDay: at(8),
        userLocation: { lat: HOME.lat + 0.0005, lng: HOME.lng, updatedAt: NOW },
        now: NOW,
      }),
    ).toEqual({ open: true }); // ~55 m away

    expect(
      CueWindowRules.evaluate({
        cues,
        minuteOfDay: at(8),
        userLocation: { lat: HOME.lat + 0.01, lng: HOME.lng, updatedAt: NOW },
        now: NOW,
      }),
    ).toEqual({ open: false, reason: 'NOT_AT_LOCATION' }); // ~1.1 km away
  });

  it('ignores a location that is unknown or too old', () => {
    const cues = [timeCue('07:00', '09:00'), placeCue(HOME.lat, HOME.lng)];

    expect(
      CueWindowRules.evaluate({
        cues,
        minuteOfDay: at(8),
        userLocation: null,
        now: NOW,
      }),
    ).toEqual({ open: false, reason: 'LOCATION_UNKNOWN' });

    expect(
      CueWindowRules.evaluate({
        cues,
        minuteOfDay: at(8),
        userLocation: {
          ...HOME,
          updatedAt: new Date(NOW.getTime() - 31 * 60_000),
        },
        now: NOW,
      }),
    ).toEqual({ open: false, reason: 'LOCATION_STALE' });

    expect(
      CueWindowRules.evaluate({
        cues,
        minuteOfDay: at(8),
        userLocation: { ...HOME, updatedAt: null },
        now: NOW,
      }),
    ).toEqual({ open: false, reason: 'LOCATION_STALE' });
  });

  it('ignores inactive cues', () => {
    expect(
      CueWindowRules.evaluate({
        cues: [{ ...timeCue('07:00', '09:00'), isActive: false }],
        minuteOfDay: at(8),
        userLocation: null,
        now: NOW,
      }),
    ).toEqual({ open: false, reason: 'NO_TIME_WINDOW' });
  });
});

describe('CueWindowRules.isInTimeWindow', () => {
  it('handles windows that cross midnight', () => {
    expect(CueWindowRules.isInTimeWindow('22:00', '01:00', at(23, 30))).toBe(
      true,
    );
    expect(CueWindowRules.isInTimeWindow('22:00', '01:00', at(0, 30))).toBe(
      true,
    );
    expect(CueWindowRules.isInTimeWindow('22:00', '01:00', at(12))).toBe(false);
  });
});
