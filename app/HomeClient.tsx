"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Link from "next/link";
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

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold">{currentDriver.name}</div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex gap-4">
              <Link
                href="/logbook"
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Logbook
              </Link>
              <Link
                href="/add-stop"
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Pridať zastavenie
              </Link>
              <Link
                href="/settings"
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Nastavenia profilu
              </Link>
            </nav>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Šoféruješ už {daysDriving} dní</h1>
          <p className="text-lg">
            Zastavili ťa <b>{driverStops.length}×</b> – tu všade 👮
          </p>
        </div>
      </header>

      <StopsMap stops={stops} />

      <Achievements stops={driverStops} daysDriving={daysDriving} />

      <Footer />
    </main>
  );
}
