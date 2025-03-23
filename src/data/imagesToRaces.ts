import { db } from "@/lib/db";
import { races } from "@/lib/db/schema/races";
import { eq } from "drizzle-orm";
import fs from "fs";
import { resolve } from "path";

const file = fs.readFileSync(resolve(__dirname, "./races2025.json"), { encoding: "utf-8" });
const parsedRaces = JSON.parse(file);

const parsedRaceData = parsedRaces.response as any[];

parsedRaceData.forEach(async (race: any, i: number) => {
  const raceId = race.id;
  const image = race.circuit.image;

  await db.update(races).set({ circuitImg: image }).where(eq(races.raceId, raceId));
});
