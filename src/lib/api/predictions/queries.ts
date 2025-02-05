import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type PredictionId, predictionIdSchema, predictions } from "@/lib/db/schema/predictions";
import { races } from "@/lib/db/schema/races";
import { drivers } from "@/lib/db/schema/drivers";
import { alias } from "drizzle-orm/pg-core";

export const getPredictions = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select().from(predictions).where(eq(predictions.userId, session?.user.id!));
  const p = rows
  return { predictions: p };
};

export const getPredictionById = async (id: PredictionId) => {
  const { session } = await getUserAuth();
  const { id: predictionId } = predictionIdSchema.parse({ id });
  const [row] = await db.select().from(predictions).where(and(eq(predictions.id, predictionId), eq(predictions.userId, session?.user.id!)));
  if (row === undefined) return {};
  const p = row;
  return { prediction: p };
};

type PredictionsArray = Awaited<ReturnType<typeof getPredictionsFull>>["predictions"];
export type PredictionFull = PredictionsArray[number];

export const getPredictionsFull = async () => {
  const { session } = await getUserAuth();

  const pos1Driver = alias(drivers, "pos1Driver")
  const pos2Driver = alias(drivers, "pos2Driver")
  const pos3Driver = alias(drivers, "pos3Driver")
  const pos4Driver = alias(drivers, "pos4Driver")
  const pos5Driver = alias(drivers, "pos5Driver")

  const rows = await db.selectDistinctOn([predictions.id], {
    id: predictions.id,
    race: {
      id: races.id,
      name: races.name,
    },
    pos1Driver: {
      id: pos1Driver.id,
      name: pos1Driver.name
    },
    pos2Driver: {
      id: pos2Driver.id,
      name: pos2Driver.name
    },
    pos3Driver: {
      id: pos3Driver.id,
      name: pos3Driver.name
    },
    pos4Driver: {
      id: pos4Driver.id,
      name: pos4Driver.name
    },
    pos5Driver: {
      id: pos5Driver.id,
      name: pos5Driver.name
    },
    // include point history later
  })
    .from(predictions)
    .where(eq(predictions.userId, session?.user.id!))
    .innerJoin(races, eq(predictions.raceId, races.id))
    .leftJoin(pos1Driver, eq(pos1Driver.number, predictions.pos1Driver))
    .leftJoin(pos2Driver, eq(pos2Driver.number, predictions.pos2Driver))
    .leftJoin(pos3Driver, eq(pos3Driver.number, predictions.pos3Driver))
    .leftJoin(pos4Driver, eq(pos4Driver.number, predictions.pos4Driver))
    .leftJoin(pos5Driver, eq(pos5Driver.number, predictions.pos5Driver));

  const p = rows
  return { predictions: p };
}