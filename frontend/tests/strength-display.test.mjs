import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTsModule } from './helpers/load-ts.mjs';

const {
  missingEvidenceHint,
  strengthStageLabel,
  strengthStageOf,
} = loadTsModule(new URL('../src/lib/strength-display.ts', import.meta.url));

test('a habit without an estimate is not labelled weak', () => {
  assert.equal(strengthStageOf(null), 'insufficient_data');
  assert.equal(strengthStageLabel('insufficient_data'), 'Өгөгдөл хангалтгүй');
  assert.equal(strengthStageOf(0), 'weak');
});

test('stage thresholds match the backend (40 and 70)', () => {
  assert.equal(strengthStageOf(39.9), 'weak');
  assert.equal(strengthStageOf(40), 'building');
  assert.equal(strengthStageOf(70), 'strong');
});

test('the hint names the missing evidence', () => {
  assert.match(
    missingEvidenceHint({ srbaiScore: null, consistencyScore: 50 }),
    /SRBAI/,
  );
  assert.match(
    missingEvidenceHint({ srbaiScore: 60, consistencyScore: null, scheduledDays: 3 }),
    /7 төлөвлөсөн өдөр.*3/,
  );
});
