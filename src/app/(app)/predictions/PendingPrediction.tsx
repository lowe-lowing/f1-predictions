import { DriverComponent } from "@/app/(app)/predictions/DriverComponent";
import { Label } from "@/components/ui/label";
import { RacePrediction } from "@/lib/api/races/queries";
import { type FC } from "react";

interface PendingPredictionProps {
  prediction: RacePrediction;
}

const PendingPrediction: FC<PendingPredictionProps> = ({ prediction: p }) => {
  const positions = {
    "1st": p.pos1Driver,
    "2nd": p.pos2Driver,
    "3rd": p.pos3Driver,
    "4th": p.pos4Driver,
    "5th": p.pos5Driver,
  } as Record<string, RacePrediction["pos1Driver"]>;

  const entries = Object.entries(positions);

  return (
    <div key={p.predictions.id} className="space-y-2">
      <p className="text-xl ml-16 underline">{p.user.name}</p>
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center">
          <Label className="w-10 sm:w-14 text-center">{key}</Label>
          {value && <DriverComponent driver={value} />}
        </div>
      ))}
    </div>
  );
};

export default PendingPrediction;
