import React from "react";
import { getDrivers, fetchStops } from "@/lib/data";
import { auth } from "@/auth";
import DashboardShell from "@/components/DashboardShell";

type Driver = { id: string; name: string; startDate: string };

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  const userId = Number(session.user?.id);
  const [driversRows, stopsRows] = await Promise.all([
    getDrivers(),
    fetchStops(userId),
  ]);

  const currentDriverRecord = driversRows.find(
    (d) => d.owner_user_id === userId,
  );

  if (!currentDriverRecord) {
    return <>{children}</>;
  }

  const driverLookup = new Map<number, string>();
  driversRows.forEach((driver) => {
    driverLookup.set(driver.id, driver.slug);
  });

  const drivers: Driver[] = [
    {
      id: currentDriverRecord.slug,
      name: currentDriverRecord.display_name,
      startDate: currentDriverRecord.start_date || "",
    },
  ];

  const stops: Stop[] = stopsRows.map((s) => ({
    id: String(s.id),
    driverId: driverLookup.get(s.driver_id) || currentDriverRecord.slug,
    occurredAt: s.occurred_at || undefined,
    lat: s.lat,
    lng: s.lng,
    label: s.label,
    note: s.note || undefined,
    driverDisplayName: s.driverName || currentDriverRecord.display_name,
    driverColor: s.driverColor || "#3b82f6",
  }));

  const driverStops = stops.filter(
    (s) => s.driverId === currentDriverRecord.slug,
  );

  const countsByDriver = new Map<string, number>();
  stops.forEach((s) => {
    countsByDriver.set(s.driverId, (countsByDriver.get(s.driverId) || 0) + 1);
  });

  const leaderboard = Array.from(countsByDriver.entries())
    .map(([id, count]) => ({
      id,
      count,
      name: driversRows.find((d) => d.slug === id)?.display_name || id,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const friendsMap = new Map<string, { name: string; color?: string }>();
  stops.forEach((stop) => {
    if (stop.driverId === currentDriverRecord.slug) return;
    if (!friendsMap.has(stop.driverId)) {
      friendsMap.set(stop.driverId, {
        name: stop.driverDisplayName || stop.driverId,
        color: stop.driverColor,
      });
    }
  });

  const friends = Array.from(friendsMap.entries()).map(([id, value]) => ({
    id,
    name: value.name,
    color: value.color,
  }));

  return (
    <DashboardShell
      currentDriver={drivers[0]}
      driverStops={driverStops}
      leaderboard={leaderboard}
      friends={friends}
    >
      {children}
    </DashboardShell>
  );
}
