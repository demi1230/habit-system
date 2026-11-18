/**
 * Domain rules — Reminder cue window
 * Pure logic deciding whether a habit's cues allow a reminder right now.
 *
 * Rule (time AND place):
 *  - At least one active time window must contain the current time
 *    (application timezone). A habit without a time window gets no
 *    scheduled reminders.
 *  - If the habit also has active location cues, the user's last known
 *    location must be recent and within the radius of one of them.
 */

export const LOCATION_RADIUS_METRES = 100;
/** A location older than this is not trusted for location cues. */
export const LOCATION_MAX_AGE_MINUTES = 30;

export interface CueWindowCue {
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  locationLat: number | null;
  locationLng: number | null;
}

export interface CueWindowInput {
  cues: CueWindowCue[];
  /** Minutes since midnight in the application timezone (0–1439). */
  minuteOfDay: number;
  /** The user's last reported location, or null when unknown. */
  userLocation: { lat: number; lng: number; updatedAt: Date | null } | null;
  now: Date;
}

export type CueWindowClosedReason =
  | 'NO_TIME_WINDOW'
  | 'OUTSIDE_TIME_WINDOW'
  | 'LOCATION_UNKNOWN'
  | 'LOCATION_STALE'
  | 'NOT_AT_LOCATION';

export type CueWindowResult =
  | { open: true }
  | { open: false; reason: CueWindowClosedReason };

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

export class CueWindowRules {
  static evaluate(input: CueWindowInput): CueWindowResult {
    const active = input.cues.filter((cue) => cue.isActive);
    const timeCues = active.filter((cue) => cue.startTime && cue.endTime);
    const placeCues = active.filter(
      (cue) => cue.locationLat !== null && cue.locationLng !== null,
    );

    if (timeCues.length === 0) {
      return { open: false, reason: 'NO_TIME_WINDOW' };
    }

    const inWindow = timeCues.some((cue) =>
      CueWindowRules.isInTimeWindow(
        cue.startTime!,
        cue.endTime!,
        input.minuteOfDay,
      ),
    );
    if (!inWindow) {
      return { open: false, reason: 'OUTSIDE_TIME_WINDOW' };
    }

    if (placeCues.length === 0) {
      return { open: true };
    }

    const location = input.userLocation;
    if (!location) {
      return { open: false, reason: 'LOCATION_UNKNOWN' };
    }
    const ageMs = location.updatedAt
      ? input.now.getTime() - location.updatedAt.getTime()
      : Infinity;
    if (ageMs > LOCATION_MAX_AGE_MINUTES * 60_000) {
      return { open: false, reason: 'LOCATION_STALE' };
    }

    const nearPlace = placeCues.some(
      (cue) =>
        CueWindowRules.distanceMetres(
          location.lat,
          location.lng,
          cue.locationLat!,
          cue.locationLng!,
        ) <= LOCATION_RADIUS_METRES,
    );
    return nearPlace
      ? { open: true }
      : { open: false, reason: 'NOT_AT_LOCATION' };
  }

  /** Inclusive window; a window ending before it starts crosses midnight. */
  static isInTimeWindow(
    startTime: string,
    endTime: string,
    minuteOfDay: number,
  ): boolean {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    if (end >= start) {
      return minuteOfDay >= start && minuteOfDay <= end;
    }
    return minuteOfDay >= start || minuteOfDay <= end;
  }

  /** Great-circle distance in metres (haversine). */
  static distanceMetres(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const earthRadius = 6_371_000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * earthRadius * Math.asin(Math.sqrt(a));
  }
}
