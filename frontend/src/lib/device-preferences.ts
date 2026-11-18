/**
 * Per-user choices remembered on this device. Storage can be unavailable
 * (private mode, blocked site data), so every access is guarded and the
 * privacy-preserving value is assumed when nothing can be read.
 */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the choice lasts for this session only */
  }
}

/** Location is shared only after the user turns it on (off by default). */
export function isLocationSharingOn(userId: string): boolean {
  return read(`location_sharing:${userId}`) === 'on';
}

export function saveLocationSharing(userId: string, on: boolean): void {
  write(`location_sharing:${userId}`, on ? 'on' : 'off');
}

/** Set when the user turned reminders off on this device. */
export function isPushOptedOut(userId: string): boolean {
  return read(`push_opt_out:${userId}`) === '1';
}

export function savePushOptedOut(userId: string, optedOut: boolean): void {
  write(`push_opt_out:${userId}`, optedOut ? '1' : null);
}
