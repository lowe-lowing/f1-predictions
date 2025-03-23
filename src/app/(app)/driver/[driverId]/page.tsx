import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getDriverById } from "@/lib/api/drivers/queries";
import OptimisticDriver from "./OptimisticDriver";

import Loading from "@/app/loading";
import { BackButton } from "@/components/shared/BackButton";
import { getCanEditDrivers } from "@/lib/api/userPermissions/queries";
import DriverBackButton from "@/app/(app)/driver/[driverId]/DriverBackButton";

export const revalidate = 0;

export default async function DriverPage({ params }: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await params;

  return (
    <main className="overflow-auto">
      <Driver id={driverId} />
    </main>
  );
}

const Driver = async ({ id }: { id: string }) => {
  const { driver } = await getDriverById(id);
  if (!driver) notFound();

  const canEdit = await getCanEditDrivers();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        {/* <BackButton currentResource="drivers" /> */}
        <DriverBackButton />
        <OptimisticDriver driver={driver} canEdit={canEdit} />
      </div>
    </Suspense>
  );
};
