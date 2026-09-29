import { LockStatus } from "@/app/(app)/predictions/PredictionForm";
import { PicksList, PointsBar } from "@/app/(app)/predictions/RacePrediction";
import { MAX_POINTS_PER_RACE, PositionBadge } from "@/app/(app)/predictions/positions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPredictionsFull } from "@/lib/api/predictions/queries";
import { getNextRace, getNextRaceAndUsersPredictions, RacePrediction } from "@/lib/api/races/queries";
import { getRanksForUsersAndSeason } from "@/lib/api/seasonPoints/queries";
import { getUserAuth } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, Flag, MapPin, Trophy } from "lucide-react";
import Link from "next/link";

// TODO: show "will be recalculated at (race.date + 1 day)" maybe both in the predictions page (prio 1) and dashboard (prio 2)
// first time calculated save the results in db, also second time calculated save the results in db (as of now results are only saved at recalculation)

type Ranks = Awaited<ReturnType<typeof getRanksForUsersAndSeason>>;
type NextRace = NonNullable<Awaited<ReturnType<typeof getNextRace>>["nextRace"]>;
type LatestRace = NonNullable<Awaited<ReturnType<typeof getNextRaceAndUsersPredictions>>["nextRace"]>;

export default async function Home() {
  const year = new Date().getFullYear();
  const [{ session }, ranks, { nextRace }, { nextRace: latestRace, racePredictions }, { predictions }] =
    await Promise.all([
      getUserAuth(),
      getRanksForUsersAndSeason(year),
      getNextRace(),
      getNextRaceAndUsersPredictions(),
      getPredictionsFull(),
    ]);

  const userId = session?.user.id;
  const firstName = session?.user.name?.split(" ")[0];
  const myPrediction = predictions.find((prediction) => prediction.race.id === nextRace?.id);

  return (
    <main className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s how the {year} season is going.</p>
      </div>

      <SeasonStats ranks={ranks} userId={userId} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {nextRace ? (
            <NextRaceCard race={nextRace} picks={myPrediction ? predictionPicks(myPrediction) : null} />
          ) : (
            <Card className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
              <Flag className="h-8 w-8 text-muted-foreground" />
              <p className="font-semibold">No upcoming races</p>
              <p className="text-sm text-muted-foreground">The season is over. Check back when the next calendar is out.</p>
            </Card>
          )}
        </div>
        <div className="lg:col-span-2">
          <Standings ranks={ranks} userId={userId} year={year} />
        </div>
      </div>

      {latestRace && racePredictions && (
        <LatestRaceSection race={latestRace} predictions={racePredictions} userId={userId} />
      )}
    </main>
  );
}

const predictionPicks = (prediction: Pick<RacePrediction, `pos${1 | 2 | 3 | 4 | 5}Driver`>) => [
  prediction.pos1Driver,
  prediction.pos2Driver,
  prediction.pos3Driver,
  prediction.pos4Driver,
  prediction.pos5Driver,
];

const sumPoints = (prediction: RacePrediction) =>
  predictionPicks(prediction).reduce((acc, driver) => acc + (driver ? driver.points : 0), 0);

// Users on equal points share a rank
const rankOf = (ranks: Ranks, index: number) =>
  ranks.findIndex((r) => r.season_points.points === ranks[index].season_points.points) + 1;

const initials = (name: string | null) =>
  name
    ? name
        .split(" ")
        .map((word) => word[0]?.toUpperCase())
        .join("")
        .slice(0, 2)
    : "?";

