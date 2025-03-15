import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getUserPermissionById } from "@/lib/api/userPermissions/queries";
import OptimisticUserPermission from "./OptimisticUserPermission";
import { checkAuth } from "@/lib/auth/utils";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";

export const revalidate = 0;

export default async function UserPermissionPage({ params }: { params: Promise<{ userPermissionId: string }> }) {
  const { userPermissionId } = await params;

  return (
    <main className="overflow-auto">
      <UserPermission id={userPermissionId} />
    </main>
  );
}

const UserPermission = async ({ id }: { id: string }) => {
  await checkAuth();
  const u = await db.select().from(users);

  const { userPermission } = await getUserPermissionById(id);

  if (!userPermission) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="user-permissions" />
        <OptimisticUserPermission userPermission={userPermission.user_permissions} users={u} />
      </div>
    </Suspense>
  );
};
