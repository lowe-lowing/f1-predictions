"use server";

import { revalidatePath } from "next/cache";
import { createRaceResult, deleteRaceResult, updateRaceResult } from "@/lib/api/raceResults/mutations";
import {
  RaceResultId,
  NewRaceResultParams,
  UpdateRaceResultParams,
  raceResultIdSchema,
  insertRaceResultParams,
  updateRaceResultParams,
} from "@/lib/db/schema/raceResults";
import { getRaceResultsByRaceId } from "@/lib/api/raceResults/queries";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateRaceResults = () => revalidatePath("/race-results");

export const createRaceResultAction = async (input: NewRaceResultParams) => {
  try {
    const payload = insertRaceResultParams.parse(input);
    await createRaceResult(payload);
    revalidateRaceResults();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateRaceResultAction = async (input: UpdateRaceResultParams) => {
  try {
    const payload = updateRaceResultParams.parse(input);
    await updateRaceResult(payload.id, payload);
    revalidateRaceResults();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteRaceResultAction = async (input: RaceResultId) => {
  try {
    const payload = raceResultIdSchema.parse({ id: input });
    await deleteRaceResult(payload.id);
    revalidateRaceResults();
  } catch (e) {
    return handleErrors(e);
  }
};

export const getRaceResultsByRaceIdAction = async (raceId: string) => {
  return await getRaceResultsByRaceId(raceId);
};