const SeasonStats = ({ ranks, userId }: { ranks: Ranks; userId?: string }) => {
  const myIndex = ranks.findIndex((r) => r.user.id === userId);
  const myPoints = myIndex >= 0 ? ranks[myIndex].season_points.points : 0;
  const leaderPoints = ranks[0]?.season_points.points ?? 0;
  const gap = leaderPoints - myPoints;

  const stats = [
    { label: "Your rank", value: myIndex >= 0 ? `#${rankOf(ranks, myIndex)}` : "–", hint: `of ${ranks.length} players` },
    { label: "Your points", value: myPoints },
    { label: "Gap to leader", value: myIndex >= 0 && gap > 0 ? `−${gap}` : "–", hint: gap === 0 && myIndex >= 0 ? "You're leading!" : undefined },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
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

const NextRaceCard = ({ race, picks }: { race: NextRace; picks: ReturnType<typeof predictionPicks> | null }) => {
  const locked = race.lockedAt ? race.lockedAt <= new Date() : false;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b bg-muted/40 p-4 sm:p-6">
        <div className="min-w-0 space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Next race · {race.season}</p>
          <h2 className="text-2xl font-semibold leading-tight">{race.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {race.city}, {race.country}
            </span>
            <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
              <CalendarDays className="h-4 w-4" />
              {format(race.date, "EEE d MMM, HH:mm")}
            </span>
          </div>
          <LockStatus lockedAt={race.lockedAt} locked={locked} />
        </div>
        {race.circuitImg && (
          <img
            src={race.circuitImg}
            alt={`${race.circuit} layout`}
            className="hidden h-20 w-auto shrink-0 opacity-80 dark:invert sm:block"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {picks ? (
          <>
            <p className="mb-3 text-sm font-medium">Your picks</p>
            <PicksList drivers={picks} showPoints={false} />
            <Button asChild variant="outline" className="mt-4 self-start">
              <Link href="/predictions">
                {locked ? "View prediction" : "Edit prediction"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-start justify-center gap-3">
            <p className="text-sm text-muted-foreground">
              {locked ? "You didn't make a prediction for this race." : "You haven't made a prediction for this race yet."}
            </p>
            {!locked && (
              <Button asChild>
                <Link href="/predictions">
                  Make your prediction <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

const Standings = ({ ranks, userId, year }: { ranks: Ranks; userId?: string; year: number }) => {
  const leaderPoints = ranks[0]?.season_points.points ?? 0;

  return (
    <Card className="h-full p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Standings {year}</h2>
      </div>
      {ranks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No points scored yet this season.</p>
      ) : (
        <ol className="space-y-1">
          {ranks.map((r, index) => {
            const rank = rankOf(ranks, index);
            const isMe = r.user.id === userId;
            const gap = leaderPoints - r.season_points.points;
            return (
              <li
                key={r.season_points.id}
                className={cn("flex items-center gap-3 rounded-lg px-2 py-2", isMe && "bg-muted font-semibold")}
              >
                <PositionBadge index={rank - 1} className="h-7 w-9 text-xs">
                  {rank}
                </PositionBadge>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground ring-1 ring-border">
                  {initials(r.user.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {r.user.name}
                  {isMe && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold tabular-nums">{r.season_points.points}</span>
                  {gap > 0 && <span className="block text-xs font-normal text-muted-foreground tabular-nums">−{gap}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
};

const LatestRaceSection = ({
  race,
  predictions,
  userId,
}: {
  race: LatestRace;
  predictions: RacePrediction[];
  userId?: string;
}) => {
  const sorted = [...predictions].sort((a, b) => sumPoints(b) - sumPoints(a));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Latest race</p>
          <h2 className="text-xl font-semibold">{race.name}</h2>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {format(race.date, "d MMM yyyy")}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/results-explorer/${race.season}/${race.id}`}>
            View results <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((prediction, index) => {
            const points = sumPoints(prediction);
            const isMe = prediction.userId === userId;
            return (
              <Card key={prediction.id} className={cn("flex min-w-0 flex-col p-4", isMe && "ring-2 ring-primary")}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground tabular-nums">#{index + 1}</span>
                    <h3 className="truncate font-semibold">{prediction.userName}</h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-semibold leading-none tabular-nums">{points}</p>
                    <p className="text-xs text-muted-foreground">of {MAX_POINTS_PER_RACE} pts</p>
                  </div>
                </div>
                <PointsBar points={points} className="mb-4" />
                <PicksList drivers={predictionPicks(prediction)} />
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center text-sm text-muted-foreground">No predictions were made for this race.</Card>
      )}
    </section>
  );
};
