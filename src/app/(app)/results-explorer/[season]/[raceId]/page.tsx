"use cache";
import { DriverAvatar, PositionBadge } from "@/app/(app)/predictions/positions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRaceResultsByRaceIdAction } from "@/lib/actions/raceResults";
import { RaceResultsWithDriver } from "@/lib/api/raceResults/queries";
import { getRaceById } from "@/lib/api/races/queries";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarDays, Flag, MapPin } from "lucide-react";
import { unstable_cacheLife as cacheLife } from "next/cache";
import Link from "next/link";

// maybe only cache the data instead of the whole page?
export default async function RaceResultsPage({ params }: { params: Promise<{ raceId: string }> }) {
  cacheLife("days");
  const { raceId } = await params;
  const { race } = await getRaceById(raceId);
  if (!race) return <p className="pt-4">Race not found</p>;
  const { raceResults } = await getRaceResultsByRaceIdAction(raceId);

  // Drivers without a classified position (DNF/DNS) come last
  const classified = raceResults.filter((result) => result.position !== null);
  const unclassified = raceResults.filter((result) => result.position === null);
  const podium = classified.slice(0, 3);
  const winnerTime = classified[0]?.position === 1 ? classified[0].time : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-4">
      <Card className="overflow-hidden">
        <div className="flex items-start justify-between gap-4 bg-muted/40 p-4 sm:p-6">
          <div className="min-w-0 space-y-2">
            <Button asChild variant="ghost" size="sm" className="-ml-3 h-8 text-muted-foreground">
              <Link href={`/results-explorer/${race.season}`}>
                <ArrowLeft className="h-4 w-4" /> All races
              </Link>
            </Button>
            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">{race.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {race.circuit} · {race.city}, {race.country}
              </span>
              <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
                <CalendarDays className="h-4 w-4" />
                {format(race.date, "EEE d MMM yyyy, HH:mm")}
              </span>
            </div>
          </div>
          {race.circuitImg && (
            <img
              src={race.circuitImg}
              alt={`${race.circuit} layout`}
              className="hidden h-24 w-auto shrink-0 opacity-80 dark:invert sm:block"
            />
          )}
        </div>
      </Card>

      {raceResults.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Flag className="h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">No results yet</p>
          <p className="text-sm text-muted-foreground">Results show up here once the race has finished.</p>
        </Card>
      ) : (
        <>
          {podium.length > 0 && <Podium results={podium} winnerTime={winnerTime} />}
          <Classification results={[...classified, ...unclassified]} winnerTime={winnerTime} />
        </>
      )}
    </div>
  );
}

// Order the podium 2-1-3 on wider screens so the winner sits in the middle
const podiumOrder = ["sm:order-2", "sm:order-1", "sm:order-3"];
const podiumHeights = ["", "sm:mt-6", "sm:mt-10"];

const Podium = ({ results, winnerTime }: { results: RaceResultsWithDriver[]; winnerTime: string | null }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-start">
    {results.map((result, index) => (
      <Card
        key={result.id}
        className={cn(
          "flex items-center gap-3 p-4 sm:flex-col sm:text-center",
          podiumOrder[index],
          podiumHeights[index],
          index === 0 && "ring-2 ring-amber-400",
        )}
      >
        <PositionBadge index={index} className="sm:order-last" />
        <DriverAvatar
          image={result.driver?.image ?? null}
          name={result.driver?.name ?? null}
          className={cn("h-12 w-12", index === 0 && "sm:h-20 sm:w-20")}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{result.driver?.name ?? "Unknown driver"}</p>
          <p className="truncate text-xs text-muted-foreground">{result.driver?.team}</p>
          {result.time && (
            <p className="mt-1 text-sm tabular-nums">
              <ResultTime result={result} winnerTime={winnerTime} />
            </p>
          )}
        </div>
      </Card>
    ))}
  </div>
);

