import { createRace } from "@/lib/api/races/mutations";
import fs from "fs";
import { resolve } from "path";

// races2026.json fetched from https://api-formula-1.p.rapidapi.com/races?season=2026&type=race
const file = fs.readFileSync(resolve(__dirname, "./races2026.json"), { encoding: "utf-8" });
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
