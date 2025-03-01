import { getRacesForYear } from "@/lib/api/F1Actions";
import { Dispatch, useEffect, useState, type FC } from "react";

interface ViewRacesForYearProps {
  year: number;
  setSelectedRace: Dispatch<any>;
}

const ViewRacesForYear: FC<ViewRacesForYearProps> = ({ year, setSelectedRace }) => {
  const [races, setRaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setRaces([]);
      const res = await getRacesForYear(year);
      setRaces(res);
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
          key={race.meeting_key}
          className="bg-secondary p-4 rounded-sm shadow-sm cursor-pointer"
        >
          <p>
            <strong>Name:</strong> {race.meeting_name}
          </p>
          <p>
            <strong>Circuit:</strong> {race.circuit_short_name}
          </p>
          <p>
            <strong>Date start:</strong> {race.date_start}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ViewRacesForYear;
