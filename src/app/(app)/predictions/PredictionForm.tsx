"use client";
import FormLoadingButton from "@/components/FormLoadingButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createPredictionAction, updatePredictionAction } from "@/lib/actions/predictions";
import { PredictionFull } from "@/lib/api/predictions/queries";
import { Driver } from "@/lib/db/schema/drivers";
import { Race } from "@/lib/db/schema/races";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarDays, Eraser, Lock, MapPin, Pencil, Timer, X } from "lucide-react";
import { HTMLAttributes, ReactNode, Ref, useActionState, useMemo, useState } from "react";
import { toast } from "sonner";
import { DriverAvatar, PositionBadge } from "./positions";
import SearchDriver from "./SearchDriver";

type Slots = Array<Driver | null>;

const SLOT_COUNT = 5;
const LOCKED_MESSAGE = "Qualifying has begun and predictions are locked";

interface PredictionFormProps {
  drivers: Driver[];
  race: Race;
  prediction?: PredictionFull;
}

const isLocked = (lockedAt: Date | null) => (lockedAt ? lockedAt < new Date() : false);

const nextEmptySlot = (slots: Slots, from: number) => {
  for (let i = 1; i <= SLOT_COUNT; i++) {
    const index = (from + i) % SLOT_COUNT;
    if (!slots[index]) return index;
  }
  return null;
};

