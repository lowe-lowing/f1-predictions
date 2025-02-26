"use server";

import { revalidatePath } from "next/cache";
import {
  createPointHistory,
  deletePointHistory,
  updatePointHistory,
} from "@/lib/api/pointHistory/mutations";
import {
  PointHistoryId,
  NewPointHistoryParams,
  UpdatePointHistoryParams,
  pointHistoryIdSchema,
  insertPointHistoryParams,
  updatePointHistoryParams,
} from "@/lib/db/schema/pointHistory";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidatePointHistories = () => revalidatePath("/point-history");

export const createPointHistoryAction = async (input: NewPointHistoryParams) => {
  try {
    const payload = insertPointHistoryParams.parse(input);
    await createPointHistory(payload);
    revalidatePointHistories();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updatePointHistoryAction = async (input: UpdatePointHistoryParams) => {
  try {
    const payload = updatePointHistoryParams.parse(input);
    await updatePointHistory(payload.id, payload);
    revalidatePointHistories();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deletePointHistoryAction = async (input: PointHistoryId) => {
  try {
    const payload = pointHistoryIdSchema.parse({ id: input });
    await deletePointHistory(payload.id);
    revalidatePointHistories();
  } catch (e) {
    return handleErrors(e);
  }
};