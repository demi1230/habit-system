/**
 * Web Push endpoints come from the browser's push service. The server POSTs
 * to them when sending reminders, so accepting any URL would let a user make
 * the server send requests to arbitrary (including internal) addresses.
 * Only HTTPS endpoints on known browser push services are accepted.
 */
const ALLOWED_PUSH_HOST_SUFFIXES = [
  'fcm.googleapis.com', // Chrome, Edge (Chromium), Opera, Samsung Internet
  'push.services.mozilla.com', // Firefox
  'notify.windows.com', // Windows Push Notification Services
  'push.apple.com', // Safari / iOS web apps
];

export function isAllowedPushEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    return false;
  }
  const host = url.hostname.toLowerCase();
  return ALLOWED_PUSH_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}
