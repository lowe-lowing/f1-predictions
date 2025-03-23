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

  type PosDrivers = typeof pos1Driver | typeof pos2Driver | typeof pos3Driver | typeof pos4Driver | typeof pos5Driver;
  type PosPoints = typeof pos1Point | typeof pos2Point | typeof pos3Point | typeof pos4Point | typeof pos5Point;

  const posDriver = (driver: PosDrivers, point: PosPoints, position: number) => ({
    id: driver.id,
    name: driver.name,
    image: driver.image,
    team: driver.team,
    points: sql<number>`
        (CASE WHEN ${point.driverId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${point.pointForPosition} = ${position} THEN 1 ELSE 0 END)`,
  });

  const rows = await db
    .selectDistinctOn([predictions.id], {
      id: predictions.id,
      race: {
        id: races.id,
        name: races.name,
      },
      pos1Driver: posDriver(pos1Driver, pos1Point, 1),
      pos2Driver: posDriver(pos2Driver, pos2Point, 2),
      pos3Driver: posDriver(pos3Driver, pos3Point, 3),
      pos4Driver: posDriver(pos4Driver, pos4Point, 4),
      pos5Driver: posDriver(pos5Driver, pos5Point, 5),
    })
    .from(predictions)
    .where(eq(predictions.userId, session?.user.id!))
    .innerJoin(races, eq(predictions.raceId, races.id))
    .leftJoin(pos1Driver, eq(pos1Driver.id, predictions.pos1DriverId))
    .leftJoin(pos2Driver, eq(pos2Driver.id, predictions.pos2DriverId))
    .leftJoin(pos3Driver, eq(pos3Driver.id, predictions.pos3DriverId))
    .leftJoin(pos4Driver, eq(pos4Driver.id, predictions.pos4DriverId))
    .leftJoin(pos5Driver, eq(pos5Driver.id, predictions.pos5DriverId))
    .leftJoin(pos1Point, and(eq(pos1Point.raceId, races.id), eq(pos1Point.driverId, pos1Driver.id)))
    .leftJoin(pos2Point, and(eq(pos2Point.raceId, races.id), eq(pos2Point.driverId, pos2Driver.id)))
    .leftJoin(pos3Point, and(eq(pos3Point.raceId, races.id), eq(pos3Point.driverId, pos3Driver.id)))
    .leftJoin(pos4Point, and(eq(pos4Point.raceId, races.id), eq(pos4Point.driverId, pos4Driver.id)))
    .leftJoin(pos5Point, and(eq(pos5Point.raceId, races.id), eq(pos5Point.driverId, pos5Driver.id)));

  const p = rows;
  return { predictions: p };
};
