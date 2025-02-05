"use client"
import FormLoadingButton from "@/components/FormLoadingButton";
import { Button } from "@/components/ui/button";
import { createPredictionAction, updatePredictionAction } from "@/lib/actions/predictions";
import { PredictionFull } from "@/lib/api/predictions/queries";
import { Driver } from "@/lib/db/schema/drivers";
import { Race } from "@/lib/db/schema/races";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
import { revalidatePath } from "next/cache";
import { useActionState, useState } from "react";
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
    const predictedDriverIds = [prediction?.pos1Driver?.id, prediction?.pos2Driver?.id, prediction?.pos3Driver?.id, prediction?.pos4Driver?.id, prediction?.pos5Driver?.id]
    const initialDrivers = prediction ? drivers.filter((driver) => !predictedDriverIds.includes(driver.id)) : [...drivers];
    const initialSelected = prediction ? drivers.filter((driver) => predictedDriverIds.includes(driver.id)) : Array.from({ length: 5 }, () => null)

    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>(initialDrivers);
    const [selectedDrivers, setSelectedDrivers] = useState<Array<Driver | null>>(initialSelected);
    const [editing, setEditing] = useState(false);

    // select driver, add to selected drivers and remove from available drivers
    const selectDriver = (driver: Driver, index: number) => {
        const newDrivers = [...selectedDrivers];
        newDrivers[index] = driver;
        setSelectedDrivers(newDrivers);
        setAvailableDrivers(availableDrivers.filter((d) => d.id !== driver.id));
    }

    // deselect driver, add back to available drivers and set selected driver to null
    const deselectDriver = (index: number) => () => {
        const driver = selectedDrivers[index];
        if (driver) {
            const newDrivers = [...selectedDrivers];
            newDrivers[index] = null;
            setSelectedDrivers(newDrivers);
            setAvailableDrivers([...availableDrivers, driver]);
        }
    }

    const onSubmit = async (_: any, formData: FormData) => {
        if (prediction) {
            await updatePredictionAction({
                id: prediction.id,
                raceId: prediction.race.id,
                pos1Driver: selectedDrivers[0] ? selectedDrivers[0].number : null,
                pos2Driver: selectedDrivers[1] ? selectedDrivers[1].number : null,
                pos3Driver: selectedDrivers[2] ? selectedDrivers[2].number : null,
                pos4Driver: selectedDrivers[3] ? selectedDrivers[3].number : null,
                pos5Driver: selectedDrivers[4] ? selectedDrivers[4].number : null,
            })
        } else {
            await createPredictionAction({
                raceId: race.id,
                // TODO change to varchar and use id insead of number
                pos1Driver: selectedDrivers[0] ? selectedDrivers[0].number : null,
                pos2Driver: selectedDrivers[1] ? selectedDrivers[1].number : null,
                pos3Driver: selectedDrivers[2] ? selectedDrivers[2].number : null,
                pos4Driver: selectedDrivers[3] ? selectedDrivers[3].number : null,
                pos5Driver: selectedDrivers[4] ? selectedDrivers[4].number : null,
            })
        }
        revalidatePath("/predictions");
        return
    };

    const [state, formAction] = useActionState(onSubmit, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <div className="flex items-center gap-4">
                <div>
                    <p className="text-xl">{race.name}</p>
                    <p className="text-sm text-muted-foreground">{race.date.toLocaleString()}</p>
                </div>
                <Button className={cn({ "invisible": editing })} type="button" onClick={() => setEditing(true)} variant={"secondary"}>Edit</Button>
            </div>
            {positions.map((position, index) => (
                <div key={index} className="flex gap-2 items-center">
                    <Label className="w-10">{position}</Label>
                    {editing && (
                        <SearchDriver drivers={availableDrivers} onSelect={(driver: Driver) => selectDriver(driver, index)} />
                    )}
                    {selectedDrivers[index] && (
                        <DriverComponent driver={selectedDrivers[index]} />
                    )}
                    {editing && selectedDrivers[index] && (
                        <Button type="button" onClick={deselectDriver(index)} variant={"outline"} size={"icon"} tabIndex={-1}>
                            <X size={16} />
                        </Button>
                    )}
                </div>
            ))}
            {prediction ? editing && (
                <div className="space-x-2">
                    <FormLoadingButton>Update Prediction</FormLoadingButton>
                    <Button type="button" onClick={() => setEditing(false)} variant={"ghost"}>Cancel</Button>
                </div>
            ) : (
                <FormLoadingButton>Create Prediction</FormLoadingButton>
            )}
        </form>
    )
}