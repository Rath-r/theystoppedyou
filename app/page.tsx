"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Link from "next/link";
import drivers from "@/data/drivers.json";
import stops from "@/data/stops.json";
import Achievements from "@/components/Achievements";

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

export default function Home() {
  const [activeDriver, setActiveDriver] = useState<string>("cigi");
  const [showDrivers, setShowDrivers] = useState(false);

  const currentDriver = (drivers as Driver[]).find(
    (d) => d.id === activeDriver,
  )!;

  const driverStops = (stops as Stop[]).filter(
    (s) => s.driverId === activeDriver,
  );

  const daysDriving = calculateDaysDriving(currentDriver.startDate);

  const handleToggleDrivers = () => {
    if (showDrivers) {
      // Closing drivers view - go back to Cigi
      setActiveDriver("cigi");
    }
    setShowDrivers(!showDrivers);
  };

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            {showDrivers ? (
              (drivers as Driver[]).map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => setActiveDriver(driver.id)}
                  className={`px-2 py-1 text-xs transition-colors ${
                    activeDriver === driver.id
                      ? "font-bold text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {driver.name}
                </button>
              ))
            ) : (
              <div className="text-xs font-bold">{currentDriver.name}</div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <nav>
              <Link
                href="/logbook"
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Logbook
              </Link>
            </nav>

            <button
              onClick={handleToggleDrivers}
              aria-label="Toggle drivers"
              className="ml-2 h-7 w-7 flex items-center justify-center border border-gray-300 rounded text-xs text-gray-700 bg-white"
            >
              S
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {currentDriver.name} šoféruje už {daysDriving} dní
          </h1>
          <p className="text-lg">
            Zastavili ho <b>{driverStops.length}×</b> – tu všade 👮
          </p>
        </div>
      </header>

      <StopsMap stops={driverStops} />

      <Achievements stops={driverStops} daysDriving={daysDriving} />

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Zoznam</h2>
        <ul className="space-y-2">
          {driverStops
            .slice()
            .sort((a, b) => {
              const dateA = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
              const dateB = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
              return dateB - dateA;
            })
            .map((s) => (
              <li key={s.id} className="rounded-xl border p-3">
                <div className="font-semibold">{s.label}</div>
                {s.occurredAt && (
                  <div className="text-sm opacity-80">
                    {new Date(s.occurredAt).toLocaleString("sk-SK")}
                  </div>
                )}
                {s.note ? <div className="mt-1">{s.note}</div> : null}
              </li>
            ))}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
