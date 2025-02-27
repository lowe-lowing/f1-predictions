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

export const getRanksForUsersAndSeason = async (year: number) => {
  const seasonPointRows = await db
    .select()
    .from(seasonPoints)
    .where(eq(seasonPoints.year, year))
    .innerJoin(users, eq(seasonPoints.userId, users.id));
  return seasonPointRows;
};
