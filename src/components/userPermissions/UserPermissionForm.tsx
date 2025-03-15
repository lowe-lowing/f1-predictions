import { z } from "zod";

import { useValidatedForm } from "@/lib/hooks/useValidatedForm";
import { useRouter } from "next/navigation";
import { use, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { type TAddOptimistic } from "@/app/(app)/user-permissions/useOptimisticUserPermissions";
import { type Action, cn } from "@/lib/utils";

import { useBackPath } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";

import {
  createUserPermissionAction,
  deleteUserPermissionAction,
  updateUserPermissionAction,
} from "@/lib/actions/userPermissions";
import { type UserPermission, insertUserPermissionParams } from "@/lib/db/schema/userPermissions";
import { User } from "@/lib/db/schema/auth";
import SearchUser, { UserComponent } from "@/components/userPermissions/SearchUser";

const UserPermissionForm = ({
  users,
  userPermission,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  users: User[];
  userPermission?: UserPermission | null;
  openModal?: (userPermission?: UserPermission) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } = useValidatedForm<UserPermission>(insertUserPermissionParams);
  const editing = !!userPermission?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const [selectedUser, setSelectedUser] = useState<User | null>(
    users.find((u) => u.id === userPermission?.userId) ?? null
  );

  const router = useRouter();
  const backpath = useBackPath("user-permissions");

  const onSuccess = (action: Action, data?: { error: string; values: UserPermission }) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`UserPermission ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());

    const userPermissionParsed = await insertUserPermissionParams.safeParseAsync({
      ...payload,
      userId: selectedUser?.id,
    });
    if (!userPermissionParsed.success) {
      setErrors(userPermissionParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = userPermissionParsed.data;

    const pendingUserPermission: UserPermission = {
      updatedAt: userPermission?.updatedAt ?? new Date(),
      createdAt: userPermission?.createdAt ?? new Date(),
      id: userPermission?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingUserPermission,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateUserPermissionAction({ ...values, id: userPermission.id })
          : await createUserPermissionAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingUserPermission,
        };
        onSuccess(editing ? "update" : "create", error ? errorFormatted : undefined);
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
      <div>
        <Label className={cn("mb-2 inline-block", errors?.canEditDrivers ? "text-destructive" : "")}>For User</Label>
        <SearchUser users={users} onSelect={(u) => setSelectedUser(u)} />
        {selectedUser && <UserComponent user={selectedUser} />}
      </div>
      <div>
        <Label className={cn("mb-2 inline-block", errors?.canEditDrivers ? "text-destructive" : "")}>
          Can Edit Drivers
        </Label>
        <br />
        <Checkbox
          defaultChecked={userPermission?.canEditDrivers || "indeterminate"}
          name={"canEditDrivers"}
          className={cn(errors?.canEditDrivers ? "ring ring-destructive" : "")}
        />
        {errors?.canEditDrivers ? (
          <p className="text-xs text-destructive mt-2">{errors.canEditDrivers[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: userPermission });
              const error = await deleteUserPermissionAction(userPermission.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: userPermission,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default UserPermissionForm;

const SaveButton = ({ editing, errors }: { editing: Boolean; errors: boolean }) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing ? `Sav${isUpdating ? "ing..." : "e"}` : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
