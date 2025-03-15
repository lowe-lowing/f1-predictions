"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type UserPermission, CompleteUserPermission } from "@/lib/db/schema/userPermissions";
import Modal from "@/components/shared/Modal";

import { useOptimisticUserPermissions } from "@/app/(app)/user-permissions/useOptimisticUserPermissions";
import { Button } from "@/components/ui/button";
import UserPermissionForm from "./UserPermissionForm";
import { PlusIcon } from "lucide-react";
import { User } from "@/lib/db/schema/auth";

type TOpenModal = (userPermission?: UserPermission) => void;

export default function UserPermissionList({
  userPermissions,
  users,
}: {
  userPermissions: CompleteUserPermission[];
  users: User[];
}) {
  const { optimisticUserPermissions, addOptimisticUserPermission } = useOptimisticUserPermissions(userPermissions);
  const [open, setOpen] = useState(false);
  const [activeUserPermission, setActiveUserPermission] = useState<UserPermission | null>(null);
  const openModal = (userPermission?: UserPermission) => {
    setOpen(true);
    userPermission ? setActiveUserPermission(userPermission) : setActiveUserPermission(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeUserPermission ? "Edit UserPermission" : "Create User Permission"}
      >
        <UserPermissionForm
          userPermission={activeUserPermission}
          addOptimistic={addOptimisticUserPermission}
          openModal={openModal}
          closeModal={closeModal}
          users={users}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticUserPermissions.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticUserPermissions.map((userPermission) => (
            <UserPermission
              userPermission={userPermission}
              key={userPermission.user_permissions.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const UserPermission = ({
  userPermission: { user_permissions, user },
  openModal,
}: {
  userPermission: CompleteUserPermission;
  openModal: TOpenModal;
}) => {
  const optimistic = user_permissions.id === "optimistic";
  const deleting = user_permissions.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("user-permissions") ? pathname : pathname + "/user-permissions/";

  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : ""
      )}
    >
      <div className="w-full">
        <div>{user.name}</div>
        <div className="text-muted-foreground">
          {user_permissions.canEditDrivers ? "Can Edit Drivers" : "Can Not Edit Drivers"}
        </div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={basePath + "/" + user_permissions.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">No user permissions</h3>
      <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new user permission.</p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New User Permissions{" "}
        </Button>
      </div>
    </div>
  );
};
