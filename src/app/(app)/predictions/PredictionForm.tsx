"use client";
import FormLoadingButton from "@/components/FormLoadingButton";
import { Button } from "@/components/ui/button";
import { createPredictionAction, updatePredictionAction } from "@/lib/actions/predictions";
import { PredictionFull } from "@/lib/api/predictions/queries";
import { Driver } from "@/lib/db/schema/drivers";
import { Race } from "@/lib/db/schema/races";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Lock, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { DriverComponent } from "./DriverComponent";
import SearchDriver from "./SearchDriver";

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

  const handleDrop = (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over) return;
    const index = over.id as number;
    const draggedIndex = active.id as number;
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder array
    const updatedItems = [...selectedDrivers];
    const currentItem = updatedItems[index];
    const draggedItem = updatedItems[draggedIndex];
    updatedItems[index] = draggedItem;
    updatedItems[draggedIndex] = currentItem;

    setSelectedDrivers(updatedItems);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    })
  );

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
      <DndContext onDragEnd={handleDrop} sensors={sensors}>
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
              <Droppable
                index={index}
                className={cn(
                  "border h-12 sm:h-16 py-1 pr-1",
                  { "border-dashed rounded-md border-muted-foreground": draggedIndex !== null },
                  { "border-transparent": draggedIndex === null }
                )}
              >
                {selectedDrivers[index] && (
                  <div className="flex gap-2 items-center">
                    <Draggable index={index} className="w-full" setDraggedIndex={setDraggedIndex}>
                      <DriverComponent
                        driver={selectedDrivers[index]}
                        className={cn("w-full", { "cursor-grab": editing })}
                      />
                    </Draggable>
                    {(prediction == null || editing) && draggedIndex === null && (
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
              </Droppable>
            </div>
          ))}
        </div>
      </DndContext>
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

interface DraggableProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  setDraggedIndex: (index: number | null) => void;
}
const Draggable = ({ children, index, setDraggedIndex, ...props }: DraggableProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: index,
  });
  useEffect(() => {
    setDraggedIndex(isDragging ? index : null);
  }, [isDragging]);
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} {...props}>
      {children}
    </div>
  );
};

interface DroppableProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

export function Droppable({ index, ...props }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: index,
  });

  return (
    <div ref={setNodeRef} {...props}>
      {props.children}
    </div>
  );
}