const Classification = ({ results, winnerTime }: { results: RaceResultsWithDriver[]; winnerTime: string | null }) => {
  // Older results were imported without grid positions
  const hasGrid = results.some((result) => result.grid);
  const columns = hasGrid ? "sm:grid-cols-[3rem_1fr_4.5rem_3.5rem_7rem]" : "sm:grid-cols-[3rem_1fr_3.5rem_7rem]";

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Full results</h3>
      <Card className="overflow-hidden">
        <div
          className={cn(
            "hidden gap-3 border-b bg-muted/40 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground sm:grid",
            columns,
          )}
        >
          <span>Pos</span>
          <span>Driver</span>
          {hasGrid && <span className="text-right">Grid</span>}
          <span className="text-right">Laps</span>
          <span className="text-right">Time</span>
        </div>
        <ol className="divide-y">
          {results.map((result) => (
            <li
              key={result.id}
              className={cn("grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-2.5", columns)}
            >
              {result.position !== null ? (
                <PositionBadge
                  index={result.position - 1}
                  className={cn("h-6 w-9 text-xs", result.position > 3 && "bg-muted text-muted-foreground")}
                />
              ) : (
                <span className="w-9 text-center text-sm text-muted-foreground">–</span>
              )}
              <div className="flex min-w-0 items-center gap-2.5">
                <DriverAvatar
                  image={result.driver?.image ?? null}
                  name={result.driver?.name ?? null}
                  className="h-8 w-8"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{result.driver?.name ?? "Unknown driver"}</p>
                  <p className="truncate text-xs text-muted-foreground">{result.driver?.team}</p>
                  {/* On mobile grid and laps get their own line instead of columns */}
                  {(result.grid || result.laps !== null) && (
                    <p className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground sm:hidden">
                      {result.grid && (
                        <>
                          Grid {result.grid}
                          <GridDelta grid={result.grid} position={result.position} />
                        </>
                      )}
                      {result.grid && result.laps !== null && " · "}
                      {result.laps !== null && `${result.laps} laps`}
                    </p>
                  )}
                </div>
              </div>
              {hasGrid && (
                <span className="hidden items-center justify-end gap-1.5 text-sm tabular-nums sm:flex">
                  {result.grid ?? "–"}
                  <GridDelta grid={result.grid} position={result.position} />
                </span>
              )}
              <span className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">
                {result.laps ?? "–"}
              </span>
              <span className="text-right text-sm tabular-nums">
                <ResultTime result={result} winnerTime={winnerTime} showTotal />
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
};

// The winner shows their race time, everyone else the gap to the winner. Newer imports store every driver's
// full race time, older ones already store gaps ("+14.512"), and lapped/retired drivers have "+1 lap"/"DNF".
const ResultTime = ({
  result,
  winnerTime,
  showTotal = false,
}: {
  result: RaceResultsWithDriver;
  winnerTime: string | null;
  showTotal?: boolean;
}) => {
  const time = result.time ?? (result.position === null ? "DNF" : "–");
  if (/^(DNF|DNS|DSQ)/i.test(time)) {
    return <span className="font-medium text-destructive dark:text-red-400">{time}</span>;
  }
  if (result.position === 1) return <span className="font-semibold">{time}</span>;

  const gap = gapToWinner(time, winnerTime);
  if (!gap) return <span>{time}</span>;
  return (
    <span className="inline-flex flex-col items-end leading-tight">
      <span>{gap}</span>
      {showTotal && <span className="hidden text-xs text-muted-foreground sm:inline">{time}</span>}
    </span>
  );
};

// "1:38:16.655" / "38:16.655" / "16.655" -> seconds
const parseRaceTime = (time: string | null) => {
  if (!time || !/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(time)) return null;
  return time.split(":").reduce((acc, part) => acc * 60 + parseFloat(part), 0);
};

const formatGap = (seconds: number) => {
  if (seconds < 60) return `+${seconds.toFixed(3)}`;
  const minutes = Math.floor(seconds / 60);
  return `+${minutes}:${(seconds - minutes * 60).toFixed(3).padStart(6, "0")}`;
};

const gapToWinner = (time: string, winnerTime: string | null) => {
  const seconds = parseRaceTime(time);
  const winnerSeconds = parseRaceTime(winnerTime);
  if (seconds === null || winnerSeconds === null || seconds < winnerSeconds) return null;
  return formatGap(seconds - winnerSeconds);
};

// Places gained or lost compared to the starting grid
const GridDelta = ({ grid, position }: { grid: string | null; position: number | null }) => {
  const start = grid ? parseInt(grid) : NaN;
  if (position === null || isNaN(start) || start === position) return null;
  const gained = start - position;
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium",
        gained > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
      )}
      title={`${Math.abs(gained)} places ${gained > 0 ? "gained" : "lost"}`}
    >
      {gained > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(gained)}
    </span>
  );
};
