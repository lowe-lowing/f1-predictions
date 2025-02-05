import { Driver } from "@/lib/db/schema/drivers";
import type { FC } from "react";

type DriverComponentProps = {
    driver: Driver;
};

export const DriverComponent: FC<DriverComponentProps> = ({ driver }) => {
    return (
        <div className="flex gap-2 items-center">
            {driver.image && <img src={driver.image} alt="" className="h-8 w-8" />}
            <div className="text-left">
                <div className="text-sm">{driver.name}</div>
                <div className="text-xs text-muted-foreground">{driver.team}</div>
            </div>
        </div>
    );
}