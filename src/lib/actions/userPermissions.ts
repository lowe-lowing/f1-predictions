"use server";

import { revalidatePath } from "next/cache";
import {
  createUserPermission,
  deleteUserPermission,
  updateUserPermission,
} from "@/lib/api/userPermissions/mutations";
import {
  UserPermissionId,
  NewUserPermissionParams,
  UpdateUserPermissionParams,
  userPermissionIdSchema,
  insertUserPermissionParams,
  updateUserPermissionParams,
} from "@/lib/db/schema/userPermissions";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateUserPermissions = () => revalidatePath("/user-permissions");

export const createUserPermissionAction = async (input: NewUserPermissionParams) => {
  try {
    const payload = insertUserPermissionParams.parse(input);
    await createUserPermission(payload);
    revalidateUserPermissions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateUserPermissionAction = async (input: UpdateUserPermissionParams) => {
  try {
    const payload = updateUserPermissionParams.parse(input);
    await updateUserPermission(payload.id, payload);
    revalidateUserPermissions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteUserPermissionAction = async (input: UserPermissionId) => {
  try {
    const payload = userPermissionIdSchema.parse({ id: input });
    await deleteUserPermission(payload.id);
    revalidateUserPermissions();
  } catch (e) {
    return handleErrors(e);
  }
};