"use cache";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { getRacesByYearAction } from "@/lib/actions/races";
import Link from "next/link";

// TODO: find a way to show if the race is "completed" or "has results" or something
// TODO: show point history like Viktor suggested
// Maybe add date sorter and "completed"/"has result" checkbox

export default async function ResultsExplorerPage({ params }: { params: Promise<{ season: string }> }) {
  cacheLife("max");
  const { season } = await params;
  const { races } = await getRacesByYearAction(parseInt(season));

  return (
    <div className="space-y-4 pt-4">
      {races.map((race) => (
        <Link
          key={race.id}
          href={`/results-explorer/${season}/${race.id}`}
          className="bg-secondary p-4 rounded-sm shadow-sm cursor-pointer flex justify-between"
        >
          <div>
            <p className="text-xl">{race.name}</p>
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {race.date.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}
            </p>
            <br />
            <p>
              {race.country}; {race.city}
            </p>
          </div>
          <div className="text-end">
            <p>{race.circuit}</p>
            <img src={race.circuitImg || ""} alt="Circuit Image" className="h-36" />
          </div>
        </Link>
      ))}
    </div>
  );
}

{
  /* <Select
  onValueChange={(value) => {
    setSelectedYear(parseInt(value));
    setSelectedRace(null);
  }}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a year" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      {seasons.map((season) => (
        <SelectItem key={season} value={season.toString()}>
          {season}
        </SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>; */
}
