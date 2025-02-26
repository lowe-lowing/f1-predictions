import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { type PointHistoryId, pointHistoryIdSchema, pointHistory } from "@/lib/db/schema/pointHistory";
import { races } from "@/lib/db/schema/races";
import { drivers } from "@/lib/db/schema/drivers";
import { seasonPoints } from "@/lib/db/schema/seasonPoints";

export const getPointHistories = async () => {
  const rows = await db.select({ pointHistory: pointHistory, race: races, driver: drivers, seasonPoint: seasonPoints }).from(pointHistory).leftJoin(races, eq(pointHistory.raceId, races.id)).leftJoin(drivers, eq(pointHistory.driverId, drivers.id)).leftJoin(seasonPoints, eq(pointHistory.seasonPointId, seasonPoints.id));
  const p = rows .map((r) => ({ ...r.pointHistory, race: r.race, driver: r.driver, seasonPoint: r.seasonPoint})); 
  return { pointHistory: p };
};

export const getPointHistoryById = async (id: PointHistoryId) => {
  const { id: pointHistoryId } = pointHistoryIdSchema.parse({ id });
  const [row] = await db.select({ pointHistory: pointHistory, race: races, driver: drivers, seasonPoint: seasonPoints }).from(pointHistory).where(eq(pointHistory.id, pointHistoryId)).leftJoin(races, eq(pointHistory.raceId, races.id)).leftJoin(drivers, eq(pointHistory.driverId, drivers.id)).leftJoin(seasonPoints, eq(pointHistory.seasonPointId, seasonPoints.id));
  if (row === undefined) return {};
  const p =  { ...row.pointHistory, race: row.race, driver: row.driver, seasonPoint: row.seasonPoint } ;
  return { pointHistory: p };
};


