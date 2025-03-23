import { DriverComponent } from "@/app/(app)/predictions/DriverComponent";
import { Label } from "@/components/ui/label";
import { getRaceResultsByRaceIdAction } from "@/lib/actions/raceResults";
import { RaceResultsWithDriver } from "@/lib/api/raceResults/queries";
import { useEffect, useState, type FC } from "react";

interface ViewResultsForRaceProps {
  raceId: string;
}

const ViewResultsForRace: FC<ViewResultsForRaceProps> = ({ raceId }) => {
  const [positions, setPositions] = useState<RaceResultsWithDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setPositions([]);
      const { raceResults } = await getRaceResultsByRaceIdAction(raceId);
      setPositions(raceResults);
      setIsLoading(false);
    };
    fetchData();
  }, [raceId]);

  return (
    <div className="space-y-4">
      {isLoading && <p>Loading...</p>}
      {positions.map(({ id, position, driver }) => (
        <div key={id} className="bg-secondary p-3 rounded-sm shadow-sm">
          <div className="flex gap-2 items-center">
            <Label className="text-2xl w-10 sm:w-14 text-center">{position}</Label>
            {driver && <DriverComponent driver={driver} />}
            {/* <img src={pos.driver?.image || undefined} alt="headshot" />
            <div>
              <p>
                <strong>Position:</strong> {pos.position}
              </p>
              <p>
                <strong>Driver:</strong> {pos.driver?.name}
              </p>
              <p>
                <strong>Team:</strong> {pos.driver?.team}
              </p>
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewResultsForRace;
