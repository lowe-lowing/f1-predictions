import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type PredictionId, predictionIdSchema, predictions } from "@/lib/db/schema/predictions";

export const getPredictions = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select().from(predictions).where(eq(predictions.userId, session?.user.id!));
  const p = rows
  return { predictions: p };
};

export const getPredictionById = async (id: PredictionId) => {
  const { session } = await getUserAuth();
  const { id: predictionId } = predictionIdSchema.parse({ id });
  const [row] = await db.select().from(predictions).where(and(eq(predictions.id, predictionId), eq(predictions.userId, session?.user.id!)));
  if (row === undefined) return {};
  const p = row;
  return { prediction: p };
};


