"use cache";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { DriverComponent } from "@/app/(app)/predictions/DriverComponent";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getRaceResultsByRaceIdAction } from "@/lib/actions/raceResults";
import { getRaceById } from "@/lib/api/races/queries";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function RaceResultsPage({ params }: { params: Promise<{ raceId: string }> }) {
  cacheLife("days");
  const { raceId } = await params;
  const { race } = await getRaceById(raceId);
  if (!race) return <p>Race not found</p>;
  const { raceResults } = await getRaceResultsByRaceIdAction(raceId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/results-explorer/${race.season}`}>
          <Button variant={"ghost"} size={"icon"} className="[&_svg]:size-6">
            <ArrowLeft />
          </Button>
        </Link>
        <h2 className="text-xl font-bold">
          <span className="text-muted-foreground">Results for</span> {race.name} -{" "}
          {race.date.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}
        </h2>
      </div>
      <Suspense fallback={<p>Loading...</p>}>
        {raceResults.map(({ id, position, driver, ...data }) => (
          <div key={id} className="bg-secondary p-3 rounded-sm shadow-sm">
            <div className="grid gap-2 items-center grid-cols-12">
              <div className="flex items-center gap-2 col-span-full sm:col-span-7 lg:col-span-5 xl:col-span-4">
                <Label className="text-2xl w-10 sm:w-14 text-center">{position}</Label>
                {driver && <DriverComponent driver={driver} />}
              </div>
              <p className="col-span-full sm:col-span-5 lg:col-span-3 xl:col-span-3">Time: {data.time}</p>
              <p className="col-span-6 sm:col-start-2 lg:col-span-2 xl:col-span-3">Laps: {data.laps}</p>
              <p className="col-span-6 sm:col-span-5 lg:col-span-2 xl:col-span-2">Grid: {data.grid}</p>
            </div>
          </div>
        ))}
      </Suspense>
    </div>
  );
}
