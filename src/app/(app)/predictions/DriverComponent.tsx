import { PredictionFull } from "@/lib/api/predictions/queries";
import { Driver } from "@/lib/db/schema/drivers";
import { cn } from "@/lib/utils";
import type { FC } from "react";

interface DriverComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  driver: Driver | NonNullable<PredictionFull["pos1Driver"]>;
}

export const DriverComponent: FC<DriverComponentProps> = ({ driver, className, ...props }) => {
  return (
    <div className={cn("flex gap-2 items-center", className)} {...props}>
      {driver.image && <img src={driver.image} alt={`No Picture`} className="h-10 w-10 text-xs sm:h-14 sm:w-14" />}
      <div className="text-left mt-1">
        <div className="text-sm sm:text-lg/4">{driver.name}</div>
        <div className="text-xs sm:text-sm sm:mt-1 text-muted-foreground">{driver.team}</div>
      </div>
    </div>
  );
};
