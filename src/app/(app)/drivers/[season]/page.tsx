import { Suspense } from "react";

import Loading from "@/app/loading";
import DriverList from "@/components/drivers/DriverList";
import { getDriversOrderedByTeamBySeason } from "@/lib/api/drivers/queries";
import { getCanEditDrivers } from "@/lib/api/userPermissions/queries";

export const revalidate = 0;

export default async function DriversPage({ params }: { params: Promise<{ season: string }> }) {
  const { season } = await params;
  return (
    // <main>
    //   <div className="relative space-y-4">
    //     <div className="flex justify-between">
    //       <h1 className="font-semibold text-2xl my-2">Drivers</h1>
    //     </div>
    //   </div>
    // </main>
    <Drivers season={season} />
  );
}

const Drivers = async ({ season }: { season: string }) => {
  const { drivers } = await getDriversOrderedByTeamBySeason(parseInt(season));

  const canEdit = await getCanEditDrivers();
  return (
    <Suspense fallback={<Loading />}>
      <DriverList drivers={drivers} canEdit={canEdit} />
    </Suspense>
  );
};
