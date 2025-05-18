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
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Label } from "@radix-ui/react-dropdown-menu";
import { format, formatDistance } from "date-fns";
import { Lock, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { DriverComponent } from "./DriverComponent";
import SearchDriver from "./SearchDriver";
import { sv } from "date-fns/locale";

let initialState: void;
const positions = ["1st", "2nd", "3rd", "4th", "5th"];

interface CreatePredictionFormProps {
  drivers: Driver[];
  race: Race;
  prediction?: PredictionFull;
}

// TODO: improve the code readability of this component, take some ideas from chatgpt
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

  const checkRaceLocked = (lockedAt: Date | undefined | null) => (lockedAt ? lockedAt < new Date() : false);
  const raceLocked = checkRaceLocked(race.lockedAt);

  const checkLocked = (lockedAt: Date | undefined | null) => {
    const locked = checkRaceLocked(lockedAt);
    if (locked) {
      toast.error("Qualifying has begun and predictions are locked");
    }
    return locked;
  };

  const checkLockedAndCancel = (lockedAt: Date | undefined | null) => {
    const locked = checkRaceLocked(lockedAt);
    if (locked) {
      handleCancel();
      toast.error("Qualifying has begun and predictions are locked");
    }
    return locked;
  };

  // select driver, add to selected drivers and remove from available drivers
  const selectDriver = (driver: Driver, index: number) => {
    if (checkLockedAndCancel(race.lockedAt)) return;

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
    if (checkLockedAndCancel(race.lockedAt)) return;

    const driver = selectedDrivers[index];
    if (driver) {
      const newDrivers = [...selectedDrivers];
      newDrivers[index] = null;
      setSelectedDrivers(newDrivers);
      setAvailableDrivers([...availableDrivers, driver]);
    }
  };

  const onSubmit = async (_: any, formData: FormData) => {
    if (checkLockedAndCancel(race.lockedAt)) return;

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

  const handleEdit = () => {
    if (checkLocked(race.lockedAt)) return;
    setEditing(true);
  };

  const handleCancel = () => {
    setSelectedDrivers(initialSelected);
    setAvailableDrivers(initialDrivers);
    setEditing(false);
  };

  const [state, formAction] = useActionState(onSubmit, initialState);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDrop = (event: DragEndEvent) => {
    if (checkLockedAndCancel(race.lockedAt)) return;

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

  const formatedDistance = formatDistance(race.lockedAt || new Date(), new Date(), {
    includeSeconds: true,
  });

  return (
    <form action={formAction} className="space-y-4">
      {race.lockedAt ? (
        raceLocked ? (
          <p className="text-sm text-destructive -mb-2">Qualifying has begun and predictions are locked</p>
        ) : (
          <p className="text-sm text-muted-foreground -mb-2">
            Qualifying begins{" "}
            <strong title={format(race.lockedAt, "EEEE do LLLL p", { locale: sv })}>
              {format(race.lockedAt, "EEEE do LLLL p")}
            </strong>{" "}
            and predictions will be locked in {formatedDistance}
          </p>
        )
      ) : null}
      <div className="flex items-center gap-2">
        <div>
          <p className="text-xl">{race.name}</p>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            <strong title={format(race.date, "EEEE do LLLL p", { locale: sv })}>
              {format(race.date, "EEEE do LLLL p")}
            </strong>
          </p>
        </div>
        {raceLocked && <Lock size={24} />}
        {prediction && !raceLocked && (
          <Button className={cn({ invisible: editing })} type="button" onClick={handleEdit} variant={"secondary"}>
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
                "sm:grid-cols-[auto_1fr] md:grid-cols-1 lg:grid-cols-[auto_1fr] gap-2 items-center":
                  editing || !prediction,
                "grid-cols-[auto_1fr]": !editing && prediction,
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
                    {editing || !prediction ? (
                      <Draggable index={index} className="w-full" setDraggedIndex={setDraggedIndex}>
                        <DriverComponent driver={selectedDrivers[index]} className="w-full cursor-grab" />
                      </Draggable>
                    ) : (
                      <DriverComponent driver={selectedDrivers[index]} className="w-full" />
                    )}
                    {(prediction == null || editing) && (
                      <Button
                        className={cn({ invisible: draggedIndex === index })}
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
              <Button type="button" variant={"ghost"} onClick={handleCancel}>
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
        zIndex: isDragging ? 1 : undefined,
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
export function Droppable({ index, className, ...props }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: index,
  });

  return (
    <div ref={setNodeRef} {...props} className={cn(className, { "border-primary": isOver })}>
      {props.children}
    </div>
  );
}
