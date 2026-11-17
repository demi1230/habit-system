/**
 * Read-only diagnostic: were habit log timestamps stored with a timezone shift?
 *
 * Background: the dashboard sends `completedAt` without a UTC offset
 * (e.g. "2026-03-24T07:30:00") and the API parses it in the *server's* local
 * timezone, while `logged_at` is always the server's real "now". For logs
 * recorded at the moment of completion the two should be close:
 *
 *   offset ≈ 0 h   → the server ran in Asia/Ulaanbaatar; completed_at is correct
 *   offset ≈ +8 h  → the server ran in UTC; completed_at is 8 h later than reality
 *
 * REMINDER_TRIGGERED logs use real instants for both columns and act as a
 * control group (expected ≈ 0 h). Backfilled logs (noon of an earlier day)
 * fall outside the ±14 h window and are only counted.
 *
 * The time difference is computed inside PostgreSQL, so the result does not
 * depend on the timezone of the machine running this script. Only aggregate
 * counts are printed; no user, habit or log identifiers are output. The
 * queries run in a READ ONLY transaction.
 */
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { Client } = require('pg');

const WINDOW_HOURS = 14;

function printHelp() {
  console.log(`Diagnose the completed_at vs logged_at offset of habit logs (read-only).

Usage:
  npm run diagnose:log-time-offset

Prints, per trigger source and month, how many logs have each rounded
offset (completed_at - logged_at, in hours). No data is modified.
`);
}

function loadEnvironment() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();
    const quote = value[0];
    if (
      value.length >= 2 &&
      (quote === '"' || quote === "'" || quote === '`') &&
      value[value.length - 1] === quote
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function getConnectionString() {
  const runtimeUrl = process.env.DATABASE_URL;
  if (!runtimeUrl) {
    throw new Error(
      'DATABASE_URL is missing. Make sure backend/.env exists and contains DATABASE_URL.',
    );
  }

  const isAccelerateUrl =
    runtimeUrl.startsWith('prisma://') ||
    runtimeUrl.startsWith('prisma+postgres://');

  if (!isAccelerateUrl) {
    return runtimeUrl;
  }

  const directUrl =
    process.env.DIRECT_DATABASE_URL || process.env.DIRECT_URL || null;
  if (!directUrl) {
    throw new Error(
      'DATABASE_URL is an Accelerate URL. Please also set DIRECT_DATABASE_URL or DIRECT_URL.',
    );
  }

  return directUrl;
}

function describeHost(connectionString) {
  try {
    return new URL(connectionString).host;
  } catch {
    return '(unparseable connection string)';
  }
}

async function main() {
  if (process.argv.includes('--help')) {
    printHelp();
    return;
  }

  loadEnvironment();
  const connectionString = getConnectionString();
  console.log(`Database host: ${describeHost(connectionString)}`);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('BEGIN READ ONLY');

    const totals = await client.query(
      `
        SELECT
          trigger_source AS "source",
          count(*)::int AS "total",
          count(*) FILTER (
            WHERE abs(extract(epoch FROM (completed_at - logged_at))) < $1 * 3600
          )::int AS "inWindow"
        FROM habit_logs
        GROUP BY trigger_source
        ORDER BY trigger_source
      `,
      [WINDOW_HOURS],
    );

    const histogram = await client.query(
      `
        SELECT
          trigger_source AS "source",
          to_char(date_trunc('month', logged_at), 'YYYY-MM') AS "month",
          round(extract(epoch FROM (completed_at - logged_at)) / 3600.0)::int
            AS "offsetHours",
          count(*)::int AS "count"
        FROM habit_logs
        WHERE abs(extract(epoch FROM (completed_at - logged_at))) < $1 * 3600
        GROUP BY 1, 2, 3
        ORDER BY 1, 2, 3
      `,
      [WINDOW_HOURS],
    );

    console.log('');
    console.log('Logs per trigger source (inWindow = |offset| < 14 h):');
    console.table(totals.rows);

    console.log('Offset histogram (completed_at - logged_at, rounded hours):');
    console.table(histogram.rows);

    console.log(
      'Interpretation: SELF_INITIATED/UNKNOWN clustered at +8 h means dashboard logs were stored 8 h late (server in UTC); clustered at 0 h means no correction is needed.',
    );
  } finally {
    await client.query('ROLLBACK').catch(() => undefined);
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
