import axios from "axios";

export async function getTop5ForRace(meetingKey: number) {
  const res = await axios<any[]>(`https://api.openf1.org/v1/position?meeting_key=${meetingKey}&position<=5`);

  const dateSorted = res.data.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const driverArr: any[] = [];

  dateSorted.forEach((item) => {
    const positionExists = driverArr.some((driver) => driver.position === item.position);
    if (!positionExists) {
      driverArr.push({
        position: item.position,
        driver: item.driver_number,
        date: item.date,
        sessionKey: item.session_key,
      });
    }
  });

  // Get the driver data from the database but if the driver is not found, get it from the API and add it to the database
  // Maybe have a seperate server that syncs all races, results, drivers, and calculates points
  // need to make a function to set a driver as disqualified and recalculate points
  const driverPromises = driverArr.map(async (driver) => {
    const driverRes = await axios<any[]>(
      `https://api.openf1.org/v1/drivers?driver_number=${driver.driver}&session_key=${driver.sessionKey}`
    );
    return {
      ...driver,
      driver: driverRes.data[0],
    };
  });

  const driverData = await Promise.all(driverPromises);

  const sortPosition = driverData.sort((a, b) => a.position - b.position);
  return sortPosition;
}

// get races by year
export async function getRacesForYear(year: number) {
  const res = await axios<any[]>(`https://api.openf1.org/v1/meetings?year=${year}`);
  return res.data;
}
