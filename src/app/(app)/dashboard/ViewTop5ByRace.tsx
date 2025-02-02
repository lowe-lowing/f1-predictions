import { getTop5ForRace } from "@/lib/api/F1Actions";
import { useEffect, useState, type FC } from "react";

interface ViewTop5ByRaceProps {
  meetingKey: number;
}

const ViewTop5ByRace: FC<ViewTop5ByRaceProps> = ({ meetingKey }) => {
  const [positions, setPositions] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await getTop5ForRace(meetingKey);
      setPositions(res);
    };
    fetchData();
  }, [meetingKey]);
  return (
    <div className="space-y-4">
      {positions.map((pos) => (
        <div key={pos.position} className="bg-secondary p-3 rounded-sm shadow-sm">
          <div className="flex gap-2">
            <img src={pos.driver.headshot_url} alt="headshot" />
            <div>
              <p>
                <strong>Position:</strong> {pos.position}
              </p>
              <p>
                <strong>Driver:</strong> {pos.driver.full_name}
              </p>
              <p>
                <strong>Team:</strong> {pos.driver.team_name}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewTop5ByRace;
