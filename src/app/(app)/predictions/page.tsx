import { getDrivers } from "@/lib/api/drivers/queries";
import { getPredictionsFull } from "@/lib/api/predictions/queries";
import { getNextRace } from "@/lib/api/races/queries";
import PredictionForm from "./PredictionForm";

export default async function Predictions() {
  // get next race
  // if prediction not created, show predictions form
  // else show prediction and edit button on the side
  // TODO bellow show previous predictions (maybe how much points the user got from the prediction aswell)
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
        <>
          <p>Your previous predictions</p>
          {previousPredictions.map((prediction) => (
            <div key={prediction.id}>
              <p>Race: {prediction.race.name}</p>
              <p>1st: {prediction.pos1Driver?.name}</p>
              <p>2nd: {prediction.pos2Driver?.name}</p>
              <p>3rd: {prediction.pos3Driver?.name}</p>
              <p>4th: {prediction.pos4Driver?.name}</p>
              <p>5th: {prediction.pos5Driver?.name}</p>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
