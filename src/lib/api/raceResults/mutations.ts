import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { 
  RaceResultId, 
  NewRaceResultParams,
  UpdateRaceResultParams, 
  updateRaceResultSchema,
  insertRaceResultSchema, 
  raceResults,
  raceResultIdSchema 
} from "@/lib/db/schema/raceResults";

export const createRaceResult = async (raceResult: NewRaceResultParams) => {
  const newRaceResult = insertRaceResultSchema.parse(raceResult);
  try {
    const [r] =  await db.insert(raceResults).values(newRaceResult).returning();
    return { raceResult: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateRaceResult = async (id: RaceResultId, raceResult: UpdateRaceResultParams) => {
  const { id: raceResultId } = raceResultIdSchema.parse({ id });
  const newRaceResult = updateRaceResultSchema.parse(raceResult);
  try {
    const [r] =  await db
     .update(raceResults)
     .set({...newRaceResult, updatedAt: new Date() })
     .where(eq(raceResults.id, raceResultId!))
     .returning();
    return { raceResult: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteRaceResult = async (id: RaceResultId) => {
  const { id: raceResultId } = raceResultIdSchema.parse({ id });
  try {
    const [r] =  await db.delete(raceResults).where(eq(raceResults.id, raceResultId!))
    .returning();
    return { raceResult: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

