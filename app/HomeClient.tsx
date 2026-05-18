"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Link from "next/link";
import Achievements from "@/components/Achievements";
import { useMemo, useState } from "react";

const StopsMap = dynamic(() => import("@/components/StopsMap"), {
  ssr: false,
});

type Driver = {
  id: string;
  name: string;
  startDate: string;
};

type Stop = {
  id: string;
  driverId: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
};

const calculateDaysDriving = (startDate: string) => {
  return Math.max(
    1,
    Math.ceil(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
};

type HomeClientProps = {
  drivers: Driver[];
  stops: Stop[];
};

export default function HomeClient({ drivers, stops }: HomeClientProps) {
  const activeDriver = drivers[0]?.id || "cigi";
  const currentDriver =
    drivers.find((d) => d.id === activeDriver) || drivers[0];

  const driverStops = stops.filter((s) => s.driverId === activeDriver);
  const daysDriving = calculateDaysDriving(currentDriver.startDate);

  const [highlightedDriver, setHighlightedDriver] = useState<string | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Build leaderboard counts per driver
  const countsByDriver = useMemo(() => {
    const m = new Map<string, number>();
    stops.forEach((s) => {
      m.set(s.driverId, (m.get(s.driverId) || 0) + 1);
    });
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

  // Unique other drivers (friends) from stops
  const friends = useMemo(() => {
    const set = new Set<string>();
    stops.forEach((s) => {
      if (s.driverId !== activeDriver) set.add(s.driverId);
    });
    return Array.from(set).map((id) => ({
      id,
      name: drivers.find((d) => d.id === id)?.name || id,
    }));
  }, [stops, drivers, activeDriver]);

  const toggleHighlight = (id: string) => {
    setHighlightedDriver((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      {/* Left: Map + Achievements */}
      <div className="flex-1 relative h-full">
        {/* Mobile hamburger to open sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 right-4 z-40 bg-slate-800/80 p-2 rounded-lg"
          aria-label="Open sidebar"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <StopsMap stops={stops} highlightedDriver={highlightedDriver} />
          </div>

          <div className="p-6 bg-slate-950">
            <Achievements stops={driverStops} daysDriving={daysDriving} />
          </div>

          <Footer />
        </div>
      </div>

      {/* Right: Sidebar (desktop) */}
      <aside className="hidden md:flex w-80 h-full bg-slate-900 border-l border-slate-800 p-6 flex-col gap-6 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold mb-2">Magneti — Top 3</h3>
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div key={entry.id} className="text-sm">
                <span className="mr-2">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                </span>
                <span className={entry.id === activeDriver ? "font-bold" : ""}>
                  {entry.name} ({entry.count}x)
                </span>
                {entry.id === activeDriver && (
                  <span className="text-xs text-slate-400"> — To si ty!</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2">
          <h3 className="text-sm font-semibold mb-2">Sleduješ</h3>
          <div className="flex flex-col gap-2">
            {friends.length === 0 && (
              <div className="text-sm text-slate-400">Žiadni</div>
            )}
            {friends.map((f) => (
              <button
                key={f.id}
                onClick={() => toggleHighlight(f.id)}
                className={`text-left text-sm p-2 rounded ${highlightedDriver === f.id ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"}`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-slate-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                  {currentDriver.name?.charAt(0) || "?"}
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400"
              >
                Zavrieť
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Magneti — Top 3</h3>
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.id} className="text-sm">
                    <span className="mr-2">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </span>
                    <span
                      className={entry.id === activeDriver ? "font-bold" : ""}
                    >
                      {entry.name} ({entry.count}x)
                    </span>
                    {entry.id === activeDriver && (
                      <span className="text-xs text-slate-400">
                        {" "}
                        — To si ty!
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Sleduješ</h3>
              <div className="flex flex-col gap-2">
                {friends.length === 0 && (
                  <div className="text-sm text-slate-400">Žiadni</div>
                )}
                {friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggleHighlight(f.id)}
                    className={`text-left text-sm p-2 rounded ${highlightedDriver === f.id ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
