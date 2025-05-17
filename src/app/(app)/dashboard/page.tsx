import PendingPrediction from "@/app/(app)/predictions/PendingPrediction";
import { getNextRaceAndUsersPredictions } from "@/lib/api/races/queries";
import { getRanksForUsersAndSeason } from "@/lib/api/seasonPoints/queries";

// TODO: better styling for raceLocked state
// TODO: show "will be recalculated at (race.date + 1 day)" maybe both in the predictions page (prio 1) and dashboard (prio 2)
// first time calculated save the results in db, also second time calculated save the results in db (as of now results are only saved at recalculation)

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
            <div className="flex flex-wrap gap-6">
              {racePredictions.map((p) => (
                <PendingPrediction key={p.predictions.id} prediction={p} />
              ))}
            </div>
          ) : (
            <p>No predictions found</p>
          )}
        </div>
      )}
    </div>
  );
}
