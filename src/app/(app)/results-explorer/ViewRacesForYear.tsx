import { getRacesByYearAction } from "@/lib/actions/races";
import { Race } from "@/lib/db/schema/races";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
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
          onClick={() => setSelectedRace(race)}
          key={race.id}
          className="bg-secondary p-4 rounded-sm shadow-sm cursor-pointer flex justify-between"
        >
          <div>
            <p className="text-xl">{race.name}</p>
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {race.date.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}
            </p>
            <br />
            <p>
              {race.country}; {race.city}
            </p>
          </div>
          <div className="text-end">
            <p>{race.circuit}</p>
            <img src={race.circuitImg || ""} alt="Circuit Image" className="h-36" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewRacesForYear;
