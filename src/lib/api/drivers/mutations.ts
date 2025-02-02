import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { 
  DriverId, 
  NewDriverParams,
  UpdateDriverParams, 
  updateDriverSchema,
  insertDriverSchema, 
  drivers,
  driverIdSchema 
} from "@/lib/db/schema/drivers";

export const createDriver = async (driver: NewDriverParams) => {
  const newDriver = insertDriverSchema.parse(driver);
  try {
    const [d] =  await db.insert(drivers).values(newDriver).returning();
    return { driver: d };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateDriver = async (id: DriverId, driver: UpdateDriverParams) => {
  const { id: driverId } = driverIdSchema.parse({ id });
  const newDriver = updateDriverSchema.parse(driver);
  try {
    const [d] =  await db
     .update(drivers)
     .set({...newDriver, updatedAt: new Date() })
     .where(eq(drivers.id, driverId!))
     .returning();
    return { driver: d };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteDriver = async (id: DriverId) => {
  const { id: driverId } = driverIdSchema.parse({ id });
  try {
    const [d] =  await db.delete(drivers).where(eq(drivers.id, driverId!))
    .returning();
    return { driver: d };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

