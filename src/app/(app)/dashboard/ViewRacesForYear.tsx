import { getRacesForYear } from "@/lib/api/F1Actions";
import { Dispatch, useEffect, useState, type FC } from "react";

interface ViewRacesForYearProps {
  year: number;
  setSelectedRace: Dispatch<any>;
}

const ViewRacesForYear: FC<ViewRacesForYearProps> = ({ year, setSelectedRace }) => {
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getRacesForYear(year);
      setRaces(res);
    };
    fetchData();
  }, [year]);

  const handleSelectRace = (race: any) => {
    setSelectedRace(race);
    setRaces([]);
  };

  return (
    <div className="space-y-4">
      {races.map((race) => (
        <div
          onClick={() => handleSelectRace(race)}
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
