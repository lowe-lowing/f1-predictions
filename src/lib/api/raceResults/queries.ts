import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { type RaceResultId, raceResultIdSchema, raceResults } from "@/lib/db/schema/raceResults";
import { races } from "@/lib/db/schema/races";
import { drivers } from "@/lib/db/schema/drivers";

export const getRaceResults = async () => {
  const rows = await db
    .select({ raceResult: raceResults, race: races, driver: drivers })
    .from(raceResults)
    .leftJoin(races, eq(raceResults.raceId, races.id))
    .leftJoin(drivers, eq(raceResults.driverId, drivers.id));
  const r = rows.map((r) => ({ ...r.raceResult, race: r.race, driver: r.driver }));
  return { raceResults: r };
};

export const getRaceResultById = async (id: RaceResultId) => {
  const { id: raceResultId } = raceResultIdSchema.parse({ id });
  const [row] = await db
    .select({ raceResult: raceResults, race: races, driver: drivers })
    .from(raceResults)
    .where(eq(raceResults.id, raceResultId))
    .leftJoin(races, eq(raceResults.raceId, races.id))
    .leftJoin(drivers, eq(raceResults.driverId, drivers.id));
  if (row === undefined) return {};
  const r = { ...row.raceResult, race: row.race, driver: row.driver };
  return { raceResult: r };
};

export type RaceResultsWithDriver = Awaited<ReturnType<typeof getRaceResultsByRaceId>>["raceResults"][number];

export const getRaceResultsByRaceId = async (raceId: string) => {
  const rows = await db
    .select({ raceResult: raceResults, driver: drivers })
    .from(raceResults)
    .where(eq(raceResults.raceId, raceId))
    .leftJoin(drivers, eq(raceResults.driverId, drivers.id))
    .orderBy(raceResults.position);
  const r = rows.map((r) => ({ ...r.raceResult, driver: r.driver }));
  return { raceResults: r };
};
