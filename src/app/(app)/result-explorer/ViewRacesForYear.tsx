import { getRacesByYearAction } from "@/lib/actions/races";
import { Race } from "@/lib/db/schema/races";
import { Dispatch, useEffect, useState, type FC } from "react";

interface ViewRacesForYearProps {
  year: number;
  setSelectedRace: Dispatch<Race>;
}

const ViewRacesForYear: FC<ViewRacesForYearProps> = ({ year, setSelectedRace }) => {
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setRaces([]);
      const { races } = await getRacesByYearAction(year);
      setRaces(races);
      setIsLoading(false);
    };
    fetchData();
  }, [year]);

  return (
    <div className="space-y-4">
      {isLoading && <p>Loading...</p>}
      {races.map((race) => (
        <div
          onClick={() => {
            setSelectedRace(race);
            setRaces([]);
          }}
          key={race.id}
          className="bg-secondary p-4 rounded-sm shadow-sm cursor-pointer"
        >
          <p>
            <strong>Name:</strong> {race.name}
          </p>
          <p>
            <strong>Circuit:</strong> {race.circuit}
          </p>
          <p>
            <strong>Date start:</strong> {race.date.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ViewRacesForYear;
