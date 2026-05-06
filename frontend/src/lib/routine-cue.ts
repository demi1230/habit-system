export type RoutineTiming = 'дараа' | 'өмнө' | 'үедээ';

export const TIMING_OPTIONS: RoutineTiming[] = ['дараа', 'өмнө', 'үедээ'];

const SEP = '|||';

/** Encode activity + timing into the precedingRoutine DB string. */
export function encodeRoutineCue(activity: string, timing: RoutineTiming): string {
  return `${activity}${SEP}${timing}`;
}

/** Parse the precedingRoutine DB string back into activity + timing. */
export function parseRoutineCue(stored: string): { activity: string; timing: RoutineTiming } {
  if (stored.includes(SEP)) {
    const idx = stored.indexOf(SEP);
    const activity = stored.slice(0, idx);
    const raw = stored.slice(idx + SEP.length);
    const timing = TIMING_OPTIONS.includes(raw as RoutineTiming)
      ? (raw as RoutineTiming)
      : 'дараа';
    return { activity, timing };
  }
  return { activity: stored, timing: 'дараа' };
}
