"use client"
import FormLoadingButton from "@/components/FormLoadingButton";
import { Input } from "@/components/ui/input";
import { createPredictionAction } from "@/lib/actions/predictions";
import { Driver } from "@/lib/db/schema/drivers";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useActionState } from "react";
import SearchDriver from "./SearchDriver";

let initialState: void;

interface CreatePredictionFormProps {
    drivers: Driver[];
}

export default function CreatePredictionForm({ drivers }: CreatePredictionFormProps) {
    const onSubmit = async (_: any, formData: FormData) => {
        const raceId = formData.get("raceId") as string;
        const pos1Driver = formData.get("pos1Driver") as string | null;
        const pos2Driver = formData.get("pos2Driver") as string | null;
        const pos3Driver = formData.get("pos3Driver") as string | null;
        const pos4Driver = formData.get("pos4Driver") as string | null;
        const pos5Driver = formData.get("pos5Driver") as string | null;

        await createPredictionAction({
            raceId: parseInt(raceId),
            pos1Driver: pos1Driver ? parseInt(pos1Driver) : null,
            pos2Driver: pos2Driver ? parseInt(pos2Driver) : null,
            pos3Driver: pos3Driver ? parseInt(pos3Driver) : null,
            pos4Driver: pos4Driver ? parseInt(pos4Driver) : null,
            pos5Driver: pos5Driver ? parseInt(pos5Driver) : null,
        })
    };

    const [state, formAction] = useActionState(onSubmit, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <Label>Race</Label>
                <Input type="text" name="raceId" placeholder="Enter Race" />
            </div>
            <div className="flex gap-2 items-center">
                <Label>1st</Label>
                <SearchDriver drivers={drivers} />
                {/* <Input type="text" name="pos1Driver" placeholder="Who will take 1st position?" /> */}
            </div>
            <div className="flex gap-2 items-center">
                <Label>2nd</Label>
                <SearchDriver drivers={drivers} />
                {/* <Input type="text" name="pos2Driver" placeholder="Who will take 2nd position?" /> */}
            </div>
            <div className="flex gap-2 items-center">
                <Label>3rd</Label>
                <SearchDriver drivers={drivers} />
                {/* <Input type="text" name="pos3Driver" placeholder="Who will take 3rd position?" /> */}
            </div>
            <div className="flex gap-2 items-center">
                <Label>4th</Label>
                <SearchDriver drivers={drivers} />
                {/* <Input type="text" name="pos4Driver" placeholder="Who will take 4th position?" /> */}
            </div>
            <div className="flex gap-2 items-center">
                <Label>5th</Label>
                <SearchDriver drivers={drivers} />
                {/* <Input type="text" name="pos5Driver" placeholder="Who will take 5th position?" /> */}
            </div>
            <FormLoadingButton>Create Prediction</FormLoadingButton>
        </form>
    )
}