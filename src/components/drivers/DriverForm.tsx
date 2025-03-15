import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/drivers/useOptimisticDrivers";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import { type Driver, insertDriverParams } from "@/lib/db/schema/drivers";
import { createDriverAction, deleteDriverAction, updateDriverAction } from "@/lib/actions/drivers";

const DriverForm = ({
  driver,
  canEdit,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  driver?: Driver | null;
  canEdit: boolean;
  openModal?: (driver?: Driver) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } = useValidatedForm<Driver>(insertDriverParams);
  const editing = !!driver?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("drivers");

  const onSuccess = (action: Action, data?: { error: string; values: Driver }) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Driver ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const driverParsed = await insertDriverParams.safeParseAsync({ ...payload });
    if (!driverParsed.success) {
      setErrors(driverParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = driverParsed.data;
    const pendingDriver: Driver = {
      updatedAt: driver?.updatedAt ?? new Date(),
      createdAt: driver?.createdAt ?? new Date(),
      id: driver?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingDriver,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateDriverAction({ ...values, id: driver.id })
          : await createDriverAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingDriver,
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
        <Label className={cn("mb-2 inline-block", errors?.name ? "text-destructive" : "")}>Name</Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={driver?.name ?? ""}
        />
        {errors?.name ? <p className="text-xs text-destructive mt-2">{errors.name[0]}</p> : <div className="h-6" />}
      </div>
      <div>
        <Label className={cn("mb-2 inline-block", errors?.number ? "text-destructive" : "")}>Number</Label>
        <Input
          type="text"
          name="number"
          className={cn(errors?.number ? "ring ring-destructive" : "")}
          defaultValue={driver?.number ?? ""}
        />
        {errors?.number ? <p className="text-xs text-destructive mt-2">{errors.number[0]}</p> : <div className="h-6" />}
      </div>
      <div>
        <Label className={cn("mb-2 inline-block", errors?.image ? "text-destructive" : "")}>Image</Label>
        <Input
          type="text"
          name="image"
          className={cn(errors?.image ? "ring ring-destructive" : "")}
          defaultValue={driver?.image ?? ""}
        />
        {errors?.image ? <p className="text-xs text-destructive mt-2">{errors.image[0]}</p> : <div className="h-6" />}
      </div>
      <div>
        <Label className={cn("mb-2 inline-block", errors?.team ? "text-destructive" : "")}>Team</Label>
        <Input
          type="text"
          name="team"
          className={cn(errors?.team ? "ring ring-destructive" : "")}
          defaultValue={driver?.team ?? ""}
        />
        {errors?.team ? <p className="text-xs text-destructive mt-2">{errors.team[0]}</p> : <div className="h-6" />}
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      {canEdit && <SaveButton errors={hasErrors} editing={editing} />}

      {/* Delete Button */}
      {canEdit && editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: driver });
              const error = await deleteDriverAction(driver.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: driver,
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

export default DriverForm;

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
