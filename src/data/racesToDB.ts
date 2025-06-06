import { createRace } from "@/lib/api/races/mutations";
import fs from "fs";
import { resolve } from "path";

const file = fs.readFileSync(resolve(__dirname, "./races2025.json"), { encoding: "utf-8" });
const races = JSON.parse(file);

races.response.forEach(async (race: any) => {
  await createRace({
    raceId: race.id,
    competitionId: race.competition.id,
    name: race.competition.name,
    country: race.competition.location.country,
    city: race.competition.location.city,
    circuit: race.circuit.name,
    circuitImg: race.circuit.image,
    season: race.season,
    date: new Date(race.date),
    lockedAt: null,
  });
});
