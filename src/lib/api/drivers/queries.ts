import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { type DriverId, driverIdSchema, drivers } from "@/lib/db/schema/drivers";

export const getDrivers = async () => {
  const rows = await db.select().from(drivers);
  const d = rows;
  return { drivers: d };
};

export const getDriversBySeason = async (season: number) => {
  const rows = await db
    .select()
    .from(drivers)
    .where(and(eq(drivers.season, season), eq(drivers.active, true)));
  const d = rows;
  return { drivers: d };
};

export const getDriversOrderedByTeamBySeason = async (season: number) => {
  const rows = await db.select().from(drivers).where(eq(drivers.season, season)).orderBy(drivers.team);
  const d = rows;
  return { drivers: d };
};

export const getDriverById = async (id: DriverId) => {
  const { id: driverId } = driverIdSchema.parse({ id });
  const [row] = await db.select().from(drivers).where(eq(drivers.id, driverId));
  if (row === undefined) return {};
  const d = row;
  return { driver: d };
};

export const getDriverByNumberAndSeason = async (number: number, season: number) => {
  const [row] = await db
    .select()
    .from(drivers)
    .where(and(eq(drivers.number, number), eq(drivers.season, season)));
  if (row === undefined) return {};
  const d = row;
  return { driver: d };
};
