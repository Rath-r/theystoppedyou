"use client";

import dynamic from "next/dynamic";
import { useDashboardVisibility } from "@/components/DashboardContext";

const StopsMap = dynamic(() => import("@/components/StopsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[65vh] rounded-3xl bg-slate-950/80 border border-slate-800" />
  ),
});

type Stop = {
  id: string;
  driverId: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
  driverDisplayName?: string;
  driverColor?: string;
};

type DashboardMapProps = {
  stops: Stop[];
  activeDriver: string;
};

export default function DashboardMap({
  stops,
  activeDriver,
}: DashboardMapProps) {
  const { visibleDrivers } = useDashboardVisibility();

  const filteredStops = stops.filter(
    (stop) =>
      stop.driverId === activeDriver || visibleDrivers.includes(stop.driverId),
  );

  return <StopsMap stops={filteredStops} />;
}
