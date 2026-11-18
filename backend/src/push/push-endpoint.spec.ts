import { isAllowedPushEndpoint } from './push-endpoint';

describe('isAllowedPushEndpoint', () => {
  it.each([
    'https://fcm.googleapis.com/fcm/send/abc123',
    'https://updates.push.services.mozilla.com/wpush/v2/gAAAA',
    'https://wns2-par02p.notify.windows.com/w/?token=abc',
    'https://web.push.apple.com/QGxyz',
  ])('accepts the browser push service %s', (endpoint) => {
    expect(isAllowedPushEndpoint(endpoint)).toBe(true);
  });

  it.each([
    ['plain HTTP', 'http://fcm.googleapis.com/fcm/send/abc'],
    ['an internal address', 'https://169.254.169.254/latest/meta-data'],
    ['localhost', 'https://localhost:3000/api'],
    ['a look-alike domain', 'https://fcm.googleapis.com.evil.example/x'],
    ['a suffix without a dot', 'https://evilfcm.googleapis.com.attacker.io/x'],
    ['credentials in the URL', 'https://user:pw@fcm.googleapis.com/fcm/send/a'],
    ['an explicit port', 'https://fcm.googleapis.com:8443/fcm/send/a'],
    ['not a URL', 'not-a-url'],
  ])('rejects %s', (_label, endpoint) => {
    expect(isAllowedPushEndpoint(endpoint)).toBe(false);
  });
});
