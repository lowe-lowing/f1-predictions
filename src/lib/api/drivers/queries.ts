import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { type DriverId, driverIdSchema, drivers } from "@/lib/db/schema/drivers";

export const getDrivers = async () => {
  const rows = await db.select().from(drivers);
  const d = rows
  return { drivers: d };
};

export const getDriverById = async (id: DriverId) => {
  const { id: driverId } = driverIdSchema.parse({ id });
  const [row] = await db.select().from(drivers).where(eq(drivers.id, driverId));
  if (row === undefined) return {};
  const d = row;
  return { driver: d };
};


