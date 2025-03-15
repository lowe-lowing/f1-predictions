"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/user-permissions/useOptimisticUserPermissions";
import { type UserPermission } from "@/lib/db/schema/userPermissions";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import UserPermissionForm from "@/components/userPermissions/UserPermissionForm";
import { User } from "@/lib/db/schema/auth";

export default function OptimisticUserPermission({
  userPermission,
  users,
}: {
  userPermission: UserPermission;
  users: User[];
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: UserPermission) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticUserPermission, setOptimisticUserPermission] = useOptimistic(userPermission);
  const updateUserPermission: TAddOptimistic = (input) => setOptimisticUserPermission({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <UserPermissionForm
          users={users}
          userPermission={optimisticUserPermission}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateUserPermission}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticUserPermission.canEditDrivers}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticUserPermission.id === "optimistic" ? "animate-pulse" : ""
        )}
      >
        {JSON.stringify(optimisticUserPermission, null, 2)}
      </pre>
    </div>
  );
}
