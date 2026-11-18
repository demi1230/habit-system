import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTsModule } from './helpers/load-ts.mjs';

const {
  isBinaryHabit,
  logStatusFor,
  progressPercent,
  reachesFullTarget,
  statusFromServerLog,
} = loadTsModule(new URL('../src/lib/habit-status.ts', import.meta.url));

const running = { targetValue: 30, minimumTarget: 10, measurementUnit: 'минут' };
const yesNo = { targetValue: 1, minimumTarget: 1, measurementUnit: 'удаа' };

test('a value reaching the minimum target is done, like the backend rule', () => {
  assert.equal(logStatusFor(running, 10), 'done');
  assert.equal(logStatusFor(running, 30), 'done');
});

test('a positive value below the minimum target is partial', () => {
  assert.equal(logStatusFor(running, 9.5), 'partial');
});

test('no value is not a log', () => {
  assert.equal(logStatusFor(running, 0), 'none');
  assert.equal(logStatusFor(yesNo, 0), 'none');
});

test('binary habits are done with one tap', () => {
  assert.equal(isBinaryHabit(yesNo), true);
  assert.equal(logStatusFor(yesNo, 1), 'done');
});

test('progress and the full-target label still use the full target', () => {
  assert.equal(progressPercent(running, 15), 50);
  assert.equal(progressPercent(running, 45), 100);
  assert.equal(reachesFullTarget(running, 10), false);
  assert.equal(reachesFullTarget(running, 30), true);
});

test('the saved server status wins over the local estimate', () => {
  assert.equal(statusFromServerLog({ status: 'DONE', actualValue: null }), 'done');
  assert.equal(statusFromServerLog({ status: 'NOT_DONE', actualValue: 12 }), 'partial');
  assert.equal(statusFromServerLog({ status: 'NOT_DONE', actualValue: 0 }), 'none');
});
