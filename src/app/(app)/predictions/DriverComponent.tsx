import { PredictionFull } from "@/lib/api/predictions/queries";
import { Driver } from "@/lib/db/schema/drivers";
import type { FC } from "react";

type DriverComponentProps = {
  driver: Driver | NonNullable<PredictionFull["pos1Driver"]>;
};

export const DriverComponent: FC<DriverComponentProps> = ({ driver }) => {
  return (
    <div className="flex gap-2 items-center">
      {driver.image && <img src={driver.image} alt={`No Picture`} className="h-10 w-10 text-xs sm:h-14 sm:w-14" />}
      <div className="text-left">
        <div className="text-sm sm:text-lg">{driver.name}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">{driver.team}</div>
      </div>
    </div>
  );
};
