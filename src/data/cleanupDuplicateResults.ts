// One-off cleanup of duplicate race_results rows (2026 season).
//
// Results were saved twice for most races: once right after the race and again the next day,
// and the second save inserted new rows instead of replacing the first. This keeps only the
// newest import batch for each race and fixes one row the F1 API mislabelled.
//
// Dry run (default):  npx tsx --tsconfig tsconfig.json src/data/cleanupDuplicateResults.ts
// Apply:              npx tsx --tsconfig tsconfig.json src/data/cleanupDuplicateResults.ts --apply
//
// Every affected row is written to race_results_backup_<timestamp>.json before anything changes,
// and everything runs in one transaction that rolls back unless the result is fully de-duplicated.
import "dotenv/config";
import { db } from "@/lib/db/index";
import { sql } from "drizzle-orm";
import fs from "fs";

const APPLY = process.argv.includes("--apply");

// Rows from an older import batch (grouped by minute) than the newest one for the same race
const STALE_ROWS = sql`
  select rr.id from race_results rr
  join (select race_id, max(date_trunc('minute', created_at)) as latest from race_results group by race_id) b
    on b.race_id = rr.race_id
  where date_trunc('minute', rr.created_at) < b.latest`;

// Netherlands GP 2026: the API returned Albon twice. The P11 "Racing Bulls" entry was Yuki Tsunoda,
// who took the second VCARB seat after Lawson moved to Red Bull.
const NETHERLANDS_P11_ROW = "B6ZuVudpPKLcZAPpcbPRM";

const main = async () => {
  const [tsunoda, ...others] = (
    await db.execute<{ id: string }>(sql`select id from drivers where name = 'Yuki Tsunoda' and season = 2026`)
  ).rows;
  if (!tsunoda || others.length) throw new Error("Expected exactly one 2026 Yuki Tsunoda driver record");

  const stale = await db.execute(sql`
    select r.name as race, d.name as driver, rr.position, rr.time, rr.created_at
    from race_results rr join races r on r.id = rr.race_id join drivers d on d.id = rr.driver_id
    where rr.id in (${STALE_ROWS}) order by r.date, rr.position`);
  const perRace = stale.rows.reduce<Record<string, number>>((acc, row) => {
    const race = row.race as string;
    acc[race] = (acc[race] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Stale rows to delete: ${stale.rows.length}`);
  console.table(perRace);

  const nlRow = await db.execute(sql`
    select d.name as driver, rr.position, rr.time from race_results rr join drivers d on d.id = rr.driver_id
    where rr.id = ${NETHERLANDS_P11_ROW}`);
  console.log("Netherlands row to reassign to Yuki Tsunoda:", nlRow.rows[0] ?? "not found (already fixed?)");

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to make these changes.");
    return;
  }

  const backup = await db.execute(sql`select * from race_results where id in (${STALE_ROWS}) or id = ${NETHERLANDS_P11_ROW}`);
  const backupFile = `race_results_backup_${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(backup.rows, null, 2));
  console.log(`\nBacked up ${backup.rows.length} rows to ${backupFile}`);

  await db.transaction(async (tx) => {
    const deleted = await tx.execute(sql`delete from race_results where id in (${STALE_ROWS}) returning id`);
    if (deleted.rows.length !== stale.rows.length) throw new Error("Delete count changed since the dry run, rolling back");
    console.log(`Deleted ${deleted.rows.length} rows`);

    const updated = await tx.execute(sql`
      update race_results set driver_id = ${tsunoda.id}, updated_at = now()
      where id = ${NETHERLANDS_P11_ROW} and position = 11 returning id`);
    console.log(updated.rows.length ? "Reassigned Netherlands P11 to Yuki Tsunoda" : "Netherlands row already fixed");

    const dupeDrivers = await tx.execute(sql`
      select race_id from race_results group by race_id, driver_id having count(*) > 1`);
    const dupePositions = await tx.execute(sql`
      select race_id from race_results where position is not null group by race_id, position having count(*) > 1`);
    if (dupeDrivers.rows.length || dupePositions.rows.length) {
      throw new Error(
        `Still ${dupeDrivers.rows.length} duplicate drivers / ${dupePositions.rows.length} duplicate positions, rolling back`
      );
    }
  });
  console.log("Done. No duplicate drivers or positions remain.");
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
