import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import { drivers } from "@/lib/db/schema/drivers";
import { pointHistory } from "@/lib/db/schema/pointHistory";
import { type PredictionId, predictionIdSchema, predictions } from "@/lib/db/schema/predictions";
import { races } from "@/lib/db/schema/races";
import { seasonPoints } from "@/lib/db/schema/seasonPoints";
import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const getPredictions = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select().from(predictions).where(eq(predictions.userId, session?.user.id!));
  const p = rows;
  return { predictions: p };
};

export const getPredictionById = async (id: PredictionId) => {
  const { session } = await getUserAuth();
  const { id: predictionId } = predictionIdSchema.parse({ id });
  const [row] = await db
    .select()
    .from(predictions)
    .where(and(eq(predictions.id, predictionId), eq(predictions.userId, session?.user.id!)));
  if (row === undefined) return {};
  const p = row;
  return { prediction: p };
};

export type PredictionFull = Awaited<ReturnType<typeof getPredictionsFull>>["predictions"][number];

export const getPredictionsFull = async () => {
  const { session } = await getUserAuth();

  const pos1Driver = alias(drivers, "pos1Driver");
  const pos2Driver = alias(drivers, "pos2Driver");
  const pos3Driver = alias(drivers, "pos3Driver");
  const pos4Driver = alias(drivers, "pos4Driver");
  const pos5Driver = alias(drivers, "pos5Driver");

  const pos1Point = alias(pointHistory, "pos1Point");
  const pos2Point = alias(pointHistory, "pos2Point");
  const pos3Point = alias(pointHistory, "pos3Point");
  const pos4Point = alias(pointHistory, "pos4Point");
  const pos5Point = alias(pointHistory, "pos5Point");

  const rows = await db
    .selectDistinctOn([predictions.id], {
      id: predictions.id,
      race: {
        id: races.id,
        name: races.name,
      },
      pos1Driver: {
        id: pos1Driver.id,
        name: pos1Driver.name,
        image: pos1Driver.image,
        team: pos1Driver.team,
        points: sql<number>`
        (CASE WHEN ${pos1Point.driverId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${pos1Point.pointForPosition} = 1 THEN 1 ELSE 0 END)`,
      },
      pos2Driver: {
        id: pos2Driver.id,
        name: pos2Driver.name,
        image: pos2Driver.image,
        team: pos2Driver.team,
        points: sql<number>`
        (CASE WHEN ${pos2Point.driverId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${pos2Point.pointForPosition} = 2 THEN 1 ELSE 0 END)`,
      },
      pos3Driver: {
        id: pos3Driver.id,
        name: pos3Driver.name,
        image: pos3Driver.image,
        team: pos3Driver.team,
        points: sql<number>`
        (CASE WHEN ${pos3Point.driverId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${pos3Point.pointForPosition} = 3 THEN 1 ELSE 0 END)`,
      },
      pos4Driver: {
        id: pos4Driver.id,
        name: pos4Driver.name,
        image: pos4Driver.image,
        team: pos4Driver.team,
        points: sql<number>`
        (CASE WHEN ${pos4Point.driverId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${pos4Point.pointForPosition} = 4 THEN 1 ELSE 0 END)`,
      },
      pos5Driver: {
        id: pos5Driver.id,
        name: pos5Driver.name,
        image: pos5Driver.image,
        team: pos5Driver.team,
        points: sql<number>`
        (CASE WHEN ${pos5Point.driverId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${pos5Point.pointForPosition} = 5 THEN 1 ELSE 0 END)`,
      },
    })
    .from(predictions)
    .where(eq(predictions.userId, session?.user.id!))
    .innerJoin(races, eq(predictions.raceId, races.id))
    .innerJoin(seasonPoints, and(eq(seasonPoints.userId, session?.user.id!), eq(seasonPoints.year, races.season)))
    .leftJoin(pos1Driver, eq(pos1Driver.id, predictions.pos1DriverId))
    .leftJoin(pos2Driver, eq(pos2Driver.id, predictions.pos2DriverId))
    .leftJoin(pos3Driver, eq(pos3Driver.id, predictions.pos3DriverId))
    .leftJoin(pos4Driver, eq(pos4Driver.id, predictions.pos4DriverId))
    .leftJoin(pos5Driver, eq(pos5Driver.id, predictions.pos5DriverId))
    .leftJoin(pos1Point, and(eq(pos1Point.seasonPointId, seasonPoints.id), eq(pos1Point.driverId, pos1Driver.id)))
    .leftJoin(pos2Point, and(eq(pos2Point.seasonPointId, seasonPoints.id), eq(pos2Point.driverId, pos2Driver.id)))
    .leftJoin(pos3Point, and(eq(pos3Point.seasonPointId, seasonPoints.id), eq(pos3Point.driverId, pos3Driver.id)))
    .leftJoin(pos4Point, and(eq(pos4Point.seasonPointId, seasonPoints.id), eq(pos4Point.driverId, pos4Driver.id)))
    .leftJoin(pos5Point, and(eq(pos5Point.seasonPointId, seasonPoints.id), eq(pos5Point.driverId, pos5Driver.id)));

  const p = rows;
  return { predictions: p };
};
