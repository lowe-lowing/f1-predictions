import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  PredictionId, 
  NewPredictionParams,
  UpdatePredictionParams, 
  updatePredictionSchema,
  insertPredictionSchema, 
  predictions,
  predictionIdSchema 
} from "@/lib/db/schema/predictions";
import { getUserAuth } from "@/lib/auth/utils";

export const createPrediction = async (prediction: NewPredictionParams) => {
  const { session } = await getUserAuth();
  const newPrediction = insertPredictionSchema.parse({ ...prediction, userId: session?.user.id! });
  try {
    const [p] =  await db.insert(predictions).values(newPrediction).returning();
    return { prediction: p };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updatePrediction = async (id: PredictionId, prediction: UpdatePredictionParams) => {
  const { session } = await getUserAuth();
  const { id: predictionId } = predictionIdSchema.parse({ id });
  const newPrediction = updatePredictionSchema.parse({ ...prediction, userId: session?.user.id! });
  try {
    const [p] =  await db
     .update(predictions)
     .set({...newPrediction, updatedAt: new Date() })
     .where(and(eq(predictions.id, predictionId!), eq(predictions.userId, session?.user.id!)))
     .returning();
    return { prediction: p };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deletePrediction = async (id: PredictionId) => {
  const { session } = await getUserAuth();
  const { id: predictionId } = predictionIdSchema.parse({ id });
  try {
    const [p] =  await db.delete(predictions).where(and(eq(predictions.id, predictionId!), eq(predictions.userId, session?.user.id!)))
    .returning();
    return { prediction: p };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

