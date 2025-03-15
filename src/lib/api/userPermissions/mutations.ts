import { db } from "@/lib/db/index";
import {
  insertUserPermissionSchema,
  NewUserPermissionParams,
  UpdateUserPermissionParams,
  updateUserPermissionSchema,
  UserPermissionId,
  userPermissionIdSchema,
  userPermissions,
} from "@/lib/db/schema/userPermissions";
import { eq } from "drizzle-orm";

export const createUserPermission = async (userPermission: NewUserPermissionParams) => {
  const newUserPermission = insertUserPermissionSchema.parse({ ...userPermission });
  try {
    const [u] = await db.insert(userPermissions).values(newUserPermission).returning();
    return { userPermission: u };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateUserPermission = async (id: UserPermissionId, userPermission: UpdateUserPermissionParams) => {
  const { id: userPermissionId } = userPermissionIdSchema.parse({ id });
  const newUserPermission = updateUserPermissionSchema.parse({ ...userPermission });
  try {
    const [u] = await db
      .update(userPermissions)
      .set({ ...newUserPermission, updatedAt: new Date() })
      .where(eq(userPermissions.id, userPermissionId!))
      .returning();
    return { userPermission: u };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteUserPermission = async (id: UserPermissionId) => {
  const { id: userPermissionId } = userPermissionIdSchema.parse({ id });
  try {
    const [u] = await db.delete(userPermissions).where(eq(userPermissions.id, userPermissionId!)).returning();
    return { userPermission: u };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};
