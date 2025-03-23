import { DriverComponent } from "@/app/(app)/predictions/DriverComponent";
import { Label } from "@/components/ui/label";
import { getRaceResultsByRaceIdAction } from "@/lib/actions/raceResults";
import { RaceResultsWithDriver } from "@/lib/api/raceResults/queries";
import { Race } from "@/lib/db/schema/races";
import { useEffect, useState, type FC } from "react";

interface ViewResultsForRaceProps {
  race: Race;
}

const ViewResultsForRace: FC<ViewResultsForRaceProps> = ({ race }) => {
  const [positions, setPositions] = useState<RaceResultsWithDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setPositions([]);
      const { raceResults } = await getRaceResultsByRaceIdAction(race.id);
      setPositions(raceResults);
      setIsLoading(false);
    };
    fetchData();
  }, [race]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        <span className="text-muted-foreground">Results for</span> {race.name} -{" "}
        {race.date.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}
      </h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : positions.length > 0 ? (
        positions.map(({ id, position, driver, ...data }) => (
          <div key={id} className="bg-secondary p-3 rounded-sm shadow-sm">
            <div className="grid gap-2 items-center grid-cols-4">
              <div className="flex items-center gap-2">
                <Label className="text-2xl w-10 sm:w-14 text-center">{position}</Label>
                {driver && <DriverComponent driver={driver} />}
              </div>
              <p>Time: {data.time}</p>
              <p>Laps: {data.laps}</p>
              <p>Grid: {data.grid}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default ViewResultsForRace;
