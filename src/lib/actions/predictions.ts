"use server";

import { revalidatePath } from "next/cache";
import { createPrediction, deletePrediction, updatePrediction } from "@/lib/api/predictions/mutations";
import {
  PredictionId,
  NewPredictionParams,
  UpdatePredictionParams,
  predictionIdSchema,
  insertPredictionParams,
  updatePredictionParams,
} from "@/lib/db/schema/predictions";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidatePredictions = () => revalidatePath("/predictions");

export const createPredictionAction = async (input: NewPredictionParams) => {
  try {
    const payload = insertPredictionParams.parse(input);
    await createPrediction(payload);
    revalidatePredictions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updatePredictionAction = async (input: UpdatePredictionParams) => {
  try {
    const payload = updatePredictionParams.parse(input);
    await updatePrediction(payload.id, payload);
    revalidatePredictions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deletePredictionAction = async (input: PredictionId) => {
  try {
    const payload = predictionIdSchema.parse({ id: input });
    await deletePrediction(payload.id);
    revalidatePredictions();
  } catch (e) {
    return handleErrors(e);
  }
};
