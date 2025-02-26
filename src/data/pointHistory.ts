import { getDrivers } from "@/lib/api/drivers/queries";
import { createPointHistory } from "@/lib/api/pointHistory/mutations";
import { getRaces } from "@/lib/api/races/queries";
import { getSeasonPoints } from "@/lib/api/seasonPoints/queries";
import { Driver } from "@/lib/db/schema/drivers";

const { drivers } = await getDrivers();
// const MaxVerstappen = drivers.find((driver) => driver.name === "Max Verstappen") as Driver;
const LewisHamilton = drivers.find((driver) => driver.name === "Lewis Hamilton") as Driver;

const { races } = await getRaces();
// get season point id
const { seasonPoints } = await getSeasonPoints();

await createPointHistory({
  driverId: LewisHamilton.id,
  raceId: races[0].id,
  seasonPointId: seasonPoints[0].id,
  pointForPosition: 2,
});

const { seasonPoints: seasonPoints2 } = await getSeasonPoints();
console.log(seasonPoints2[0].points);
