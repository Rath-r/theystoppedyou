"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Achievements from "@/components/Achievements";
import Footer from "@/components/Footer";
import SignOutButton from "@/components/SignOutButton";

const StopsMap = dynamic(() => import("@/components/StopsMap"), {
  ssr: false,
});

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

const calculateDaysDriving = (startDate: string) => {
  return Math.max(
    1,
    Math.ceil(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
};

export default function Dashboard({
  drivers,
  stops,
}: {
  drivers: Driver[];
  stops: Stop[];
}) {
  const activeDriver = drivers[0]?.id || "cigi";
  const currentDriver =
    drivers.find((d) => d.id === activeDriver) || drivers[0];
  const driverStops = stops.filter((s) => s.driverId === activeDriver);
  const daysDriving = calculateDaysDriving(
    currentDriver?.startDate || new Date().toISOString(),
  );

  const [visibleDrivers, setVisibleDrivers] = useState<string[]>([]);

  const countsByDriver = useMemo(() => {
    const m = new Map<string, number>();
    stops.forEach((s) => m.set(s.driverId, (m.get(s.driverId) || 0) + 1));
    return m;
  }, [stops]);

  const leaderboard = useMemo(() => {
    const entries = Array.from(countsByDriver.entries()).map(([id, c]) => ({
      id,
      count: c,
      name: drivers.find((d) => d.id === id)?.name || id,
    }));
    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, 3);
  }, [countsByDriver, drivers]);

  const friends = useMemo(() => {
    const map = new Map<string, { name: string; color?: string }>();
    stops.forEach((s) => {
      if (s.driverId === activeDriver) return;
      if (!map.has(s.driverId)) {
        map.set(s.driverId, {
          name: s.driverDisplayName || s.driverId,
          color: s.driverColor,
        });
      }
    });
    return Array.from(map.entries()).map(([id, v]) => ({
      id,
      name: v.name,
      color: v.color,
    }));
  }, [stops, drivers, activeDriver]);

  useEffect(() => {
    if (friends.length > 0 && visibleDrivers.length === 0) {
      setVisibleDrivers(friends.map((f) => f.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends]);

  const toggleDriverVisibility = (id: string) => {
    setVisibleDrivers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredStops = stops.filter(
    (s) => s.driverId === activeDriver || visibleDrivers.includes(s.driverId),
  );

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#0b0f19] text-white">
      {/* Left column: map + achievements */}
      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <div className="h-[65vh]">
          <StopsMap stops={filteredStops} />
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Šoféruješ už {daysDriving} dní
            </h2>
            <p className="text-sm text-slate-400">
              Zastavili ťa{" "}
              <strong className="text-white">{driverStops.length}×</strong>
            </p>
          </div>

          <Achievements stops={driverStops} daysDriving={daysDriving} />
        </div>

        <Footer />
      </div>

      {/* Right column: sidebar */}
      <aside className="w-80 h-full bg-slate-950 text-white border-l border-slate-900 p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-sm font-semibold tracking-wide text-slate-100">
                {currentDriver?.name?.charAt(0) || "?"}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  {currentDriver?.name}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Profil vodiča
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900/80 p-3">
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Dni na ceste
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-100">
                  {daysDriving}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-3">
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Zastavenia
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-100">
                  {driverStops.length}×
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Magneti — Top 3
            </h3>
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`rounded-2xl px-3 py-2 ${entry.id === activeDriver ? "bg-slate-900/80" : "bg-slate-900/50"}`}
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-100">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"} {entry.name}
                    </span>
                    <span className="text-slate-400">{entry.count}×</span>
                  </div>
                  {entry.id === activeDriver && (
                    <div className="mt-1 text-xs text-slate-400">To si ty!</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Sleduješ
            </h3>
            <div className="flex flex-col gap-2.5">
              {friends.length === 0 && (
                <div className="text-sm text-slate-500">Žiadni</div>
              )}
              {friends.map((f) => {
                const checked = visibleDrivers.includes(f.id);
                return (
                  <label
                    key={f.id}
                    className={`flex items-center gap-3 text-sm rounded-2xl px-3 py-2 transition-colors ${checked ? "bg-slate-900/80 text-white" : "bg-slate-900/50 text-slate-500"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDriverVisibility(f.id)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: f.color || "#94a3b8" }}
                    />
                    <span className="flex-1 text-left">{f.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-slate-900">
          <Link
            href="/add-stop"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white text-center transition duration-200 shadow-md shadow-blue-500/20 hover:bg-blue-500"
          >
            Pridať zastavenie
          </Link>
          <Link
            href="/settings"
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white py-2 transition duration-200"
          >
            <span>⚙️</span>
            Nastavenia profilu
          </Link>
          <SignOutButton className="w-full text-center text-xs text-slate-500 hover:text-red-400 bg-transparent px-0 py-1" />
        </div>
      </aside>
    </div>
  );
}
