import { createDriver } from "@/lib/api/drivers/mutations";
import { env } from "@/lib/env.mjs";
import axios from "axios";

const drivers = [
  "Max Verstappen",
  "Fernando Alonso",
  "Lance Stroll",
  "Charles Leclerc",
  "Lewis Hamilton",
  "Esteban Ocon",
  "Ollie Bearman",
  "Nico Hulkenberg",
  "Gabriel Bortoleto",
  "Lando Norris",
  "Oscar Piastri",
  "George Russell",
  "Andrea Kimi Antonelli",
  "Isack Hadjar",
  "Yuki Tsunoda",
  "Liam Lawson",
  "Pierre Gasly",
  "Jack Doohan",
  "Alexander Albon",
  "Carlos Sainz",
];
// const first10Drivers = drivers.slice(0, 10);
// const last10Drivers = drivers.slice(10, 20);

// Gabriel Bortoleto, Ollie Bearman not found
// await getAndAddDriver("Ollie Bearman");
// await getDriverAndLog("Bortoleto");

// drivers.forEach((driver, i) => {
//   setTimeout(async () => {
//     console.log(`${i}. Adding driver: `, driver, "...");
//     await getAndAddDriver(driver);
//     console.log(`${i}. Driver added: `, driver, "\n");
//   }, i * 10000); // 10 seconds interval
// });

async function getAndAddDriver(name: string) {
  const url = `https://api-formula-1.p.rapidapi.com/drivers?search=${name}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": env.RAPIDAPI_KEY,
      "x-rapidapi-host": "api-formula-1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios(url, options);
    const result = response.data.response;
    // console.log(result);
    // if (result.length === 0) {
    //   console.log("Driver not found: ", name);
    //   return;
    // }

    await createDriver({
      number: result[0].number,
      name: result[0].name,
      image: result[0].image,
      team: result[0].teams.length > 0 ? result[0].teams[0].team.name : null,
      season: 2025,
    });
    // const fs = require('fs');
    // fs.writeFileSync('drivers2025.json', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }
}

async function getDriverAndLog(name: string) {
  const url = `https://api-formula-1.p.rapidapi.com/drivers?search=${name}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": env.RAPIDAPI_KEY,
      "x-rapidapi-host": "api-formula-1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios(url, options);
    const result = response.data;
    console.log(result);
    // const fs = require('fs');
    // fs.writeFileSync('drivers2025.json', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }
}
