import { getNextRaceAndUsersPredictions } from "@/lib/api/races/queries";
import { getRanksForUsersAndSeason } from "@/lib/api/seasonPoints/queries";

// TODO: better styling for raceLocked state
// TODO: show "will be recalculated at (race.date + 1 day)" maybe both in the predictions page (prio 1) and dashboard (prio 2)
// TODO: first time calculated save the results in db, also second time calculated save the results in db
// maybe set up a dev branch for friends to test
export default async function Home() {
  const year = new Date().getFullYear();
  const ranks = await getRanksForUsersAndSeason(year);

  const { nextRace, racePredictions } = await getNextRaceAndUsersPredictions();

  const raceLocked = nextRace?.lockedAt ? nextRace.lockedAt < new Date() : false;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-2xl">Ranking for {year}</p>
        <div className="space-y-2 max-w-fit">
          {ranks.map((r) => (
            <div key={r.season_points.id} className="flex gap-6 justify-between">
              <p>{r.user.name}</p>
              <p>{r.season_points.points}</p>
            </div>
          ))}
        </div>
      </div>

      {nextRace && raceLocked && (
        <div>
          <p>
            Qualifying has begun for <strong>{nextRace.name}</strong>
          </p>
          <p className="mb-4">Here are all predictions:</p>
          {racePredictions.length > 0 ? (
            <div className="space-y-4">
              {racePredictions.map((p) => (
                <div key={p.predictions.id} className="space-y-2">
                  <p>{p.user.name}</p>
                  <div>
                    <p>1st: {p.pos1Driver?.name}</p>
                    <p>2nd: {p.pos2Driver?.name}</p>
                    <p>3rd: {p.pos3Driver?.name}</p>
                    <p>4th: {p.pos4Driver?.name}</p>
                    <p>5th: {p.pos5Driver?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No predictions found</p>
          )}
        </div>
      )}
      {/* <pre className="bg-secondary p-4 rounded-sm shadow-sm text-secondary-foreground break-all whitespace-break-spaces">
        {JSON.stringify(nextRace, null, 2)}
      </pre> */}
      {/* <pre className="bg-secondary p-4 rounded-sm shadow-sm text-secondary-foreground break-all whitespace-break-spaces">
        {JSON.stringify(racePredictions, null, 2)}
      </pre> */}
    </div>
  );
}
