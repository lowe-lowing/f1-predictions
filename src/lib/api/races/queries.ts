import { db } from "@/lib/db/index";
import { eq, gte, asc } from "drizzle-orm";
import { type RaceId, raceIdSchema, races } from "@/lib/db/schema/races";
import { predictions } from "@/lib/db/schema/predictions";
import { alias } from "drizzle-orm/pg-core";
import { drivers } from "@/lib/db/schema/drivers";
import { users } from "@/lib/db/schema/auth";

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

  const racePredictions = await db
    .select()
    .from(predictions)
    .where(eq(predictions.raceId, nextRace.id))
    .innerJoin(users, eq(users.id, predictions.userId))
    .leftJoin(pos1Driver, eq(pos1Driver.id, predictions.pos1DriverId))
    .leftJoin(pos2Driver, eq(pos2Driver.id, predictions.pos2DriverId))
    .leftJoin(pos3Driver, eq(pos3Driver.id, predictions.pos3DriverId))
    .leftJoin(pos4Driver, eq(pos4Driver.id, predictions.pos4DriverId))
    .leftJoin(pos5Driver, eq(pos5Driver.id, predictions.pos5DriverId));

  return { nextRace, racePredictions };
};
