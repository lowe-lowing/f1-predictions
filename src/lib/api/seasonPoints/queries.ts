import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type SeasonPointId, seasonPointIdSchema, seasonPoints } from "@/lib/db/schema/seasonPoints";
import { pointHistory, type CompletePointHistory } from "@/lib/db/schema/pointHistory";
import { users } from "@/lib/db/schema/auth";

export const getSeasonPoints = async () => {
  // "629d60ea-ed69-4bfb-80dd-1e983fa63ddd" LL
  const { session } = await getUserAuth();
  const rows = await db.select().from(seasonPoints).where(eq(seasonPoints.userId, session?.user.id!));
  const s = rows;
  return { seasonPoints: s };
};

export const getSeasonPointById = async (id: SeasonPointId) => {
  const { session } = await getUserAuth();
  const { id: seasonPointId } = seasonPointIdSchema.parse({ id });
  const [row] = await db
    .select()
    .from(seasonPoints)
    .where(and(eq(seasonPoints.id, seasonPointId), eq(seasonPoints.userId, session?.user.id!)));
  if (row === undefined) return {};
  const s = row;
  return { seasonPoint: s };
};

export const getSeasonPointByIdWithPointHistory = async (id: SeasonPointId) => {
  const { session } = await getUserAuth();
  const { id: seasonPointId } = seasonPointIdSchema.parse({ id });
  const rows = await db
    .select({ seasonPoint: seasonPoints, pointHistory: pointHistory })
    .from(seasonPoints)
    .where(and(eq(seasonPoints.id, seasonPointId), eq(seasonPoints.userId, session?.user.id!)))
    .leftJoin(pointHistory, eq(seasonPoints.id, pointHistory.seasonPointId));
  if (rows.length === 0) return {};
  const s = rows[0].seasonPoint;
  const sp = rows.filter((r) => r.pointHistory !== null).map((p) => p.pointHistory) as CompletePointHistory[];

  return { seasonPoint: s, pointHistory: sp };
};

// const ranks = await getOrCreateRanksForUsersAndSeason(year);
export const getOrCreateRanksForUsersAndSeason = async (year: number) => {
  // get all users
  const userRows = await db.select().from(users);
  // get all season points
  const seasonPointRows = await db
    .select()
    .from(seasonPoints)
    .where(eq(seasonPoints.year, year))
    .innerJoin(users, eq(seasonPoints.userId, users.id));
  // loop through all users
  for (const user of userRows) {
    // check if user has a season point for the current year
    const seasonPoint = seasonPointRows.find((sp) => sp.user.id === user.id);
    // if user does not have a season point for the current year, create one
    if (seasonPoint === undefined) {
      const newSeasonPoint = await db.insert(seasonPoints).values({ userId: user.id, year }).returning().execute();
      seasonPointRows.push({ season_points: newSeasonPoint[0], user });
    }
  }
  return seasonPointRows;
};
