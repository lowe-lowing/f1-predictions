import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema/auth";
import { type UserPermissionId, userPermissionIdSchema, userPermissions } from "@/lib/db/schema/userPermissions";
import { eq } from "drizzle-orm";

export const getUserPermissions = async () => {
  const rows = await db.select().from(userPermissions).innerJoin(users, eq(userPermissions.userId, users.id));
  const u = rows;
  return { userPermissions: u };
};

export const getUserPermissionById = async (id: UserPermissionId) => {
  const { id: userPermissionId } = userPermissionIdSchema.parse({ id });
  const [row] = await db
    .select()
    .from(userPermissions)
    .innerJoin(users, eq(userPermissions.userId, users.id))
    .where(eq(userPermissions.id, userPermissionId));
  if (row === undefined) return {};
  const u = row;
  return { userPermission: u };
};

export const getUserPermissionsByUser = async () => {
  const { session } = await getUserAuth();
  const [row] = await db
    .select()
    .from(userPermissions)
    .innerJoin(users, eq(userPermissions.userId, users.id))
    .where(eq(userPermissions.userId, session?.user.id!));
  if (row === undefined) return {};
  const u = row;
  return { userPermission: u };
};

export const getCanEditDrivers = async () => {
  const { userPermission } = await getUserPermissionsByUser();
  return userPermission?.user_permissions.canEditDrivers ?? false;
};
