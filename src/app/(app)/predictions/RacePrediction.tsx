import { DriverComponent } from "@/app/(app)/predictions/DriverComponent";
import { Label } from "@/components/ui/label";
import { PredictionFull } from "@/lib/api/predictions/queries";
import { type FC } from "react";

interface RacePredictionProps {
  prediction: PredictionFull;
}

const RacePrediction: FC<RacePredictionProps> = ({ prediction }) => {
  const positions = {
    "1st": prediction.pos1Driver,
    "2nd": prediction.pos2Driver,
    "3rd": prediction.pos3Driver,
    "4th": prediction.pos4Driver,
    "5th": prediction.pos5Driver,
  } as Record<string, PredictionFull["pos1Driver"]>;

  const entries = Object.entries(positions);
  const points = entries.reduce((acc, [key, value]) => (value ? acc + value.points : acc), 0);

  return (
    <div key={prediction.id} className="space-y-2">
      <p className="text-xl">{prediction.race.name}</p>
      <p>Points gained: {points}</p>
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center">
          <Label className="w-10 sm:w-14 text-center">{key}</Label>
          {value && (
            <>
              <DriverComponent driver={value} />
              {value.points > 0 && <p className="ml-2">+{value.points}</p>}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default RacePrediction;
