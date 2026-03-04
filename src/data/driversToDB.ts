import { createDriver } from "@/lib/api/drivers/mutations";
import fs from "fs";
import { resolve } from "path";

const file = fs.readFileSync(resolve(__dirname, "./drivers2026.json"), { encoding: "utf-8" });
const fileDrivers = JSON.parse(file);

fileDrivers.response.forEach(async (ranking: any) => {
  const driver = ranking.driver;
  const team = ranking.team;
  await createDriver({
    number: driver.number,
    name: driver.name,
    image: driver.image,
    team: team ? team.name : null,
    season: 2026,
    active: true,
  });
});
