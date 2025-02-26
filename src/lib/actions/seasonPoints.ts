"use server";

import { revalidatePath } from "next/cache";
import { createSeasonPoint, deleteSeasonPoint, updateSeasonPoint } from "@/lib/api/seasonPoints/mutations";
import {
  SeasonPointId,
  NewSeasonPointParams,
  UpdateSeasonPointParams,
  seasonPointIdSchema,
  insertSeasonPointParams,
  updateSeasonPointParams,
} from "@/lib/db/schema/seasonPoints";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateSeasonPoints = () => revalidatePath("/season-points");

export const createSeasonPointAction = async (input: NewSeasonPointParams) => {
  try {
    const payload = insertSeasonPointParams.parse(input);
    await createSeasonPoint(payload);
    revalidateSeasonPoints();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateSeasonPointAction = async (input: UpdateSeasonPointParams) => {
  try {
    const payload = updateSeasonPointParams.parse(input);
    await updateSeasonPoint(payload.id, payload);
    revalidateSeasonPoints();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteSeasonPointAction = async (input: SeasonPointId) => {
  try {
    const payload = seasonPointIdSchema.parse({ id: input });
    await deleteSeasonPoint(payload.id);
    revalidateSeasonPoints();
  } catch (e) {
    return handleErrors(e);
  }
};
