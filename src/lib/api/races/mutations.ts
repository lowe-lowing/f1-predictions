import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { 
  RaceId, 
  NewRaceParams,
  UpdateRaceParams, 
  updateRaceSchema,
  insertRaceSchema, 
  races,
  raceIdSchema 
} from "@/lib/db/schema/races";

export const createRace = async (race: NewRaceParams) => {
  const newRace = insertRaceSchema.parse(race);
  try {
    const [r] =  await db.insert(races).values(newRace).returning();
    return { race: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateRace = async (id: RaceId, race: UpdateRaceParams) => {
  const { id: raceId } = raceIdSchema.parse({ id });
  const newRace = updateRaceSchema.parse(race);
  try {
    const [r] =  await db
     .update(races)
     .set(newRace)
     .where(eq(races.id, raceId!))
     .returning();
    return { race: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteRace = async (id: RaceId) => {
  const { id: raceId } = raceIdSchema.parse({ id });
  try {
    const [r] =  await db.delete(races).where(eq(races.id, raceId!))
    .returning();
    return { race: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

