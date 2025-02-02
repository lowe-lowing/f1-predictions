import { getPredictions } from "@/lib/api/predictions/queries";
import CreatePredictionForm from "./CreatePredictionForm";
import { getDrivers } from "@/lib/api/drivers/queries";

export default async function Predictions() {
  // TODO if no prediction set for the upcoming race, "Set your prediction for (race name)"
  // TODO else the user will need to go to the upcoming race position and update it
  // TODO show the predictions for the current user and upcoming race
  const { predictions } = await getPredictions();
  const { drivers } = await getDrivers();
  return (
    <main className="space-y-4">
      <p>Set your prediction for (race name):</p>
      <CreatePredictionForm drivers={drivers} />
      <p>All your predictions:</p>
      {predictions.map((prediction) => (
        <div key={prediction.id}>
          <p>Race: {prediction.raceId}</p>
          <p>1st: {prediction.pos1Driver}</p>
          <p>2nd: {prediction.pos2Driver}</p>
          <p>3rd: {prediction.pos3Driver}</p>
          <p>4th: {prediction.pos4Driver}</p>
          <p>5th: {prediction.pos5Driver}</p>
        </div>
      ))}
    </main>
  );
}
