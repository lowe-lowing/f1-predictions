"use client";
import FormLoadingButton from "@/components/FormLoadingButton";
import { Button } from "@/components/ui/button";
import { createPredictionAction, updatePredictionAction } from "@/lib/actions/predictions";
import { PredictionFull } from "@/lib/api/predictions/queries";
import { Driver } from "@/lib/db/schema/drivers";
import { Race } from "@/lib/db/schema/races";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Lock, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { DriverComponent } from "./DriverComponent";
import SearchDriver from "./SearchDriver";
import { set } from "zod";

let initialState: void;
const positions = ["1st", "2nd", "3rd", "4th", "5th"];

interface CreatePredictionFormProps {
  drivers: Driver[];
  race: Race;
  prediction?: PredictionFull;
}

// export default function PredictionForm({ drivers, race, prediction }: CreatePredictionFormProps) {
export default function PredictionForm({ drivers, race, prediction }: CreatePredictionFormProps) {
  const predictedDriverIds = [
    prediction?.pos1Driver?.id || null,
    prediction?.pos2Driver?.id || null,
    prediction?.pos3Driver?.id || null,
    prediction?.pos4Driver?.id || null,
    prediction?.pos5Driver?.id || null,
  ];
  const initialDrivers = prediction
    ? drivers.filter((driver) => !predictedDriverIds.includes(driver.id))
    : [...drivers];
  const initialSelected = predictedDriverIds.map((pd) => drivers.find((d) => pd == d.id) || null);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>(initialDrivers);
  const [selectedDrivers, setSelectedDrivers] = useState<Array<Driver | null>>(initialSelected);
  const [editing, setEditing] = useState(false);

  const formChanged = !selectedDrivers.every((driver, index) => driver?.id === initialSelected[index]?.id);
  const raceLocked = race?.lockedAt ? race.lockedAt < new Date() : false;

  // select driver, add to selected drivers and remove from available drivers
  const selectDriver = (driver: Driver, index: number) => {
    const existingDriver = selectedDrivers[index];
    let newAvailableDrivers = availableDrivers.filter((d) => d.id !== driver.id);
    if (existingDriver) {
      newAvailableDrivers = [...newAvailableDrivers, existingDriver];
    }
    const newDrivers = [...selectedDrivers];
    newDrivers[index] = driver;
    setSelectedDrivers(newDrivers);
    setAvailableDrivers(newAvailableDrivers);
  };

  // deselect driver, add back to available drivers and set selected driver to null
  const deselectDriver = (index: number) => () => {
    const driver = selectedDrivers[index];
    if (driver) {
      const newDrivers = [...selectedDrivers];
      newDrivers[index] = null;
      setSelectedDrivers(newDrivers);
      setAvailableDrivers([...availableDrivers, driver]);
    }
  };

  const onSubmit = async (_: any, formData: FormData) => {
    if (prediction) {
      await updatePredictionAction({
        id: prediction.id,
        raceId: prediction.race.id,
        pos1DriverId: selectedDrivers[0] ? selectedDrivers[0].id : null,
        pos2DriverId: selectedDrivers[1] ? selectedDrivers[1].id : null,
        pos3DriverId: selectedDrivers[2] ? selectedDrivers[2].id : null,
        pos4DriverId: selectedDrivers[3] ? selectedDrivers[3].id : null,
        pos5DriverId: selectedDrivers[4] ? selectedDrivers[4].id : null,
      });
      setEditing(false);
    } else {
      await createPredictionAction({
        raceId: race.id,
        pos1DriverId: selectedDrivers[0] ? selectedDrivers[0].id : null,
        pos2DriverId: selectedDrivers[1] ? selectedDrivers[1].id : null,
        pos3DriverId: selectedDrivers[2] ? selectedDrivers[2].id : null,
        pos4DriverId: selectedDrivers[3] ? selectedDrivers[3].id : null,
        pos5DriverId: selectedDrivers[4] ? selectedDrivers[4].id : null,
      });
    }
    return;
  };

  const [state, formAction] = useActionState(onSubmit, initialState);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDrop = (index: any) => {
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder array
    const updatedItems = [...selectedDrivers];
    const currentItem = updatedItems[index];
    const draggedItem = updatedItems[draggedIndex];
    updatedItems[index] = draggedItem;
    updatedItems[draggedIndex] = currentItem;

    setSelectedDrivers(updatedItems);
    setDraggedIndex(null);
  };

  return (
    <form action={formAction} className="space-y-4">
      {raceLocked && <p className="text-sm text-destructive -mb-2">Qualifying has begun and predictions are locked</p>}
      <div className="flex items-center gap-2">
        <div>
          <p className="text-xl">{race.name}</p>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {race.date.toLocaleString()}
          </p>
        </div>
        {raceLocked && <Lock size={24} />}
        {prediction && !raceLocked && (
          <Button
            className={cn({ invisible: editing })}
            type="button"
            onClick={() => setEditing(true)}
            variant={"secondary"}
          >
            Edit
          </Button>
        )}
      </div>
      <div className={cn("w-fit space-y-2", { "space-y-4 sm:space-y-2 md:space-y-4 lg:space-y-2": editing })}>
        {positions.map((position, index) => (
          <div
            key={index}
            className={cn("grid", {
              "sm:grid-cols-[auto_1fr] md:grid-cols-1 lg:grid-cols-[auto_1fr] gap-2 items-center": editing,
              "grid-cols-[auto_1fr]": !editing,
            })}
          >
            <div className="flex items-center gap-2">
              <Label className="w-10 sm:w-14 text-center">{position}</Label>
              {(prediction == null || editing) && (
                <SearchDriver drivers={availableDrivers} onSelect={(driver: Driver) => selectDriver(driver, index)} />
              )}
            </div>
            <div
              className={cn(
                "border h-12 sm:h-14 py-1 pr-1",
                { "border-dashed rounded-md border-muted-foreground": draggedIndex !== null },
                { "border-transparent": draggedIndex === null }
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
            >
              {selectedDrivers[index] && (
                <div
                  className="flex gap-2 items-center"
                  onDragStart={() => setDraggedIndex(index)}
                  onDragEnd={() => setDraggedIndex(null)}
                  draggable={editing}
                >
                  {/* TODO: Do i really need to make it smaller here? */}
                  <DriverComponent
                    driver={selectedDrivers[index]}
                    className={cn("w-full", { "cursor-grab": editing })}
                  />
                  {(prediction == null || editing) && (
                    <Button
                      type="button"
                      onClick={deselectDriver(index)}
                      variant={"outline"}
                      size={"icon"}
                      tabIndex={-1}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {raceLocked ? null : prediction ? (
        editing && (
          <>
            <div className="space-x-2">
              <FormLoadingButton disabled={!formChanged}>Update Prediction</FormLoadingButton>
              <Button
                type="button"
                variant={"ghost"}
                onClick={() => {
                  setEditing(false);
                  setSelectedDrivers(initialSelected);
                  setAvailableDrivers(initialDrivers);
                }}
              >
                Cancel
              </Button>
            </div>
            {!formChanged && <p className="text-sm text-muted-foreground">Make some changes to be able to update</p>}
          </>
        )
      ) : (
        // disabled if no drivers selected
        <FormLoadingButton disabled={!selectedDrivers.some((d) => d != null)}>Create Prediction</FormLoadingButton>
      )}
    </form>
  );
}
