import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getDriverById } from "@/lib/api/drivers/queries";
import OptimisticDriver from "./OptimisticDriver";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";
import { getCanEditDrivers } from "@/lib/api/userPermissions/queries";

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
        <BackButton currentResource="drivers" />
        <OptimisticDriver driver={driver} canEdit={canEdit} />
      </div>
    </Suspense>
  );
};
