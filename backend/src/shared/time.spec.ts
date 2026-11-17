import {
  addDaysToYmd,
  appDateOf,
  appDayRange,
  dateOnlyToYmd,
  isValidYmd,
  nowInAppTz,
  parseClientTimestamp,
  weekdayIndexOfYmd,
  zonedWallTimeToInstant,
} from './time';

// Asia/Ulaanbaatar is UTC+8 with no daylight saving time. Every expectation
// below is written as an explicit UTC instant so the suite gives the same
// result regardless of the host timezone (CI runs it with TZ=UTC).

describe('shared/time calendar helpers', () => {
  describe('appDateOf', () => {
    it.each([
      // Ulaanbaatar wall clock → UTC instant
      ['00:00 UB', '2026-03-23T16:00:00.000Z', '2026-03-24'],
      ['07:59 UB', '2026-03-23T23:59:00.000Z', '2026-03-24'],
      ['16:00 UB', '2026-03-24T08:00:00.000Z', '2026-03-24'],
      ['23:59 UB', '2026-03-24T15:59:59.999Z', '2026-03-24'],
      ['next day 00:00 UB', '2026-03-24T16:00:00.000Z', '2026-03-25'],
    ])('places %s on the Ulaanbaatar calendar day', (_label, iso, ymd) => {
      expect(appDateOf(new Date(iso))).toBe(ymd);
    });

    it('rolls over months and years', () => {
      expect(appDateOf(new Date('2026-12-31T16:30:00.000Z'))).toBe(
        '2027-01-01',
      );
    });
  });

  describe('appDayRange', () => {
    it('covers 16:00 UTC of the previous day up to 15:59:59.999 UTC', () => {
      const { start, end } = appDayRange('2026-03-24');
      expect(start.toISOString()).toBe('2026-03-23T16:00:00.000Z');
      expect(end.toISOString()).toBe('2026-03-24T15:59:59.999Z');
    });

    it('is consistent with appDateOf at both edges', () => {
      const { start, end } = appDayRange('2026-02-28');
      expect(appDateOf(start)).toBe('2026-02-28');
      expect(appDateOf(end)).toBe('2026-02-28');
      expect(appDateOf(new Date(start.getTime() - 1))).toBe('2026-02-27');
      expect(appDateOf(new Date(end.getTime() + 1))).toBe('2026-03-01');
    });

    it('supports other timezones, including daylight saving changes', () => {
      // New York switched to daylight saving time on 2026-03-08 (23 h day).
      const { start, end } = appDayRange('2026-03-08', 'America/New_York');
      expect(start.toISOString()).toBe('2026-03-08T05:00:00.000Z');
      expect(end.toISOString()).toBe('2026-03-09T03:59:59.999Z');
    });

    it('rejects malformed dates', () => {
      expect(() => appDayRange('2026-02-30')).toThrow();
      expect(() => appDayRange('24-03-2026')).toThrow();
    });
  });

  describe('calendar arithmetic', () => {
    it('adds and subtracts days across month and year boundaries', () => {
      expect(addDaysToYmd('2026-03-01', -1)).toBe('2026-02-28');
      expect(addDaysToYmd('2028-02-28', 1)).toBe('2028-02-29');
      expect(addDaysToYmd('2026-12-31', 1)).toBe('2027-01-01');
    });

    it('returns the weekday of a calendar date (0 = Sunday)', () => {
      expect(weekdayIndexOfYmd('2026-03-22')).toBe(0); // Sunday
      expect(weekdayIndexOfYmd('2026-03-23')).toBe(1); // Monday
      expect(weekdayIndexOfYmd('2026-03-28')).toBe(6); // Saturday
    });

    it('validates YYYY-MM-DD strings', () => {
      expect(isValidYmd('2026-03-24')).toBe(true);
      expect(isValidYmd('2026-02-29')).toBe(false);
      expect(isValidYmd('2026-3-24')).toBe(false);
      expect(isValidYmd('2026-03-24T00:00:00')).toBe(false);
    });

    it('reads date-only database values from their UTC components', () => {
      expect(dateOnlyToYmd(new Date('2026-03-24T00:00:00.000Z'))).toBe(
        '2026-03-24',
      );
      expect(dateOnlyToYmd('2026-03-24')).toBe('2026-03-24');
    });
  });

  describe('zonedWallTimeToInstant', () => {
    it('converts Ulaanbaatar wall-clock time to a UTC instant', () => {
      expect(
        zonedWallTimeToInstant({
          year: 2026,
          month: 3,
          day: 24,
          hour: 7,
          minute: 30,
        }).toISOString(),
      ).toBe('2026-03-23T23:30:00.000Z');
    });
  });

  describe('parseClientTimestamp', () => {
    it('treats offset-less timestamps as Ulaanbaatar wall-clock time', () => {
      expect(parseClientTimestamp('2026-03-24T07:30:00').toISOString()).toBe(
        '2026-03-23T23:30:00.000Z',
      );
      expect(
        parseClientTimestamp('2026-03-24T23:15:10.250').toISOString(),
      ).toBe('2026-03-24T15:15:10.250Z');
    });

    it.each([
      ['2026-03-23T23:30:00.000Z', '2026-03-23T23:30:00.000Z'],
      ['2026-03-24T07:30:00+08:00', '2026-03-23T23:30:00.000Z'],
      ['2026-03-24T07:30:00+0800', '2026-03-23T23:30:00.000Z'],
      ['2026-03-24T07:30:00+08', '2026-03-23T23:30:00.000Z'],
      ['2026-03-23T18:30:00-05:00', '2026-03-23T23:30:00.000Z'],
    ])('keeps the absolute instant of %s', (input, expected) => {
      expect(parseClientTimestamp(input).toISOString()).toBe(expected);
    });

    it('treats a date-only value as the start of the Ulaanbaatar day', () => {
      expect(parseClientTimestamp('2026-03-24').toISOString()).toBe(
        '2026-03-23T16:00:00.000Z',
      );
    });

    it('returns an invalid date for impossible calendar dates', () => {
      expect(
        Number.isNaN(parseClientTimestamp('2026-02-30T10:00').getTime()),
      ).toBe(true);
    });
  });

  describe('nowInAppTz', () => {
    it('reports the Ulaanbaatar hour for a UTC instant', () => {
      const local = nowInAppTz(new Date('2026-03-23T23:30:00.000Z'));
      expect(local.hour).toBe(7);
      expect(local.minute).toBe(30);
      expect(local.ymd).toBe('2026-03-24');
    });
  });
});
