import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import {
  PointHistoryId,
  NewPointHistoryParams,
  UpdatePointHistoryParams,
  updatePointHistorySchema,
  insertPointHistorySchema,
  pointHistoryIdSchema,
  pointHistory,
} from "@/lib/db/schema/pointHistory";

export const createPointHistory = async (pointHistoryParams: NewPointHistoryParams) => {
  const newPointHistory = insertPointHistorySchema.parse(pointHistoryParams);
  try {
    const [p] = await db.insert(pointHistory).values(newPointHistory).returning();
    return { pointHistory: p };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updatePointHistory = async (id: PointHistoryId, pointHistoryParams: UpdatePointHistoryParams) => {
  const { id: pointHistoryId } = pointHistoryIdSchema.parse({ id });
  const newPointHistory = updatePointHistorySchema.parse(pointHistoryParams);
  try {
    const [p] = await db
      .update(pointHistory)
      .set({ ...newPointHistory, updatedAt: new Date() })
      .where(eq(pointHistory.id, pointHistoryId!))
      .returning();
    return { pointHistory: p };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deletePointHistory = async (id: PointHistoryId) => {
  const { id: pointHistoryId } = pointHistoryIdSchema.parse({ id });
  try {
    const [p] = await db.delete(pointHistory).where(eq(pointHistory.id, pointHistoryId!)).returning();
    return { pointHistory: p };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};
