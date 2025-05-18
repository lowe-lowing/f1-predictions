import { db } from "@/lib/db/index";
import { eq, gte, asc, and, sql } from "drizzle-orm";
import { type RaceId, raceIdSchema, races } from "@/lib/db/schema/races";
import { predictions } from "@/lib/db/schema/predictions";
import { alias } from "drizzle-orm/pg-core";
import { drivers } from "@/lib/db/schema/drivers";
import { users } from "@/lib/db/schema/auth";
import { pointHistory } from "@/lib/db/schema/pointHistory";
import { seasonPoints } from "@/lib/db/schema/seasonPoints";

export const getRaces = async () => {
  const rows = await db.select().from(races);
  const r = rows;
  return { races: r };
};

export const getRacesByYear = async (year: number) => {
  const rows = await db.select().from(races).where(eq(races.season, year)).orderBy(asc(races.date));
  const r = rows;
  return { races: r };
};

export const getRaceById = async (id: RaceId) => {
  const { id: raceId } = raceIdSchema.parse({ id });
  const [row] = await db.select().from(races).where(eq(races.id, raceId));
  if (row === undefined) return {};
  const r = row;
  return { race: r };
};

export const getNextRace = async () => {
  const today = new Date();
  const [nextRace] = await db.select().from(races).where(gte(races.date, today)).orderBy(asc(races.date)).limit(1);
  if (nextRace === undefined) return {};
  const r = nextRace;
  return { nextRace: r };
};

type GetNextRaceAndUsersPredictionsType = Awaited<ReturnType<typeof getNextRaceAndUsersPredictions>>;
export type RacePrediction = NonNullable<GetNextRaceAndUsersPredictionsType["racePredictions"]>[number];

export const getNextRaceAndUsersPredictions = async () => {
  const today = new Date();
  today.setHours(new Date().getHours() - 3);
  const [nextRace] = await db.select().from(races).where(gte(races.date, today)).orderBy(asc(races.date)).limit(1);
  if (nextRace === undefined) return {};

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

  const racePredictions = await db
    .selectDistinctOn([predictions.id], {
      id: predictions.id,
      userName: users.name,
      pos1Driver: posDriver(pos1Driver, pos1Point, 1),
      pos2Driver: posDriver(pos2Driver, pos2Point, 2),
      pos3Driver: posDriver(pos3Driver, pos3Point, 3),
      pos4Driver: posDriver(pos4Driver, pos4Point, 4),
      pos5Driver: posDriver(pos5Driver, pos5Point, 5),
    })
    .from(predictions)
    .where(eq(predictions.raceId, nextRace.id))
    .innerJoin(users, eq(users.id, predictions.userId))
    .innerJoin(races, eq(predictions.raceId, races.id))
    .innerJoin(seasonPoints, and(eq(seasonPoints.userId, users.id), eq(seasonPoints.year, races.season)))
    .leftJoin(pos1Driver, eq(pos1Driver.id, predictions.pos1DriverId))
    .leftJoin(pos2Driver, eq(pos2Driver.id, predictions.pos2DriverId))
    .leftJoin(pos3Driver, eq(pos3Driver.id, predictions.pos3DriverId))
    .leftJoin(pos4Driver, eq(pos4Driver.id, predictions.pos4DriverId))
    .leftJoin(pos5Driver, eq(pos5Driver.id, predictions.pos5DriverId))
    .leftJoin(
      pos1Point,
      and(
        eq(pos1Point.seasonPointId, seasonPoints.id),
        eq(pos1Point.raceId, races.id),
        eq(pos1Point.driverId, pos1Driver.id)
      )
    )
    .leftJoin(
      pos2Point,
      and(
        eq(pos2Point.seasonPointId, seasonPoints.id),
        eq(pos2Point.raceId, races.id),
        eq(pos2Point.driverId, pos2Driver.id)
      )
    )
    .leftJoin(
      pos3Point,
      and(
        eq(pos3Point.seasonPointId, seasonPoints.id),
        eq(pos3Point.raceId, races.id),
        eq(pos3Point.driverId, pos3Driver.id)
      )
    )
    .leftJoin(
      pos4Point,
      and(
        eq(pos4Point.seasonPointId, seasonPoints.id),
        eq(pos4Point.raceId, races.id),
        eq(pos4Point.driverId, pos4Driver.id)
      )
    )
    .leftJoin(
      pos5Point,
      and(
        eq(pos5Point.seasonPointId, seasonPoints.id),
        eq(pos5Point.raceId, races.id),
        eq(pos5Point.driverId, pos5Driver.id)
      )
    );

  return { nextRace, racePredictions };
};
