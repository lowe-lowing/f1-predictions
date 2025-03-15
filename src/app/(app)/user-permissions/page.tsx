import { Suspense } from "react";

import Loading from "@/app/loading";
import UserPermissionList from "@/components/userPermissions/UserPermissionList";
import { getUserPermissions } from "@/lib/api/userPermissions/queries";

import { checkAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";

export const revalidate = 0;

export default async function UserPermissionsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">User Permissions</h1>
        </div>
        <UserPermissions />
      </div>
    </main>
  );
}

const UserPermissions = async () => {
  await checkAuth();
  const u = await db.select().from(users);

  const { userPermissions } = await getUserPermissions();

  return (
    <Suspense fallback={<Loading />}>
      <UserPermissionList userPermissions={userPermissions} users={u} />
    </Suspense>
  );
};
