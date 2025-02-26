import { getOrCreateRanksForUsersAndSeason } from "@/lib/api/seasonPoints/queries";

export default async function ViewRanks() {
  const year = new Date().getFullYear();
  const ranks = await getOrCreateRanksForUsersAndSeason(year);
  return (
    <div>
      {ranks.map((r) => (
        <div key={r.season_points.id}>
          <p>{r.user.name}</p>
          <p>{r.season_points.points}</p>
        </div>
      ))}
    </div>
  );
}
