"use server";

import { revalidatePath } from "next/cache";
import {
  createDriver,
  deleteDriver,
  updateDriver,
} from "@/lib/api/drivers/mutations";
import {
  DriverId,
  NewDriverParams,
  UpdateDriverParams,
  driverIdSchema,
  insertDriverParams,
  updateDriverParams,
} from "@/lib/db/schema/drivers";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateDrivers = () => revalidatePath("/drivers");

export const createDriverAction = async (input: NewDriverParams) => {
  try {
    const payload = insertDriverParams.parse(input);
    await createDriver(payload);
    revalidateDrivers();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateDriverAction = async (input: UpdateDriverParams) => {
  try {
    const payload = updateDriverParams.parse(input);
    await updateDriver(payload.id, payload);
    revalidateDrivers();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteDriverAction = async (input: DriverId) => {
  try {
    const payload = driverIdSchema.parse({ id: input });
    await deleteDriver(payload.id);
    revalidateDrivers();
  } catch (e) {
    return handleErrors(e);
  }
};