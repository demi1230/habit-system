const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { Client } = require('pg');

function parseArgs(argv) {
  if (argv.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const findOptionValue = (name) => {
    const directMatch = argv.find((arg) => arg.startsWith(`${name}=`));
    if (directMatch) {
      return directMatch.slice(name.length + 1);
    }

    const flagIndex = argv.indexOf(name);
    if (flagIndex === -1) {
      return null;
    }

    return argv[flagIndex + 1] ?? null;
  };

  const previewRaw = findOptionValue('--preview');
  const preview =
    previewRaw && Number.isFinite(Number(previewRaw))
      ? Math.max(1, Number(previewRaw))
      : 10;

  return {
    apply: argv.includes('--apply'),
    habitId: findOptionValue('--habit-id'),
    preview,
  };
}

function printHelp() {
  console.log(`Cleanup duplicate habit logs.

Usage:
  npm run cleanup:habit-log-dupes
  npm run cleanup:habit-log-dupes -- --apply
  npm run cleanup:habit-log-dupes -- --habit-id=<uuid> --preview=20

Behavior:
  - Groups logs by habit + local calendar day
  - Keeps the latest log for each day using completedAt desc, loggedAt desc
  - Repoints related difficulty feedback and reflections to the kept log
  - Deletes the older duplicate logs
  - Runs in dry-run mode unless --apply is provided
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
      'DATABASE_URL is an Accelerate URL. Please also set DIRECT_DATABASE_URL or DIRECT_URL for this cleanup script.',
    );
  }

  return directUrl;
}

function toLocalDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function compareLogsDesc(left, right) {
  const completedDiff = right.completedAt.getTime() - left.completedAt.getTime();
  if (completedDiff !== 0) {
    return completedDiff;
  }

  const loggedDiff = right.loggedAt.getTime() - left.loggedAt.getTime();
  if (loggedDiff !== 0) {
    return loggedDiff;
  }

  return right.id.localeCompare(left.id);
}

function buildDuplicatePlans(logs) {
  const grouped = new Map();

  for (const log of logs) {
    const dayKey = toLocalDayKey(log.completedAt);
    const groupKey = `${log.habitId}:${dayKey}`;
    const current = grouped.get(groupKey) ?? [];
    current.push(log);
    grouped.set(groupKey, current);
  }

  const plans = [];

  for (const [groupKey, groupLogs] of grouped.entries()) {
    if (groupLogs.length < 2) {
      continue;
    }

    const sortedLogs = [...groupLogs].sort(compareLogsDesc);
    const [keep, ...drop] = sortedLogs;
    const separatorIndex = groupKey.lastIndexOf(':');

    plans.push({
      habitId: groupKey.slice(0, separatorIndex),
      dayKey: groupKey.slice(separatorIndex + 1),
      keep,
      drop,
    });
  }

  return plans.sort((left, right) => {
    const habitDiff = left.habitId.localeCompare(right.habitId);
    if (habitDiff !== 0) {
      return habitDiff;
    }

    return left.dayKey.localeCompare(right.dayKey);
  });
}

function buildCountMap(rows) {
  const counts = new Map();
  for (const row of rows) {
    counts.set(row.logId, (counts.get(row.logId) ?? 0) + 1);
  }
  return counts;
}

function summarizePlans(plans, feedbackCounts, reflectionCounts) {
  let droppedLogCount = 0;
  let movedFeedbackCount = 0;
  let movedReflectionCount = 0;

  for (const plan of plans) {
    droppedLogCount += plan.drop.length;

    for (const log of plan.drop) {
      movedFeedbackCount += feedbackCounts.get(log.id) ?? 0;
      movedReflectionCount += reflectionCounts.get(log.id) ?? 0;
    }
  }

  return {
    duplicateDayCount: plans.length,
    droppedLogCount,
    movedFeedbackCount,
    movedReflectionCount,
  };
}

function printPreview(plans, feedbackCounts, reflectionCounts, preview) {
  if (plans.length === 0) {
    return;
  }

  console.log('');
  console.log(`Previewing first ${Math.min(preview, plans.length)} duplicate day(s):`);

  for (const plan of plans.slice(0, preview)) {
    const feedbackMoved = plan.drop.reduce(
      (sum, log) => sum + (feedbackCounts.get(log.id) ?? 0),
      0,
    );
    const reflectionsMoved = plan.drop.reduce(
      (sum, log) => sum + (reflectionCounts.get(log.id) ?? 0),
      0,
    );

    console.log(
      `- habit=${plan.habitId} day=${plan.dayKey} keep=${plan.keep.id} (${plan.keep.status}) drop=${plan.drop.length} feedbackMoves=${feedbackMoved} reflectionMoves=${reflectionsMoved}`,
    );
  }
}

async function fetchLogs(client, habitId) {
  const params = [];
  let whereClause = '';

  if (habitId) {
    params.push(habitId);
    whereClause = 'WHERE habit_id = $1';
  }

  const query = `
    SELECT
      id,
      habit_id AS "habitId",
      status,
      completed_at AS "completedAt",
      logged_at AS "loggedAt"
    FROM habit_logs
    ${whereClause}
    ORDER BY completed_at DESC, logged_at DESC, id DESC
  `;

  const result = await client.query(query, params);
  return result.rows.map((row) => ({
    id: row.id,
    habitId: row.habitId,
    status: row.status,
    completedAt: new Date(row.completedAt),
    loggedAt: new Date(row.loggedAt),
  }));
}

async function fetchRelationCounts(client, duplicateLogIds) {
  if (duplicateLogIds.length === 0) {
    return {
      feedbackCounts: new Map(),
      reflectionCounts: new Map(),
    };
  }

  const [feedbackRows, reflectionRows] = await Promise.all([
    client.query(
      `
        SELECT log_id AS "logId"
        FROM difficulty_feedbacks
        WHERE log_id = ANY($1::uuid[])
      `,
      [duplicateLogIds],
    ),
    client.query(
      `
        SELECT log_id AS "logId"
        FROM reflections
        WHERE log_id = ANY($1::uuid[])
      `,
      [duplicateLogIds],
    ),
  ]);

  return {
    feedbackCounts: buildCountMap(feedbackRows.rows),
    reflectionCounts: buildCountMap(reflectionRows.rows),
  };
}

async function applyPlans(client, plans) {
  let deletedLogs = 0;
  let movedFeedback = 0;
  let movedReflections = 0;

  for (const plan of plans) {
    const dropIds = plan.drop.map((log) => log.id);

    await client.query('BEGIN');
    try {
      const feedbackResult = await client.query(
        `
          UPDATE difficulty_feedbacks
          SET log_id = $1
          WHERE log_id = ANY($2::uuid[])
        `,
        [plan.keep.id, dropIds],
      );

      const reflectionResult = await client.query(
        `
          UPDATE reflections
          SET log_id = $1
          WHERE log_id = ANY($2::uuid[])
        `,
        [plan.keep.id, dropIds],
      );

      const deleteResult = await client.query(
        `
          DELETE FROM habit_logs
          WHERE id = ANY($1::uuid[])
        `,
        [dropIds],
      );

      await client.query('COMMIT');

      movedFeedback += feedbackResult.rowCount ?? 0;
      movedReflections += reflectionResult.rowCount ?? 0;
      deletedLogs += deleteResult.rowCount ?? 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  return { deletedLogs, movedFeedback, movedReflections };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  loadEnvironment();
  const client = new Client({
    connectionString: getConnectionString(),
  });

  await client.connect();

  try {
    const logs = await fetchLogs(client, options.habitId);
    const plans = buildDuplicatePlans(logs);
    const duplicateLogIds = plans.flatMap((plan) =>
      plan.drop.map((log) => log.id),
    );
    const { feedbackCounts, reflectionCounts } = await fetchRelationCounts(
      client,
      duplicateLogIds,
    );
    const summary = summarizePlans(plans, feedbackCounts, reflectionCounts);

    console.log(
      `Scanned ${logs.length} log(s)${
        options.habitId ? ` for habit ${options.habitId}` : ''
      }.`,
    );
    console.log(
      `Found ${summary.duplicateDayCount} duplicate day group(s), ${summary.droppedLogCount} extra log(s), ${summary.movedFeedbackCount} difficulty feedback row(s), ${summary.movedReflectionCount} reflection row(s).`,
    );

    printPreview(plans, feedbackCounts, reflectionCounts, options.preview);

    if (!options.apply) {
      console.log('');
      console.log(
        'Dry run only. Re-run with --apply to move related rows and delete duplicate logs.',
      );
      return;
    }

    if (plans.length === 0) {
      console.log('');
      console.log('Nothing to clean up.');
      return;
    }

    const result = await applyPlans(client, plans);

    console.log('');
    console.log(
      `Applied cleanup: deleted ${result.deletedLogs} duplicate log(s), moved ${result.movedFeedback} difficulty feedback row(s), moved ${result.movedReflections} reflection row(s).`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('');
  console.error('Duplicate habit log cleanup failed.');
  console.error(error);
  process.exit(1);
});
