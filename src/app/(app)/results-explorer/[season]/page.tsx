"use cache";
import { DriverAvatar } from "@/app/(app)/predictions/positions";
import { Card } from "@/components/ui/card";
import { getRacesByYearAction } from "@/lib/actions/races";
import { getRaceWinnersBySeason } from "@/lib/api/raceResults/queries";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays, Flag, MapPin, Trophy } from "lucide-react";
import { unstable_cacheLife as cacheLife } from "next/cache";
import Link from "next/link";

// TODO: show point history like Viktor suggested

type Status = "completed" | "next" | "upcoming";

export default async function ResultsExplorerPage({ params }: { params: Promise<{ season: string }> }) {
  // Race status depends on the current time, so don't cache for longer than that stays accurate
  cacheLife("hours");
  const { season } = await params;
  const [{ races }, { winners }] = await Promise.all([
    getRacesByYearAction(parseInt(season)),
    getRaceWinnersBySeason(parseInt(season)),
  ]);

  if (races.length === 0) {
    return (
      <Card className="mt-4 flex flex-col items-center gap-2 p-10 text-center">
        <Flag className="h-8 w-8 text-muted-foreground" />
        <p className="font-semibold">No races for {season}</p>
        <p className="text-sm text-muted-foreground">The calendar for this season hasn&apos;t been added yet.</p>
      </Card>
    );
  }

  const now = new Date();
  const nextIndex = races.findIndex((race) => race.date >= now);
  const completed = nextIndex === -1 ? races.length : nextIndex;
  const statusOf = (index: number): Status =>
    index < completed ? "completed" : index === nextIndex ? "next" : "upcoming";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-4">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Season progress</span>
          <span className="font-semibold tabular-nums">
            {completed} / {races.length} races
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(completed / races.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {races.map((race, index) => {
          const status = statusOf(index);
          const winner = winners.find((w) => w.raceId === race.id)?.driver;
          return (
            <Link key={race.id} href={`/results-explorer/${season}/${race.id}`} className="group">
              <Card
                className={cn(
                  "flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-md",
                  status === "next" && "ring-2 ring-primary",
                  status === "upcoming" && "opacity-75"
                )}
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Round {index + 1}</span>
                      <StatusPill status={status} />
                    </div>
                    <h2 className="truncate font-semibold" title={race.name}>
                      {race.name}
                    </h2>
                    <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {race.city}, {race.country}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground" suppressHydrationWarning>
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {format(race.date, "EEE d MMM, HH:mm")}
                    </p>
                  </div>
                  {race.circuitImg && (
                    <img
                      src={race.circuitImg}
                      alt={`${race.circuit} layout`}
                      className="h-16 w-20 shrink-0 object-contain opacity-80 dark:invert"
                    />
                  )}
                </div>
                <div className="mt-auto flex items-center gap-2.5 border-t bg-muted/40 px-4 py-2.5 text-sm">
                  {winner ? (
                    <>
                      <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                      <DriverAvatar image={winner.image} name={winner.name} className="h-7 w-7" />
                      <span className="min-w-0 flex-1 truncate font-medium">{winner.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{winner.team}</span>
                    </>
                  ) : (
                    <span className="truncate text-muted-foreground">{race.circuit}</span>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const StatusPill = ({ status }: { status: Status }) => {
  const styles: Record<Status, string> = {
    completed: "bg-muted text-muted-foreground",
    next: "bg-primary text-primary-foreground",
    upcoming: "border text-muted-foreground",
  };
  const labels: Record<Status, string> = { completed: "Completed", next: "Next", upcoming: "Upcoming" };
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", styles[status])}>{labels[status]}</span>;
};