export default function PredictionForm({ drivers, race, prediction }: PredictionFormProps) {
  const initialSlots = useMemo<Slots>(() => {
    const ids = [
      prediction?.pos1Driver?.id,
      prediction?.pos2Driver?.id,
      prediction?.pos3Driver?.id,
      prediction?.pos4Driver?.id,
      prediction?.pos5Driver?.id,
    ];
    return ids.map((id) => drivers.find((d) => d.id === id) ?? null);
  }, [drivers, prediction]);

  const [slots, setSlots] = useState<Slots>(initialSlots);
  const [editing, setEditing] = useState(!prediction);
  const [activeSlot, setActiveSlot] = useState<number | null>(prediction ? null : 0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  // Only move focus into a slot's search after the user has interacted, so the page doesn't jump on load
  const [focusSlotSearch, setFocusSlotSearch] = useState(false);

  const raceLocked = isLocked(race.lockedAt);
  const editable = editing && !raceLocked;
  const hasChanges = slots.some((driver, index) => driver?.id !== initialSlots[index]?.id);
  const hasAnyDriver = slots.some((driver) => driver !== null);
  const availableDrivers = drivers.filter((driver) => !slots.some((d) => d?.id === driver.id));

  const resetForm = () => {
    setSlots(initialSlots);
    setEditing(!prediction);
    setActiveSlot(prediction ? null : 0);
    setFocusSlotSearch(false);
  };

  // Predictions can lock while the page is open, so every mutation re-checks the clock
  const ensureUnlocked = () => {
    if (!isLocked(race.lockedAt)) return true;
    toast.error(LOCKED_MESSAGE);
    resetForm();
    return false;
  };

  const activateSlot = (slot: number | null) => {
    setActiveSlot(slot);
    setFocusSlotSearch(true);
  };

  // Put a driver in a slot, then move on to the next empty one
  const assignDriver = (driver: Driver, slot: number) => {
    if (!ensureUnlocked()) return;
    const next = [...slots];
    next[slot] = driver;
    setSlots(next);
    activateSlot(nextEmptySlot(next, slot));
  };

  const clearAll = () => {
    if (!ensureUnlocked()) return;
    setSlots(Array(SLOT_COUNT).fill(null));
    activateSlot(0);
  };

  const clearSlot = (slot: number) => {
    if (!ensureUnlocked()) return;
    const next = [...slots];
    next[slot] = null;
    setSlots(next);
    activateSlot(slot);
  };

  const handleDragStart = (event: DragStartEvent) => setDraggedIndex(event.active.id as number);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggedIndex(null);
    if (!over || active.id === over.id || !ensureUnlocked()) return;
    const from = active.id as number;
    const to = over.id as number;
    const next = [...slots];
    [next[from], next[to]] = [next[to], next[from]];
    setSlots(next);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } })
  );

  const onSubmit = async () => {
    if (!ensureUnlocked()) return;
    const [pos1DriverId, pos2DriverId, pos3DriverId, pos4DriverId, pos5DriverId] = slots.map((d) => d?.id ?? null);
    const driverIds = { pos1DriverId, pos2DriverId, pos3DriverId, pos4DriverId, pos5DriverId };

    const error = prediction
      ? await updatePredictionAction({ id: prediction.id, raceId: race.id, ...driverIds })
      : await createPredictionAction({ raceId: race.id, ...driverIds });

    if (error) {
      toast.error(error);
      return;
    }
    toast.success(prediction ? "Prediction updated" : "Prediction saved");
    setEditing(false);
    setActiveSlot(null);
  };

  const [, formAction] = useActionState(onSubmit, undefined);

  const startEditing = () => {
    if (!ensureUnlocked()) return;
    setEditing(true);
    const firstEmpty = slots.findIndex((d) => d === null);
    activateSlot(firstEmpty === -1 ? null : firstEmpty);
  };

  return (
    <Card>
      <RaceHeader race={race} locked={raceLocked} />
      <CardContent className="p-4 sm:p-6">
        <form action={formAction} className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold">Your top 5</h3>
              <p className="text-sm text-muted-foreground">
                {raceLocked
                  ? prediction
                    ? "Locked in. Good luck!"
                    : "You didn't submit a prediction for this race."
                  : editable
                    ? "Search for a driver in a slot. Drag to reorder."
                    : "You can change your prediction until qualifying starts."}
              </p>
            </div>
            {prediction && !editable && !raceLocked && (
              <Button type="button" variant="secondary" size="sm" onClick={startEditing}>
                <Pencil /> Edit
              </Button>
            )}
            {editable && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={!hasAnyDriver}
                onClick={clearAll}
              >
                <Eraser /> Clear
              </Button>
            )}
          </div>

          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <ol className="space-y-2">
              {slots.map((driver, index) => (
                <Slot
                  key={index}
                  index={index}
                  driver={driver}
                  editable={editable}
                  active={editable && activeSlot === index}
                  dragging={draggedIndex !== null}
                  onActivate={() => activateSlot(index)}
                  onClear={() => clearSlot(index)}
                  search={
                    <SearchDriver
                      drivers={availableDrivers}
                      onSelect={(selected) => assignDriver(selected, index)}
                      autoFocus={focusSlotSearch}
                    />
                  }
                />
              ))}
            </ol>
            {/* The dragged driver floats above the list while its slot keeps a faded copy */}
            <DragOverlay dropAnimation={null}>
              {draggedIndex !== null && slots[draggedIndex] && (
                <DriverRow
                  driver={slots[draggedIndex]}
                  className="cursor-grabbing bg-card px-2 py-1 shadow-lg ring-1 ring-primary"
                />
              )}
            </DragOverlay>
          </DndContext>

          {editable && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <FormLoadingButton disabled={prediction ? !hasChanges : !hasAnyDriver}>
                {prediction ? "Update prediction" : "Save prediction"}
              </FormLoadingButton>
              {prediction && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

const RaceHeader = ({ race, locked }: { race: Race; locked: boolean }) => (
  <CardHeader className="relative rounded-t-lg border-b bg-muted/40 p-4 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Next race · {race.season}</p>
        <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">{race.name}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {race.city}, {race.country}
          </span>
          <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
            <CalendarDays className="h-4 w-4" />
            {format(race.date, "EEE d MMM, HH:mm")}
          </span>
        </div>
        <LockStatus lockedAt={race.lockedAt} locked={locked} />
      </div>
      {race.circuitImg && (
        <img
          src={race.circuitImg}
          alt={`${race.circuit} layout`}
          className="hidden h-24 w-auto shrink-0 opacity-80 dark:invert sm:block"
        />
      )}
    </div>
  </CardHeader>
);

export const LockStatus = ({ lockedAt, locked }: { lockedAt: Date | null; locked: boolean }) => {
  if (!lockedAt) return null;
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive dark:text-red-400">
        <Lock className="h-3.5 w-3.5" /> {LOCKED_MESSAGE}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
      title={format(lockedAt, "EEEE d MMMM, HH:mm")}
      suppressHydrationWarning
    >
      <Timer className="h-3.5 w-3.5" />
      Open · locks in {formatDistanceToNow(lockedAt)} ({format(lockedAt, "EEE d MMM, HH:mm")})
    </span>
  );
};

interface SlotProps {
  index: number;
  driver: Driver | null;
  editable: boolean;
  active: boolean;
  dragging: boolean;
  onActivate: () => void;
  onClear: () => void;
  search: ReactNode;
}

const Slot = ({ index, driver, editable, active, dragging, onActivate, onClear, search }: SlotProps) => {
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: index, disabled: !editable });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: index, disabled: !editable || !driver });

  // Only empty slots are picked by searching; filled ones are cleared with X or reordered by dragging
  const searching = active && !driver;

  return (
    <li
      ref={setDropRef}
      onClick={editable && !driver && !active ? onActivate : undefined}
      className={cn("flex items-center gap-3 rounded-lg border p-2 transition-colors", {
        "cursor-pointer hover:border-foreground/30": editable && !driver && !active && !dragging,
        "border-primary ring-1 ring-primary": searching && !dragging,
        "border-dashed": (editable && !driver) || dragging,
        "border-muted-foreground": dragging,
        "border-primary bg-accent": dragging && isOver,
      })}
    >
      <PositionBadge index={index} />
      {driver ? (
        editable ? (
          <DriverRow
            ref={setDragRef}
            {...listeners}
            {...attributes}
            tabIndex={-1}
            driver={driver}
            className={cn("cursor-grab touch-none active:cursor-grabbing", { "opacity-40": isDragging })}
          />
        ) : (
          <DriverRow driver={driver} />
        )
      ) : searching ? (
        <div className="min-w-0 flex-1">{search}</div>
      ) : (
        <button
          type="button"
          disabled={!editable}
          onClick={onActivate}
          className="flex h-10 flex-1 items-center text-left text-sm text-muted-foreground focus-visible:outline-none"
        >
          {editable ? "Empty. Tap to search for a driver" : "No driver picked"}
        </button>
      )}
      {editable && driver && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 shrink-0", { invisible: isDragging })}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          aria-label={`Remove ${driver.name} from P${index + 1}`}
        >
          <X />
        </Button>
      )}
    </li>
  );
};

interface DriverRowProps extends HTMLAttributes<HTMLDivElement> {
  driver: Driver;
  ref?: Ref<HTMLDivElement>;
}

const DriverRow = ({ driver, className, ...props }: DriverRowProps) => (
  <div className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-md", className)} {...props}>
    <DriverAvatar image={driver.image} name={driver.name} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm sm:text-base">{driver.name}</p>
      <p className="truncate text-xs text-muted-foreground sm:text-sm">{driver.team}</p>
    </div>
  </div>
);
