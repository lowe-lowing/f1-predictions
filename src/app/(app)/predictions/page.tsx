import PreviousPrediction from "@/app/(app)/predictions/PreviousPrediction";
import { getDrivers } from "@/lib/api/drivers/queries";
import { getPredictionsFull } from "@/lib/api/predictions/queries";
import { getNextRace } from "@/lib/api/races/queries";
import PredictionForm from "./PredictionForm";

export default async function Predictions() {
  const { nextRace } = await getNextRace();
  const { predictions } = await getPredictionsFull();
  const { drivers } = await getDrivers();

  const nextRacePrediction = predictions.find((prediction) => prediction.race.id === nextRace?.id);
  const previousPredictions = predictions.filter((prediction) => prediction.race.id !== nextRace?.id);

  return (
    <main className="space-y-4">
      {nextRace &&
        (nextRacePrediction ? (
          <>
            <p>Your prediction for the next race</p>
            <PredictionForm drivers={drivers} race={nextRace} prediction={nextRacePrediction} />
          </>
        ) : (
          <>
            <p>Set your prediction for the next race</p>
            <PredictionForm drivers={drivers} race={nextRace} />
          </>
        ))}
      {previousPredictions.length > 0 && (
        <div className="py-8 space-y-4">
          <p>Your previous predictions</p>
          {previousPredictions.map((prediction) => (
            <PreviousPrediction key={prediction.id} prediction={prediction} />
          ))}
        </div>
      )}
    </main>
  );
}
