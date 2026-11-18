import { CompletionTriggerSource } from '../enums/domain.enums';
import { TriggerSourceRules } from './trigger-source.rules';

// 09:00 Ulaanbaatar on 2026-03-24.
const NOW = new Date('2026-03-24T01:00:00.000Z');
const minutesBefore = (date: Date, minutes: number) =>
  new Date(date.getTime() - minutes * 60_000);

describe('TriggerSourceRules.classify', () => {
  it('attributes a completion soon after a delivered reminder to that reminder', () => {
    expect(
      TriggerSourceRules.classify({
        completedAt: NOW,
        now: NOW,
        lastDeliveredReminder: { id: 'r1', sentAt: minutesBefore(NOW, 20) },
      }),
    ).toEqual({
      triggerSource: CompletionTriggerSource.REMINDER_TRIGGERED,
      linkedReminderId: 'r1',
    });
  });

  it('treats a completion long after the reminder as self-initiated', () => {
    expect(
      TriggerSourceRules.classify({
        completedAt: NOW,
        now: NOW,
        lastDeliveredReminder: { id: 'r1', sentAt: minutesBefore(NOW, 90) },
      }).triggerSource,
    ).toBe(CompletionTriggerSource.SELF_INITIATED);
  });

  it('treats a completion without any reminder as self-initiated', () => {
    expect(
      TriggerSourceRules.classify({
        completedAt: NOW,
        now: NOW,
        lastDeliveredReminder: null,
      }).triggerSource,
    ).toBe(CompletionTriggerSource.SELF_INITIATED);
  });

  it('marks a catch-up entry for an earlier day as unknown', () => {
    expect(
      TriggerSourceRules.classify({
        completedAt: new Date('2026-03-23T04:00:00.000Z'), // noon the day before
        now: NOW,
        lastDeliveredReminder: null,
      }),
    ).toEqual({
      triggerSource: CompletionTriggerSource.UNKNOWN,
      linkedReminderId: null,
    });
  });
});
