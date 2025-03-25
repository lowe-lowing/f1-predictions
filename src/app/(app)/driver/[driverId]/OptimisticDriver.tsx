"use client";

import { TAddOptimistic } from "@/app/(app)/drivers/[season]/useOptimisticDrivers";
import { type Driver } from "@/lib/db/schema/drivers";
import { cn } from "@/lib/utils";
import { useOptimistic, useState } from "react";

import DriverForm from "@/components/drivers/DriverForm";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function OptimisticDriver({ driver, canEdit }: { driver: Driver; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Driver) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticDriver, setOptimisticDriver] = useOptimistic(driver);
  const updateDriver: TAddOptimistic = (input) => setOptimisticDriver({ ...input.data });

  return (
    <div>
      <Modal open={open} setOpen={setOpen} title="Edit Driver">
        <DriverForm
          driver={optimisticDriver}
          canEdit={canEdit}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateDriver}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:gap-2">
          <h1 className="font-semibold text-2xl">{optimisticDriver.name}</h1>
          <p className="text-muted-foreground">({optimisticDriver.season})</p>
        </div>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <BigDriverComponent driver={optimisticDriver} />
    </div>
  );
}

const BigDriverComponent = ({ driver }: { driver: Driver }) => {
  return (
    <div
      className={cn(
        "bg-secondary p-4 rounded-lg flex flex-wrap gap-2 items-start justify-between",
        driver.id === "optimistic" ? "animate-pulse" : ""
      )}
    >
      <div className="flex gap-2 items-start flex-wrap">
        {driver.image && <Image src={driver.image} alt={`No Picture`} width={200} height={200} className="h-44 w-44" />}
        <div className="flex gap-2 items-center">
          <p className="text-3xl">#{driver.number}</p>
          <div className="text-left">
            <div className="text-xl">{driver.name}</div>
            <div className="text-sm text-muted-foreground">{driver.team}</div>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>Created at: {new Date(driver.createdAt).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}</p>
        <p>Updated at: {new Date(driver.updatedAt).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}</p>
      </div>
    </div>
  );
};
