import PredictionForm from "@/app/(app)/predictions/PredictionForm";
import RacePrediction, { predictionPoints } from "@/app/(app)/predictions/RacePrediction";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDriversBySeason } from "@/lib/api/drivers/queries";
import { getPredictionsFull, PredictionFull } from "@/lib/api/predictions/queries";
import { getNextRace } from "@/lib/api/races/queries";
import { getSeasonPoints } from "@/lib/api/seasonPoints/queries";
import { Flag } from "lucide-react";
import { MAX_POINTS_PER_DRIVER, PointsMarker } from "./positions";

export default async function Predictions() {
  const { nextRace } = await getNextRace();
  const { predictions } = await getPredictionsFull();
  const { drivers } = await getDriversBySeason(nextRace?.season ?? new Date().getFullYear());
  const { seasonPoints } = await getSeasonPoints();

  const nextRacePrediction = predictions.find((prediction) => prediction.race.id === nextRace?.id);
  const previousPredictions = predictions.filter((prediction) => prediction.race.id !== nextRace?.id);
  const previousSeasons = [...new Set(previousPredictions.map((prediction) => prediction.race.season))].sort((a, b) => b - a);

  return (
    <main className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Your Predictions</h1>
        <p className="text-sm text-muted-foreground">Pick the top 5 for each race before qualifying starts.</p>
      </div>

      {nextRace ? (
        <PredictionForm
          // remount when the saved prediction changes so the form resets to the server state
          key={nextRacePrediction?.id ?? "new"}
          drivers={drivers}
          race={nextRace}
          prediction={nextRacePrediction}
        />
      ) : (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Flag className="h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">No upcoming races</p>
          <p className="text-sm text-muted-foreground">The season is over. Check back when the next calendar is out.</p>
        </Card>
      )}

      {previousPredictions.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-semibold">History</h2>
            <ScoringLegend />
          </div>
          <Tabs defaultValue={previousSeasons[0].toString()} className="space-y-4">
            <TabsList>
              {previousSeasons.map((season) => (
                <TabsTrigger key={season} value={season.toString()}>
                  {season}
                </TabsTrigger>
              ))}
            </TabsList>
            {previousSeasons.map((season) => {
              const seasonPredictions = previousPredictions.filter((prediction) => prediction.race.season === season);
              const total = seasonPoints.find((sp) => sp.year === season)?.points ?? 0;
              return (
                <TabsContent key={season} value={season.toString()} className="mt-0 space-y-4">
                  <SeasonStats predictions={seasonPredictions} total={total} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {seasonPredictions.map((prediction) => (
                      <RacePrediction key={prediction.id} prediction={prediction} />
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      )}
    </main>
  );
}

const SeasonStats = ({ predictions, total }: { predictions: PredictionFull[]; total: number }) => {
  const scored = predictions.map((prediction) => ({ prediction, points: predictionPoints(prediction) }));
  const best = scored.reduce<(typeof scored)[number] | null>((acc, s) => (!acc || s.points > acc.points ? s : acc), null);
  const average = scored.length ? scored.reduce((acc, s) => acc + s.points, 0) / scored.length : 0;

  const stats = [
    { label: "Total points", value: total },
    { label: "Races predicted", value: predictions.length },
    { label: "Avg per race", value: average.toFixed(1) },
    { label: "Best race", value: best?.points ?? 0, hint: best?.prediction.race.name },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
          {stat.hint && <p className="truncate text-xs text-muted-foreground">{stat.hint}</p>}
        </Card>
      ))}
    </div>
  );
};

const ScoringLegend = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
    <span className="inline-flex items-center">
      <PointsMarker points={MAX_POINTS_PER_DRIVER} className="w-auto" /> <span className="ml-1">exact position</span>
    </span>
    <span className="inline-flex items-center">
      <PointsMarker points={1} className="w-auto" /> <span className="ml-1">in the top 5</span>
    </span>
  </div>
);
