import { Suspense } from "react";

import Loading from "@/app/loading";
import DriverList from "@/components/drivers/DriverList";
import { getDriversOrderedByTeam } from "@/lib/api/drivers/queries";
import { getCanEditDrivers } from "@/lib/api/userPermissions/queries";

export const revalidate = 0;

export default async function DriversPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Drivers</h1>
        </div>
        <Drivers />
      </div>
    </main>
  );
}

const Drivers = async () => {
  const { drivers } = await getDriversOrderedByTeam();

  const canEdit = await getCanEditDrivers();
  return (
    <Suspense fallback={<Loading />}>
      <DriverList drivers={drivers} canEdit={canEdit} />
    </Suspense>
  );
};
