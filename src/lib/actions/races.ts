"use server";

import { revalidatePath } from "next/cache";
import {
  createRace,
  deleteRace,
  updateRace,
} from "@/lib/api/races/mutations";
import {
  RaceId,
  NewRaceParams,
  UpdateRaceParams,
  raceIdSchema,
  insertRaceParams,
  updateRaceParams,
} from "@/lib/db/schema/races";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateRaces = () => revalidatePath("/races");

export const createRaceAction = async (input: NewRaceParams) => {
  try {
    const payload = insertRaceParams.parse(input);
    await createRace(payload);
    revalidateRaces();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateRaceAction = async (input: UpdateRaceParams) => {
  try {
    const payload = updateRaceParams.parse(input);
    await updateRace(payload.id, payload);
    revalidateRaces();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteRaceAction = async (input: RaceId) => {
  try {
    const payload = raceIdSchema.parse({ id: input });
    await deleteRace(payload.id);
    revalidateRaces();
  } catch (e) {
    return handleErrors(e);
  }
};