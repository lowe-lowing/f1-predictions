import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  SeasonPointId, 
  NewSeasonPointParams,
  UpdateSeasonPointParams, 
  updateSeasonPointSchema,
  insertSeasonPointSchema, 
  seasonPoints,
  seasonPointIdSchema 
} from "@/lib/db/schema/seasonPoints";
import { getUserAuth } from "@/lib/auth/utils";

export const createSeasonPoint = async (seasonPoint: NewSeasonPointParams) => {
  const { session } = await getUserAuth();
  const newSeasonPoint = insertSeasonPointSchema.parse({ ...seasonPoint, userId: session?.user.id! });
  try {
    const [s] =  await db.insert(seasonPoints).values(newSeasonPoint).returning();
    return { seasonPoint: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateSeasonPoint = async (id: SeasonPointId, seasonPoint: UpdateSeasonPointParams) => {
  const { session } = await getUserAuth();
  const { id: seasonPointId } = seasonPointIdSchema.parse({ id });
  const newSeasonPoint = updateSeasonPointSchema.parse({ ...seasonPoint, userId: session?.user.id! });
  try {
    const [s] =  await db
     .update(seasonPoints)
     .set({...newSeasonPoint, updatedAt: new Date() })
     .where(and(eq(seasonPoints.id, seasonPointId!), eq(seasonPoints.userId, session?.user.id!)))
     .returning();
    return { seasonPoint: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteSeasonPoint = async (id: SeasonPointId) => {
  const { session } = await getUserAuth();
  const { id: seasonPointId } = seasonPointIdSchema.parse({ id });
  try {
    const [s] =  await db.delete(seasonPoints).where(and(eq(seasonPoints.id, seasonPointId!), eq(seasonPoints.userId, session?.user.id!)))
    .returning();
    return { seasonPoint: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

