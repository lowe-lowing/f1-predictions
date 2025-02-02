"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/drivers/useOptimisticDrivers";
import { type Driver } from "@/lib/db/schema/drivers";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import DriverForm from "@/components/drivers/DriverForm";


export default function OptimisticDriver({ 
  driver,
   
}: { 
  driver: Driver; 
  
  
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Driver) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticDriver, setOptimisticDriver] = useOptimistic(driver);
  const updateDriver: TAddOptimistic = (input) =>
    setOptimisticDriver({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <DriverForm
          driver={optimisticDriver}
          
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateDriver}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticDriver.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticDriver.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticDriver, null, 2)}
      </pre>
    </div>
  );
}
