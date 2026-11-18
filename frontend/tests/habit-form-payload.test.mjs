import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTsModule } from './helpers/load-ts.mjs';

const routineCue = loadTsModule(new URL('../src/lib/routine-cue.ts', import.meta.url));
const {
  buildHabitPayload,
  habitToFormValues,
  validateHabitTargets,
  validateReminderCues,
  MIN_ABOVE_TARGET_MESSAGE,
  PLACE_NEEDS_TIME_MESSAGE,
} = loadTsModule(new URL('../src/features/habits/habit-form-payload.ts', import.meta.url), {
  modules: { '@/lib/routine-cue': routineCue },
});

// Objects created inside the vm sandbox have foreign prototypes; compare plain copies.
const plain = (value) => JSON.parse(JSON.stringify(value));

const baseValues = {
  title: ' Гүйх ',
  precedingRoutine: '',
  routineTiming: 'дараа',
  reason: '',
  colorId: 'lavender',
  selectedEmoji: '🏃',
  benefits: [],
  steps: [],
  selectedDays: ['MONDAY'],
  reminderEnabled: true,
  timeWindows: [],
  selectedLocations: [],
  habitType: 'measurable',
  targetNum: '30',
  minNum: '',
  targetUnit: 'минут',
};

const savedHabit = {
  title: 'Гүйх',
  precedingRoutine: 'Өглөөний цай|||дараа',
  motivationProfile: { reason: 'Эрүүл байх' },
  color: 'mint',
  iconValue: '🏃',
  benefits: ['Эрч хүч'],
  steps: [{ title: 'Гутлаа өмсөх' }],
  scheduleDays: [{ weekday: 'MONDAY' }],
  reminderEnabled: true,
  targetValue: 0.5,
  minimumTarget: 0.25,
  measurementUnit: 'цаг',
  cues: [
    { isActive: true, startTime: '07:00:00', endTime: '08:00:00', coarseLocation: null, locationLat: null, locationLng: null },
    { isActive: true, startTime: null, endTime: null, coarseLocation: 'Гэр', locationLat: 47.9184, locationLng: 106.9177 },
    { isActive: false, startTime: '20:00', endTime: '21:00', coarseLocation: null, locationLat: null, locationLng: null },
  ],
};

test('editing keeps saved GPS coordinates of location cues', () => {
  const values = habitToFormValues(savedHabit);
  assert.deepEqual(plain(values.selectedLocations), [
    { lat: 47.9184, lng: 106.9177, label: 'Гэр' },
  ]);
  assert.deepEqual(plain(values.timeWindows), [{ start: '07:00', end: '08:00' }]);
});

test('editing preserves a minimum target below 1', () => {
  const values = habitToFormValues(savedHabit);
  assert.equal(values.minNum, '0.25');
  const payload = buildHabitPayload({ ...baseValues, ...values }, { mode: 'edit', today: '2026-03-24' });
  assert.equal(payload.minimumTarget, 0.25);
  assert.equal(payload.targetValue, 0.5);
});

test('edit mode sends explicit empty values so cleared fields are saved', () => {
  const payload = buildHabitPayload(baseValues, { mode: 'edit', today: '2026-03-24' });
  assert.equal(payload.reason, '');
  assert.equal(payload.precedingRoutine, '');
  assert.deepEqual(plain(payload.benefits), []);
  assert.deepEqual(plain(payload.reminder.timeWindows), []);
  assert.deepEqual(plain(payload.reminder.locations), []);
  assert.equal('startDate' in payload, false);
});

test('create mode omits empty optional values and sets the start date', () => {
  const payload = buildHabitPayload(baseValues, { mode: 'create', today: '2026-03-24' });
  assert.equal(payload.reason, undefined);
  assert.equal(payload.precedingRoutine, undefined);
  assert.equal(payload.benefits, undefined);
  assert.equal(payload.reminder.timeWindows, undefined);
  assert.equal(payload.reminder.locations, undefined);
  assert.equal(payload.startDate, '2026-03-24');
  assert.equal(payload.title, 'Гүйх');
});

test('an empty minimum defaults to one unit, capped at small targets', () => {
  assert.equal(buildHabitPayload(baseValues, { mode: 'create', today: '2026-03-24' }).minimumTarget, 1);
  const half = buildHabitPayload({ ...baseValues, targetNum: '0.5' }, { mode: 'create', today: '2026-03-24' });
  assert.equal(half.minimumTarget, 0.5);
});

test('a minimum above the target is rejected before saving', () => {
  assert.equal(validateHabitTargets({ ...baseValues, minNum: '40' }), MIN_ABOVE_TARGET_MESSAGE);
  assert.equal(validateHabitTargets({ ...baseValues, minNum: '10' }), null);
  assert.equal(validateHabitTargets({ ...baseValues, habitType: 'binary', minNum: '40' }), null);
});

test('a reminder place needs a time window (reminders need time and place)', () => {
  const home = [{ lat: 47.9184, lng: 106.9177, label: 'Гэр' }];
  assert.equal(validateReminderCues({ ...baseValues, selectedLocations: home }), PLACE_NEEDS_TIME_MESSAGE);
  assert.equal(
    validateReminderCues({ ...baseValues, selectedLocations: home, timeWindows: [{ start: '07:00', end: '08:00' }] }),
    null,
  );
  assert.equal(validateReminderCues(baseValues), null);
});
