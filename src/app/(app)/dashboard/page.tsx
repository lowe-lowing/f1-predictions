import { getRanksForUsersAndSeason } from "@/lib/api/seasonPoints/queries";

export default async function Home() {
  const year = new Date().getFullYear();
  const ranks = await getRanksForUsersAndSeason(year);
  return (
    <div className="space-y-4">
      <p className="text-2xl">Ranking for {year}</p>
      <div className="space-y-2 max-w-fit">
        {ranks.map((r) => (
          <div key={r.season_points.id} className="flex gap-6 justify-between">
            <p>{r.user.name}</p>
            <p>{r.season_points.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
