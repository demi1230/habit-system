import { appDateOf, nowInAppTz } from '../../shared/time';
import {
  CueWindowRules,
  LOCATION_MAX_AGE_MINUTES,
  LOCATION_RADIUS_METRES,
} from './cue-window.rules';

/**
 * Domain rules — Context snapshot
 * The context observed when a completion is logged, used for context
 * stability. Only observed facts are recorded:
 *  - completionHour: hour of completedAt in the application timezone;
 *  - coarseLocation: the saved reminder place the user was at (within the
 *    reminder radius), only if their location was reported within
 *    LOCATION_MAX_AGE_MINUTES of the completion; otherwise null.
 */
export interface ContextSnapshot {
  completionHour: number | null;
  coarseLocation: string | null;
}

export class ContextSnapshotRules {
  static capture(input: {
    completedAt: Date;
    /** When the completion is being logged. */
    now: Date;
    cues: Array<{
      isActive: boolean;
      coarseLocation: string | null;
      locationLat: number | null;
      locationLng: number | null;
    }>;
    userLocation: { lat: number; lng: number; updatedAt: Date | null } | null;
  }): ContextSnapshot {
    // A catch-up entry for an earlier day carries a placeholder time and the
    // current location says nothing about that day: nothing was observed.
    if (appDateOf(input.completedAt) !== appDateOf(input.now)) {
      return { completionHour: null, coarseLocation: null };
    }

    const completionHour = nowInAppTz(input.completedAt).hour;
    const location = input.userLocation;

    const locationAgeMs =
      location?.updatedAt != null
        ? Math.abs(input.completedAt.getTime() - location.updatedAt.getTime())
        : Infinity;
    if (!location || locationAgeMs > LOCATION_MAX_AGE_MINUTES * 60_000) {
      return { completionHour, coarseLocation: null };
    }

    const place = input.cues
      .filter(
        (cue) =>
          cue.isActive && cue.locationLat !== null && cue.locationLng !== null,
      )
      .map((cue) => ({
        cue,
        distance: CueWindowRules.distanceMetres(
          location.lat,
          location.lng,
          cue.locationLat!,
          cue.locationLng!,
        ),
      }))
      .filter(({ distance }) => distance <= LOCATION_RADIUS_METRES)
      .sort((a, b) => a.distance - b.distance)[0]?.cue;

    if (!place) {
      return { completionHour, coarseLocation: null };
    }
    return {
      completionHour,
      coarseLocation:
        place.coarseLocation ??
        `${place.locationLat!.toFixed(4)},${place.locationLng!.toFixed(4)}`,
    };
  }
}
