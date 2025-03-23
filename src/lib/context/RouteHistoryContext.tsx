"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type RouteHistoryContextType = {
  previousRoute: string | null;
  currentRoute: string;
};

const RouteHistoryContext = createContext<RouteHistoryContextType>({
  previousRoute: null,
  currentRoute: "/",
});

export function RouteHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [routeHistory, setRouteHistory] = useState<{
    previousRoute: string | null;
    currentRoute: string;
  }>({
    previousRoute: null,
    currentRoute: "/",
  });

  useEffect(() => {
    // Skip initial render
    if (pathname === routeHistory.currentRoute) return;

    // Update route history when the route changes
    setRouteHistory((prevState) => ({
      previousRoute: prevState.currentRoute,
      currentRoute: pathname,
    }));
  }, [pathname]);

  return <RouteHistoryContext.Provider value={routeHistory}>{children}</RouteHistoryContext.Provider>;
}

export const useRouteHistory = () => useContext(RouteHistoryContext);
