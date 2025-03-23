"use client";

import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouteHistory } from "@/lib/context/RouteHistoryContext";
import { seasons } from "@/lib/utils";

export function useBackPath() {
  const { previousRoute } = useRouteHistory();
  if (previousRoute) {
    const segments = previousRoute.split("/");
    if (segments[1] === "drivers" && seasons.includes(Number(segments[2]))) {
      return previousRoute;
    }
  }
  return "/drivers/2025";
}

export default function DriverBackButton() {
  const backPath = useBackPath();
  console.log(backPath);

  return (
    <Button variant={"ghost"} asChild>
      <Link href={backPath}>
        <ChevronLeftIcon />
      </Link>
    </Button>
  );
}
