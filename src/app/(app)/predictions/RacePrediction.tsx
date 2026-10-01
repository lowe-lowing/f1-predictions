import { Card } from "@/components/ui/card";
import { PredictionFull } from "@/lib/api/predictions/queries";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { type FC } from "react";
import { DriverAvatar, MAX_POINTS_PER_RACE, PointsMarker, PositionBadge } from "./positions";

interface RacePredictionProps {
  prediction: PredictionFull;
}

export const predictionDrivers = (prediction: PredictionFull) => [
  prediction.pos1Driver,
  prediction.pos2Driver,
  prediction.pos3Driver,
  prediction.pos4Driver,
  prediction.pos5Driver,
];

export const predictionPoints = (prediction: PredictionFull) =>
  predictionDrivers(prediction).reduce((acc, driver) => acc + (driver?.points ?? 0), 0);

const RacePrediction: FC<RacePredictionProps> = ({ prediction }) => {
  const drivers = predictionDrivers(prediction);
  const points = predictionPoints(prediction);

  return (
    <Card className="flex min-w-0 flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold" title={prediction.race.name}>
            {prediction.race.name}
          </h3>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {format(prediction.race.date, "d MMM yyyy")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-semibold leading-none tabular-nums">{points}</p>
          <p className="text-xs text-muted-foreground">of {MAX_POINTS_PER_RACE} pts</p>
        </div>
      </div>
      <PointsBar points={points} className="mb-4" />
      <PicksList drivers={drivers} />
    </Card>
  );
};

type PickedDriver = { name: string | null; image: string | null; points: number } | null;

export const PointsBar = ({ points, className }: { points: number; className?: string }) => (
  <div className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}>
    <div className="h-full rounded-full bg-primary" style={{ width: `${(points / MAX_POINTS_PER_RACE) * 100}%` }} />
  </div>
);

export const PicksList = ({ drivers, showPoints = true }: { drivers: PickedDriver[]; showPoints?: boolean }) => (
  <ol className="space-y-1.5">
    {drivers.map((driver, index) => (
      <li key={index} className="flex items-center gap-2.5">
        <PositionBadge index={index} className="h-6 w-8 text-xs" />
        {driver?.name ? (
          <>
            <DriverAvatar image={driver.image} name={driver.name} className="h-7 w-7" />
            <span className="min-w-0 flex-1 truncate text-sm">{driver.name}</span>
            {showPoints && <PointsMarker points={driver.points} />}
          </>
        ) : (
          <span className="flex-1 text-sm text-muted-foreground">No pick</span>
        )}
      </li>
    ))}
  </ol>
);

export default RacePrediction;
