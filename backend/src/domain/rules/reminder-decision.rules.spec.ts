import { ReminderDecisionRules } from './reminder-decision.rules';
import { ReminderDecisionReason, Weekday } from '../enums/domain.enums';
import { HabitCueEntity } from '../entities/habit-cue.entity';
import { CueScheduleRules } from './cue-schedule.rules';

/** Helper: build a minimal HabitCueEntity stub. */
function makeCue(isActive: boolean): HabitCueEntity {
  return {
    id: 'cue-1',
    habitId: 'h1',
    userId: 'u1',
    isActive,
    startTime: null,
    endTime: null,
    coarseLocation: null,
    precedingRoutine: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as HabitCueEntity;
}

/** All weekdays — ensures isScheduledToday always returns true. */
const ALL_DAYS = Object.values(Weekday).map((w) => ({ weekday: w }));

const baseInput = {
  habitId: 'h1',
  reminderEnabled: true,
  scheduleDays: ALL_DAYS,
  cues: [makeCue(true)],
};

describe('ReminderDecisionRules.decide', () => {
  it('returns REMINDER_DISABLED when reminderEnabled=false', () => {
    const result = ReminderDecisionRules.decide({
      ...baseInput,
      reminderEnabled: false,
    });
    expect(result.reason).toBe(ReminderDecisionReason.REMINDER_DISABLED);
    expect(result.shouldRemind).toBe(false);
    expect(result.habitId).toBe('h1');
    expect(new Date(result.evaluatedAt).toISOString()).toBe(result.evaluatedAt);
  });

  it('returns NOT_SCHEDULED_TODAY when habit is not scheduled today', () => {
    // Empty scheduleDays = treat as daily → tested elsewhere.
    // Use a schedule with only weekdays that are never today by fixing them to
    // a single day that cannot be "today" — instead we mock: pass no weekday at all
    // and rely on a non-matching set. Easiest: use a weekday that is deliberately
    // not included (we rely on CueScheduleRules.isScheduledToday returning false
    // when all matching days are absent). Provide a single-element array whose
    // weekday is guaranteed not to be today by using a jest spy.
    const spy = jest
      .spyOn(CueScheduleRules, 'isScheduledToday')
      .mockReturnValueOnce(false);

    const result = ReminderDecisionRules.decide({ ...baseInput });
    expect(result.reason).toBe(ReminderDecisionReason.NOT_SCHEDULED_TODAY);
    expect(result.shouldRemind).toBe(false);

    spy.mockRestore();
  });

  it('returns NO_ACTIVE_CUES when no cue is active', () => {
    const result = ReminderDecisionRules.decide({
      ...baseInput,
      cues: [makeCue(false)],
    });
    expect(result.reason).toBe(ReminderDecisionReason.NO_ACTIVE_CUES);
    expect(result.shouldRemind).toBe(false);
    expect(result.activeCueCount).toBe(0);
  });

  it('returns SHOULD_REMIND when all conditions are met', () => {
    const result = ReminderDecisionRules.decide({ ...baseInput });
    expect(result.reason).toBe(ReminderDecisionReason.SHOULD_REMIND);
    expect(result.shouldRemind).toBe(true);
    expect(result.activeCueCount).toBeGreaterThan(0);
    expect(result.isScheduledToday).toBe(true);
  });
});
