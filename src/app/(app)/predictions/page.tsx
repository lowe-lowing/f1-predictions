import PredictionForm from "@/app/(app)/predictions/PredictionForm";
import RacePrediction from "@/app/(app)/predictions/RacePrediction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDriversBySeason } from "@/lib/api/drivers/queries";
import { getPredictionsFull } from "@/lib/api/predictions/queries";
import { getNextRace } from "@/lib/api/races/queries";
import { getSeasonPoints } from "@/lib/api/seasonPoints/queries";

export default async function Predictions() {
  const { nextRace } = await getNextRace();
  const { predictions } = await getPredictionsFull();
  const { drivers } = await getDriversBySeason(nextRace?.season ?? new Date().getFullYear());
  const { seasonPoints } = await getSeasonPoints();

  const nextRacePrediction = predictions.find((prediction) => prediction.race.id === nextRace?.id);
  const previousPredictions = predictions.filter((prediction) => prediction.race.id !== nextRace?.id);
  const previousSeasons = [...new Set(previousPredictions.map((prediction) => prediction.race.season))].sort((a, b) => b - a);

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
          <Tabs defaultValue={previousSeasons[0].toString()}>
            <div className="flex flex-wrap items-center gap-4">
              <TabsList>
                {previousSeasons.map((season) => (
                  <TabsTrigger key={season} value={season.toString()}>
                    {season}
                  </TabsTrigger>
                ))}
              </TabsList>
              {/* Radix only renders the active TabsContent, so this shows the total for the selected season */}
              {previousSeasons.map((season) => (
                <TabsContent key={season} value={season.toString()} className="mt-0">
                  <div className="flex h-10 items-center gap-2 rounded-md border bg-muted/50 px-4">
                    <span className="text-sm text-muted-foreground">Total points</span>
                    <span className="text-lg font-semibold">{seasonPoints.find((sp) => sp.year === season)?.points ?? 0}</span>
                  </div>
                </TabsContent>
              ))}
            </div>
            {previousSeasons.map((season) => {
              const seasonPredictions = previousPredictions.filter((prediction) => prediction.race.season === season);
              return (
                <TabsContent key={season} value={season.toString()} className="space-y-4">
                  {seasonPredictions.map((prediction) => (
                    <RacePrediction key={prediction.id} prediction={prediction} />
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      )}
    </main>
  );
}
