import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { type RaceId, raceIdSchema, races } from "@/lib/db/schema/races";

export const getRaces = async () => {
  const rows = await db.select().from(races);
  const r = rows
  return { races: r };
};

export const getRaceById = async (id: RaceId) => {
  const { id: raceId } = raceIdSchema.parse({ id });
  const [row] = await db.select().from(races).where(eq(races.id, raceId));
  if (row === undefined) return {};
  const r = row;
  return { race: r };
};


