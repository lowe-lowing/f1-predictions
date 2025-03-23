// loop through races from races2024.json
// if not already in database, add race to database...
// get the results for the race and add them to the database

// may need to find the driverId for each result
import { createDriver } from "@/lib/api/drivers/mutations";
import { getDriverByNumber } from "@/lib/api/drivers/queries";
import { createRaceResult } from "@/lib/api/raceResults/mutations";
import { createRace } from "@/lib/api/races/mutations";
import axios from "axios";
import fs from "fs";
import { resolve } from "path";

// const file = fs.readFileSync(resolve(__dirname, "./races2024.json"), { encoding: "utf-8" });
// const races = JSON.parse(file);

// const raceArr = races.response as any[];
// const sliceRaces = raceArr.slice(11, raceArr.length);

// sliceRaces.forEach(async (race: any, i: number) => {
//   setTimeout(async () => {
//     console.log(`[${i + 1}] Race: ${race.competition.name}...`);
//     const { race: createdRace } = await createRace({
//       raceId: race.id,
//       competitionId: race.competition.id,
//       name: race.competition.name,
//       country: race.competition.location.country,
//       city: race.competition.location.city,
//       circuit: race.circuit.name,
//       season: race.season,
//       date: new Date(race.date),
//       lockedAt: null,
//     });
//     console.log("Race created");
//     console.log("Getting results");

//     await insertResultsByRaceId(race.id, createdRace.id);
//   }, i * 10000); // 10 seconds interval
// });

// for inserting results for existing race
// await insertResultsByRaceId("2337", "Ik8hecN7OHXS3ylSB2FLQ");

async function insertResultsByRaceId(raceId: string, dbId: string) {
  const options = {
    params: { race: raceId },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "api-formula-1.p.rapidapi.com",
    },
  };
  const { data } = await axios.get("https://api-formula-1.p.rapidapi.com/rankings/races", options);
  const results = data.response;

  results.forEach(async (result: any) => {
    let { driver } = await getDriverByNumber(result.driver.number);
    if (!driver) {
      console.log(`Driver not found: ${result.driver.name}`);
      const { driver: createdDriver } = await createDriver({
        number: result.driver.number,
        name: result.driver.name,
        image: result.driver.image,
        team: result.team.name,
      });
      console.log(`Driver created: ${createdDriver.name}`);

      driver = createdDriver;
    }
    await createRaceResult({
      raceId: dbId,
      driverId: driver.id,
      position: result.position,
      time: result.time,
      laps: result.laps,
      grid: result.grid,
    });
    console.log(`[race_result] Position: ${result.position}, ${driver.name}`);
  });
}
